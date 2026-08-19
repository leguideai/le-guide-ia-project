import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || "Le Guide IA <samba@leguideai.com>"

export async function POST(req: Request) {
  try {
    const { courseSlug, courseTitle, price, fullName, email, whatsapp, country, transactionRef, mobileOperator } = await req.json()

    if (!email || !fullName || !courseSlug) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const rawRef = transactionRef ? transactionRef.trim() : ""

    if (!rawRef) {
      return NextResponse.json({ message: "Veuillez renseigner la référence de transaction ou votre numéro expéditeur." }, { status: 400 })
    }

    // 1. Unicité de la référence de transaction : vérifier si elle existe déjà dans payments
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

    // 2. Gestion de l'inscription dans 'registrations' (Select puis Insert/Update pour éviter l'erreur ON CONFLICT 42P10)
    let registrationId: string | null = null
    const { data: existingReg } = await supabaseServer
      .from("registrations")
      .select("id")
      .eq("email", emailClean)
      .maybeSingle()

    if (existingReg) {
      registrationId = existingReg.id
      await supabaseServer
        .from("registrations")
        .update({
          full_name: fullName,
          whatsapp,
          country: country || "CI",
          source: "checkout_mobile_direct"
        })
        .eq("id", existingReg.id)
    } else {
      const { data: newReg, error: regErr } = await supabaseServer
        .from("registrations")
        .insert({
          full_name: fullName,
          email: emailClean,
          whatsapp,
          country: country || "CI",
          source: "checkout_mobile_direct",
          status: "inscrit"
        })
        .select("id")
        .single()

      if (regErr) {
        console.warn("Registration insert note:", regErr.message)
      }
      if (newReg) {
        registrationId = newReg.id
      }
    }

    // 3. Enregistrement du paiement avec statut 'pending' (conforme à la contrainte CHECK de status: 'pending', 'confirmed', 'failed')
    const { data: payment, error: payError } = await supabaseServer
      .from("payments")
      .insert({
        registration_id: registrationId,
        amount: price || 49000,
        currency: "XOF",
        method: `mobile_direct_${mobileOperator || "wave"}`,
        status: "pending", // check constraint: pending, confirmed, failed
        transaction_ref: rawRef,
      })
      .select("id")
      .single()

    if (payError) {
      console.error("Error creating payment record:", payError)
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

    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [emailClean],
          reply_to: "samba@leguideai.com",
          subject: `⏳ Demande reçue — Activation sous 24h : ${courseTitle}`,
          text: `Bonjour ${fullName},\n\nNous avons bien enregistré votre demande d'accès pour la formation : ${courseTitle}.\nDétails : ${operatorName} - Référence : ${rawRef}.\n\nNotre équipe procède à la vérification sous 24h.\n\nÀ très vite,\nL'équipe LE GUIDE IA`,
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
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
                  <li><strong>Opérateur :</strong> ${operatorName}</li>
                  <li><strong>Montant :</strong> ${price ? Number(price).toLocaleString('fr-FR') : "49 000"} FCFA</li>
                  <li><strong>Référence / N° de transaction :</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${rawRef}</code></li>
                </ul>
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
      } catch (emailErr) {
        console.warn("Failed to send direct mobile pending email:", emailErr)
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
