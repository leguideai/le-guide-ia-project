import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"
import { sendAdminNewEnrollmentNotification } from "@/lib/email"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || "Alfred Dah — LE GUIDE IA <alfred@leguideai.com>"

export async function POST(req: Request) {
  try {
    const { 
      courseSlug, 
      courseTitle, 
      courseId,
      price, 
      originalPrice,
      subscriptionCredit,
      subscriptionPlan,
      fullName, 
      email, 
      whatsapp, 
      country, 
      transactionRef, 
      mobileOperator,
      receiptUrl 
    } = await req.json()

    if (!email || !fullName || !courseSlug) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    let rawRef = transactionRef ? transactionRef.trim() : ""

    if (!rawRef && !receiptUrl) {
      return NextResponse.json({ message: "Veuillez fournir la référence de transaction ou téléverser votre capture d'écran de paiement." }, { status: 400 })
    }

    if (!rawRef && receiptUrl) {
      rawRef = `REC-${Date.now().toString().slice(-6)}`
    }

    // 1. Unicité de la référence de transaction : vérifier si elle existe déjà dans payments (sauf auto-généré)
    if (!rawRef.startsWith("REC-")) {
      const { data: existingPay } = await supabaseServer
        .from("payments")
        .select("id, transaction_ref")
        .eq("transaction_ref", rawRef)
        .maybeSingle()

      if (existingPay) {
        return NextResponse.json({
          success: false,
          message: "Cette référence de transaction a déjà été enregistrée par un autre participant. Veuillez vérifier votre référence ou contacter l'équipe support sur WhatsApp."
        }, { status: 400 })
      }
    }

    // 2. Gestion de l'inscription dans 'registrations'
    let registrationId: string | null = null
    const { data: existingRegs } = await supabaseServer
      .from("registrations")
      .select("id")
      .ilike("email", emailClean)
      .order("created_at", { ascending: false })
      .limit(1)

    const existingReg = existingRegs && existingRegs.length > 0 ? existingRegs[0] : null

    const regNotesObj: any = {
      course_slug: courseSlug,
      course_title: courseTitle,
      transaction_ref: rawRef,
      receipt_url: receiptUrl || undefined,
      payment_method: `mobile_direct_${mobileOperator || "wave"}`,
      original_price: originalPrice || price,
      subscription_deduction: subscriptionCredit || 0,
      subscription_plan: subscriptionPlan || undefined,
      final_price_paid: price,
      email: emailClean,
      full_name: fullName,
      whatsapp,
      country: country || "CI",
      submitted_at: new Date().toISOString()
    }

    const regPayload: any = {
      full_name: fullName,
      email: emailClean,
      whatsapp,
      country: country || "CI",
      source: "checkout_mobile_direct",
      course_slug: courseSlug,
      status: "inscrit",
      notes: JSON.stringify(regNotesObj)
    }
    if (courseId) regPayload.course_id = courseId

    if (existingReg) {
      registrationId = existingReg.id
      const { error: updErr } = await supabaseServer
        .from("registrations")
        .update(regPayload)
        .eq("id", existingReg.id)

      if (updErr) {
        console.warn("Registration update with full payload failed, retrying basic:", updErr.message)
        await supabaseServer
          .from("registrations")
          .update({
            full_name: fullName,
            whatsapp,
            country: country || "CI",
            status: "inscrit"
          })
          .eq("id", existingReg.id)
      }
    } else {
      const { data: newReg, error: regErr } = await supabaseServer
        .from("registrations")
        .insert(regPayload)
        .select("id")
        .maybeSingle()

      if (regErr) {
        console.warn("Registration insert note (retrying with safe basic fields):", regErr.message)
        const safePayload = {
          full_name: fullName,
          email: emailClean,
          whatsapp,
          country: country || "CI",
          source: "checkout_mobile_direct",
          status: "inscrit"
        }
        const { data: retryNewReg, error: safeErr } = await supabaseServer
          .from("registrations")
          .insert(safePayload)
          .select("id")
          .maybeSingle()

        if (retryNewReg) {
          registrationId = retryNewReg.id
        } else if (safeErr) {
          console.warn("Safe registration insert error:", safeErr.message)
        }
      } else if (newReg) {
        registrationId = newReg.id
      }

      if (!registrationId) {
        const { data: fallbackReg } = await supabaseServer
          .from("registrations")
          .select("id")
          .ilike("email", emailClean)
          .order("created_at", { ascending: false })
          .limit(1)
        if (fallbackReg && fallbackReg.length > 0) {
          registrationId = fallbackReg[0].id
        }
      }
    }

    // 3. Enregistrement du paiement avec statut 'pending' (table payments n'a pas de colonne 'notes')
    const paymentPayload: any = {
      registration_id: registrationId,
      amount: price !== undefined && price !== null && !isNaN(Number(price)) ? Number(price) : 49000,
      currency: "XOF",
      method: `mobile_direct_${mobileOperator || "wave"}`,
      status: "pending",
      transaction_ref: rawRef,
      course_title: courseTitle || courseSlug,
      payment_method: "Mobile Money"
    }
    if (courseId) paymentPayload.course_id = courseId

    let { data: payment, error: payError } = await supabaseServer
      .from("payments")
      .insert(paymentPayload)
      .select("id")
      .single()

    if (payError) {
      console.error("Error creating payment record:", payError.message, payError.code)
      // Fallback: insert without registration_id in case of FK constraint
      const { registration_id: _rid, ...payloadNoFK } = paymentPayload
      const { data: retryPay, error: retryErr } = await supabaseServer
        .from("payments")
        .insert(payloadNoFK)
        .select("id")
        .single()

      if (retryErr) {
        console.error("Fallback payment insert also failed:", retryErr.message)
      } else {
        payment = retryPay
      }
    }

    // 4. Enregistrement de l'accès en statut 'pending_verification' dans user_courses
    try {
      await supabaseServer.from("user_courses").upsert({
        user_email: emailClean,
        course_slug: courseSlug,
        status: "pending_verification",
        amount_paid: price,
        payment_method: `mobile_direct_${mobileOperator || "wave"}`,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_email,course_slug" })
    } catch (ucErr) {
      console.warn("user_courses pending upsert warning:", ucErr)
    }

    // 5. Envoi d'email automatique de confirmation de réception (Validation sous 24h)
    const operatorName = mobileOperator === "orange_money" ? "Orange Money" : mobileOperator === "mtn_momo" ? "MTN MoMo" : "Wave"
    const hasDeduction = subscriptionCredit && Number(subscriptionCredit) > 0
    const formattedOriginal = originalPrice ? `${Number(originalPrice).toLocaleString('fr-FR')} FCFA` : `${(Number(price || 0) + Number(subscriptionCredit || 0)).toLocaleString('fr-FR')} FCFA`
    const formattedDeduction = hasDeduction ? `${Number(subscriptionCredit).toLocaleString('fr-FR')} FCFA` : ""
    const formattedFinal = price ? `${Number(price).toLocaleString('fr-FR')} FCFA` : "49 000 FCFA"

    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [emailClean],
          replyTo: "alfred@leguideai.com",
          subject: `⏳ Demande reçue — Activation sous 24h : ${courseTitle}`,
          text: `Bonjour ${fullName},\n\nNous avons bien enregistré votre demande d'accès pour la formation : ${courseTitle}.\n${hasDeduction ? `Tarif catalogue : ${formattedOriginal}\nDéduction Membre Cercle IA (${subscriptionPlan || 'Abonnement Actif'}) : -${formattedDeduction} (100% Déduit)\nNet payé : ${formattedFinal}\n` : `Montant : ${formattedFinal}\n`}Opérateur : ${operatorName} - Référence : ${rawRef}.\n\nNotre équipe procède à la vérification sous 24h.\n\nÀ très vite,\nL'équipe LE GUIDE IA`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #0284c7; margin: 0; font-size: 22px;">LE GUIDE IA</h1>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Plateforme d'Excellence & Masterclasses IA</p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Bonjour ${fullName},</h3>
                <p>Nous avons bien enregistré votre demande d'accès pour la formation :</p>
                <p style="font-size: 16px; font-weight: bold; color: #0284c7; margin: 8px 0;">${courseTitle}</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">Détails de votre déclaration de virement :</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8;">
                  <li><strong>Opérateur :</strong> ${operatorName}</li>
                  ${hasDeduction ? `
                  <li><strong>Tarif catalogue Bootcamp :</strong> <span style="text-decoration: line-through; color: #64748b;">${formattedOriginal}</span></li>
                  <li><strong>Déduction Membre Cercle IA :</strong> <span style="color: #16a34a; font-weight: bold;">-${formattedDeduction} (${subscriptionPlan || 'Abonnement Actif'})</span></li>
                  <li><strong>Net payé :</strong> <strong style="color: #0284c7; font-size: 15px;">${formattedFinal}</strong></li>
                  ` : `
                  <li><strong>Montant :</strong> ${formattedFinal}</li>
                  `}
                  <li><strong>Référence / N° de transaction :</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${rawRef}</code></li>
                </ul>

                ${hasDeduction ? `
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-top: 14px; font-size: 13px; color: #15803d;">
                    🎁 <strong>Avantage Cercle IA activé :</strong> Votre mensualité d'abonnement en cours a été <strong>intégralement déduite (100%)</strong> du tarif de votre Bootcamp !
                  </div>
                ` : ''}
              </div>

              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <h4 style="color: #b45309; margin-top: 0; font-size: 15px;">⏳ Vérification en cours (Délai : Moins de 24h)</h4>
                <p style="font-size: 13px; color: #92400e; margin-bottom: 0;">
                  Notre équipe administrative vérifie actuellement la réception effective de votre transfert. Dès validation de votre paiement, vos accès à l'espace membre seront automatiquement activés et vous recevrez un email de confirmation.
                </p>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Vous souhaitez accélérer la validation ?</p>
                <a href="https://wa.me/22605050577?text=${encodeURIComponent(`Bonjour Alfred, je viens d'effectuer le transfert Mobile Money (${operatorName}) pour la formation "${courseTitle}" avec la référence : ${rawRef}. Pouvez-vous valider mon accès ? Merci !`)}" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                  Confirmer mon reçu sur WhatsApp
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Le Guide IA — Équipe Support & Accompagnement<br />
                WhatsApp Support : +226 0505 0577 · alfred@leguideai.com
              </p>
            </div>
          `,
        })

        // 6. Envoi de la notification par email à l'administrateur
        await sendAdminNewEnrollmentNotification({
          fullName,
          email: emailClean,
          whatsapp,
          country,
          courseTitle: courseTitle || courseSlug,
          courseSlug,
          amount: price || 49000,
          originalPrice: originalPrice || (hasDeduction ? Number(price) + Number(subscriptionCredit) : undefined),
          subscriptionCredit: subscriptionCredit || 0,
          subscriptionPlan: subscriptionPlan || undefined,
          paymentMethod: `Mobile Money (${operatorName})`,
          transactionRef: rawRef,
          receiptUrl: receiptUrl || null
        })
      } catch (emailErr) {
        console.warn("Failed to send direct mobile pending email or admin notification:", emailErr)
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

    return NextResponse.json({
      success: true,
      ref: rawRef,
      status: "pending",
      message: "Votre demande de paiement a été enregistrée. Validation sous 24h.",
      redirectUrl: `${baseUrl}/checkout/success?ref=${rawRef}&method=mobile_direct`,
    })

  } catch (error: any) {
    console.error("Mobile Direct payment error:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur." }, { status: 500 })
  }
}
