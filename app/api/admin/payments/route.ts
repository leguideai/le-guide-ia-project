import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET() {
  try {
    const { data: rawPayments } = await supabaseServer
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: rawRegs } = await supabaseServer
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })

    const regMap = new Map((rawRegs || []).map(r => [r.id, r]))
    const allRegs = rawRegs || []

    const joinedPayments = (rawPayments || []).map(p => {
      let reg = p.registration_id ? regMap.get(p.registration_id) : null

      // If not linked directly, search by transaction ref in registration notes
      if (!reg && p.transaction_ref) {
        reg = allRegs.find(r => {
          if (r.notes && typeof r.notes === "string" && r.notes.includes(p.transaction_ref)) return true
          return false
        }) || null
      }

      // If still not linked, search registration by course_title or email extracted from registration notes
      if (!reg) {
        // Try to find a registration that matches by email in notes JSON
        reg = allRegs.find(r => {
          if (!r.notes || typeof r.notes !== "string") return false
          try {
            const rn = JSON.parse(r.notes)
            // Check if the registration notes reference this payment's transaction_ref
            if (rn.transaction_ref === p.transaction_ref) return true
          } catch (e) {}
          return false
        }) || null
      }

      // Auto-heal in background if matched
      if (reg?.id && !p.registration_id) {
        try {
          supabaseServer.from("payments").update({ registration_id: reg.id }).eq("id", p.id)
        } catch (e) {}
      }

      return {
        ...p,
        registrations: reg
      }
    })

    // Exclure strictement les abonnements aux ressources/replays (gérés dans l'onglet Abonnements VIP)
    const isSubscriptionPayment = (p: any) => {
      const ref = (p.transaction_ref || "").toUpperCase()
      const title = (p.course_title || "").toLowerCase()
      const regSource = (p.registrations?.source || "").toLowerCase()
      const regSlug = (p.registrations?.course_slug || "").toLowerCase()

      if (
        ref.includes("STRIPE-SUB") ||
        ref.includes("SUB-") ||
        ref.startsWith("SUB") ||
        title.includes("abonnement") ||
        title.includes("pass vip") ||
        title.includes("ressource") ||
        title.includes("replay") ||
        regSource.includes("subscription") ||
        regSlug.includes("subscription") ||
        regSlug === "subscription-vip"
      ) {
        return true
      }

      // Si le montant correspond à un Pass Ressource (10k, 15k, 30k) et ne mentionne pas explicitement un bootcamp
      if (!title.includes("bootcamp") && !title.includes("pro") && (p.amount === 10000 || p.amount === 15000 || p.amount === 30000)) {
        return true
      }

      return false
    }

    const bootcampPayments = joinedPayments
      .filter(p => !(p.method === "stripe" && p.status === "pending"))
      .filter(p => !isSubscriptionPayment(p))

    return NextResponse.json({ success: true, payments: bootcampPayments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, paymentId, status } = body

    // Action 1: Inscription Manuelle d'un apprenant par l'admin
    if (action === "manual_enroll") {
      const { courseId, courseSlug, courseTitle, fullName, email, whatsapp, amount, receiptUrl, sendEmail } = body
      if (!email || !fullName || !courseSlug) {
        return NextResponse.json({ error: "Email, Nom et Bootcamp requis." }, { status: 400 })
      }

      const emailClean = email.toLowerCase().trim()

      // 1. Create or update registration for this specific course
      let registrationId: string | null = null
      const { data: existingReg } = await supabaseServer
        .from("registrations")
        .select("id")
        .ilike("email", emailClean)
        .eq("course_slug", courseSlug)
        .maybeSingle()

      const regPayload: any = {
        full_name: fullName,
        email: emailClean,
        whatsapp: whatsapp || "",
        country: "CI",
        source: "admin_manual_enroll",
        course_slug: courseSlug,
        course_id: courseId || null,
        status: "paye",
        notes: JSON.stringify({
          course_slug: courseSlug,
          course_title: courseTitle || courseSlug,
          receipt_url: receiptUrl || undefined,
          manual_enroll: true,
          enrolled_at: new Date().toISOString()
        })
      }

      if (existingReg) {
        registrationId = existingReg.id
        await supabaseServer.from("registrations").update(regPayload).eq("id", existingReg.id)
      } else {
        const { data: newReg } = await supabaseServer.from("registrations").insert(regPayload).select("id").single()
        if (newReg) registrationId = newReg.id
      }

      // 2. Create confirmed payment record
      const ref = `ADM-${Date.now().toString().slice(-6)}`
      await supabaseServer.from("payments").insert({
        registration_id: registrationId,
        amount: Number(amount) || 0,
        currency: "XOF",
        method: "admin_manual",
        status: "confirmed",
        transaction_ref: ref,
        course_id: courseId || null,
        course_title: courseTitle || courseSlug,
        payment_method: "Admin Manuel",
        confirmed_at: new Date().toISOString()
      })

      // 3. Activate user_courses
      const { data: existingUC } = await supabaseServer
        .from("user_courses")
        .select("id")
        .ilike("user_email", emailClean)
        .eq("course_slug", courseSlug)
        .maybeSingle()

      if (existingUC) {
        await supabaseServer.from("user_courses").update({ status: "active" }).eq("id", existingUC.id)
      } else {
        await supabaseServer.from("user_courses").insert({
          user_email: emailClean,
          course_slug: courseSlug,
          status: "active"
        })
      }

      // 4. Ensure Auth user exists
      let tempPassword: string | undefined = undefined
      let isNewAccount = false
      try {
        const { data: listData } = await supabaseServer.auth.admin.listUsers()
        const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === emailClean)
        if (!existingUser) {
          isNewAccount = true
          tempPassword = `Lgi${Math.floor(1000 + Math.random() * 9000)}!2026`
          await supabaseServer.auth.admin.createUser({
            email: emailClean,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          })
        }
      } catch (e) {}

      // 5. Send access email if requested
      if (sendEmail !== false && resend) {
        try {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "Le Guide IA <alfred@leguideai.com>"
          await resend.emails.send({
            from: fromEmail,
            to: [emailClean],
            subject: `🎉 Inscription Confirmée : ${courseTitle || "Votre Bootcamp"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
                <h2 style="color: #16a34a;">Bonjour ${fullName},</h2>
                <p>Vous avez été officiellement inscrit(e) au Bootcamp <strong>${courseTitle || courseSlug}</strong> par l'équipe d'administration LE GUIDE IA.</p>
                <p>Vos accès aux replays, ressources et sessions en direct sont désormais <strong>100% ACTIFS</strong> sur votre espace membre (associé à l'adresse <code>${emailClean}</code>).</p>
                <a href="https://leguideai.com/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 16px;">
                  Accéder à mon Espace Membre →
                </a>
              </div>
            `
          })
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Apprenant ${fullName} inscrit avec succès au Bootcamp !`
      })
    }

    if (!paymentId || !status) {
      return NextResponse.json({ error: "paymentId et status requis." }, { status: 400 })
    }

    // Map frontend action status to database allowed values
    let dbStatus = status
    if (status === "rejected") dbStatus = "failed"

    // Action 2: Update payment status (validation / confirmation / rejection)
    let { data: updatedPayment, error: payErr } = await supabaseServer
      .from("payments")
      .update({
        status: dbStatus,
        confirmed_at: status === "confirmed" ? new Date().toISOString() : null
      })
      .eq("id", paymentId)
      .select("*")
      .maybeSingle()

    // If 'failed' also violates constraint, fallback to 'cancelled' or delete
    if (payErr && status === "rejected") {
      const { data: retryPay, error: retryErr } = await supabaseServer
        .from("payments")
        .update({ status: "cancelled" })
        .eq("id", paymentId)
        .select("*")
        .maybeSingle()

      if (!retryErr && retryPay) {
        updatedPayment = retryPay
        payErr = null
      }
    }

    if (payErr || !updatedPayment) {
      return NextResponse.json({ error: payErr?.message || "Paiement non trouvé" }, { status: 500 })
    }

    // Safely lookup associated registration
    let reg: any = null
    if (updatedPayment.registration_id) {
      const { data: regData } = await supabaseServer
        .from("registrations")
        .select("*")
        .eq("id", updatedPayment.registration_id)
        .maybeSingle()
      reg = regData
    }

    if (!reg && updatedPayment.transaction_ref) {
      const { data: allRegs } = await supabaseServer
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false })

      reg = (allRegs || []).find(r => r.notes && typeof r.notes === "string" && r.notes.includes(updatedPayment.transaction_ref)) || null
    }

    const studentEmail = reg?.email?.toLowerCase().trim()
    const studentName = reg?.full_name || "Cher Apprenant"

    // If rejected, mark registration as cancelled
    if (status === "rejected" && updatedPayment.registration_id) {
      try {
        await supabaseServer
          .from("registrations")
          .update({ status: "annule" })
          .eq("id", updatedPayment.registration_id)
      } catch (_) {}
    }

    // 2. If confirmed, activate registration and user_courses
    if (status === "confirmed" && studentEmail) {
      
      // Update registration status
      if (updatedPayment.registration_id) {
        await supabaseServer
          .from("registrations")
          .update({ status: "paye" })
          .eq("id", updatedPayment.registration_id)
      }

      // Activate and upsert matching user_courses
      let resolvedSlug = reg?.course_slug || ""
      if (!resolvedSlug && reg?.notes) {
        try {
          const parsed = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes
          if (parsed?.course_slug) resolvedSlug = parsed.course_slug
        } catch(e) {}
      }
      if (!resolvedSlug && updatedPayment.course_title) {
        const titleNorm = updatedPayment.course_title.toLowerCase()
        if (titleNorm.includes("business")) resolvedSlug = "bootcamp-business-exec"
        else if (titleNorm.includes("carriere")) resolvedSlug = "bootcamp-ia-pro"
      }

      if (resolvedSlug) {
        const { data: existingUC } = await supabaseServer
          .from("user_courses")
          .select("id")
          .ilike("user_email", studentEmail)
          .eq("course_slug", resolvedSlug)
          .maybeSingle()

        if (existingUC) {
          await supabaseServer.from("user_courses").update({ status: "active" }).eq("id", existingUC.id)
        } else {
          await supabaseServer.from("user_courses").insert({
            user_email: studentEmail,
            course_slug: resolvedSlug,
            status: "active"
          })
        }
      }

      // Ensure Supabase Auth user account exists
      let tempPassword: string | undefined = undefined
      let isNewAccount = false

      try {
        const { data: listData } = await supabaseServer.auth.admin.listUsers()
        const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === studentEmail)

        if (!existingUser) {
          isNewAccount = true
          tempPassword = `Lgi${Math.floor(1000 + Math.random() * 9000)}!2026`
          await supabaseServer.auth.admin.createUser({
            email: studentEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: studentName }
          })
        }
      } catch (authErr) {
        console.warn("Auth user creation in payment confirmation warning:", authErr)
      }

      // Send official Access Confirmation Email via Resend
      if (resend) {
        try {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "Le Guide IA <alfred@leguideai.com>"
          let payNotes: any = null
          if (updatedPayment.notes) {
            try { payNotes = typeof updatedPayment.notes === "string" ? JSON.parse(updatedPayment.notes) : updatedPayment.notes } catch (e) {}
          }
          let regNotes: any = null
          if (reg?.notes) {
            try { regNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes } catch (e) {}
          }

          const subDeduction = Number(payNotes?.subscription_deduction || payNotes?.subscriptionCredit || regNotes?.subscription_deduction || regNotes?.subscriptionCredit || 0)
          const subPlan = payNotes?.subscription_plan || payNotes?.subscriptionPlan || regNotes?.subscription_plan || regNotes?.subscriptionPlan || "Pass Cercle IA"
          const origPrice = Number(payNotes?.original_price || payNotes?.originalPrice || regNotes?.original_price || (subDeduction > 0 ? Number(updatedPayment.amount) + subDeduction : 0))
          const hasDeduction = subDeduction > 0

          await resend.emails.send({
            from: fromEmail,
            to: [studentEmail],
            subject: "🎉 Votre paiement est validé ! Accès débloqué à votre Formation",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #16a34a; margin: 0; font-size: 22px;">LE GUIDE IA — ACCÈS ACTIVÉ</h1>
                  <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Félicitations pour votre inscription !</p>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #15803d; margin-top: 0; font-size: 18px;">Bonjour ${studentName},</h3>
                  <p style="font-size: 14px; color: #166534;">
                    Votre virement Mobile Money de <strong>${updatedPayment.amount ? updatedPayment.amount.toLocaleString('fr-FR') : "49 000"} FCFA</strong> (Réf: <code>${updatedPayment.transaction_ref || "Validé"}</code>) a été vérifié et approuvé par notre équipe d'administration.
                  </p>
                  <p style="font-size: 15px; font-weight: bold; color: #15803d; margin: 12px 0 0 0;">
                    ✅ Vos accès complets à vos formations et ressources sont maintenant 100% ACTIFS !
                  </p>
                </div>

                ${hasDeduction ? `
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">Récapitulatif de votre règlement :</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                      <li><strong>Formation :</strong> ${updatedPayment.course_title || resolvedSlug || "Bootcamp IA"}</li>
                      <li><strong>Tarif catalogue :</strong> <span style="text-decoration: line-through; color: #64748b;">${origPrice.toLocaleString('fr-FR')} FCFA</span></li>
                      <li><strong>Déduction Membre Cercle IA (${subPlan}) :</strong> <span style="color: #16a34a; font-weight: bold;">-${subDeduction.toLocaleString('fr-FR')} FCFA (100% Déduit)</span></li>
                      <li><strong>Montant net réglé :</strong> <strong style="color: #15803d; font-size: 14px;">${updatedPayment.amount ? updatedPayment.amount.toLocaleString('fr-FR') : "49 000"} FCFA</strong></li>
                    </ul>
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; margin-top: 12px; font-size: 12px; color: #15803d;">
                      🎁 <strong>Avantage Cercle IA appliqué :</strong> Votre mensualité d'abonnement a été déduite à 100% du prix de votre Bootcamp !
                    </div>
                  </div>
                ` : ''}

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 13px; color: #334155;">
                    Connectez-vous directement avec votre adresse email (<strong>${studentEmail}</strong>) pour accéder à vos sessions en direct, leçons vidéo et boîtes à outils.
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://leguideai.com/dashboard" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                    Accéder à mon Espace Membre →
                  </a>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                  Alfred Dah · Fondateur & Lead Trainer Le Guide IA<br />
                  Besoin d'aide ? Contactez notre support WhatsApp au +226 0505 0577
                </p>
              </div>
            `,
          })
        } catch (mailErr) {
          console.error("Failed to send admin confirmation email:", mailErr)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Statut du paiement mis à jour : ${status}`,
      payment: updatedPayment
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Edit inscription & payment details
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      registration_id,
      full_name,
      email,
      whatsapp,
      country,
      amount,
      currency,
      method,
      transaction_ref,
      status
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID du paiement requis." }, { status: 400 })
    }

    const emailClean = email ? email.toLowerCase().trim() : undefined

    // 1. Update Payment record
    const payUpdateData: any = {}
    if (amount !== undefined) payUpdateData.amount = Number(amount)
    if (currency !== undefined) payUpdateData.currency = currency
    if (method !== undefined) payUpdateData.method = method
    if (transaction_ref !== undefined) payUpdateData.transaction_ref = transaction_ref
    if (status !== undefined) payUpdateData.status = status
    if (emailClean) payUpdateData.user_email = emailClean

    const { error: payErr } = await supabaseServer
      .from("payments")
      .update(payUpdateData)
      .eq("id", id)

    if (payErr) {
      return NextResponse.json({ error: payErr.message }, { status: 500 })
    }

    // 2. Update Registration record if linked
    if (registration_id) {
      const regUpdateData: any = {}
      if (full_name !== undefined) regUpdateData.full_name = full_name
      if (emailClean !== undefined) regUpdateData.email = emailClean
      if (whatsapp !== undefined) regUpdateData.whatsapp = whatsapp
      if (country !== undefined) regUpdateData.country = country
      if (status === "confirmed") regUpdateData.status = "paye"

      await supabaseServer
        .from("registrations")
        .update(regUpdateData)
        .eq("id", registration_id)
    }

    return NextResponse.json({
      success: true,
      message: "Inscription et paiement mis à jour avec succès !"
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete an inscription / payment and revoke course access completely
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const registrationId = searchParams.get("registration_id")
    let email = searchParams.get("email")
    let courseSlug = searchParams.get("course_slug")

    if (!id && !registrationId && !email) {
      return NextResponse.json({ error: "Identifiant du paiement ou de l'inscription requis." }, { status: 400 })
    }

    let targetEmail = email ? email.toLowerCase().trim() : ""
    let targetRegId = registrationId || null
    let targetSlug = courseSlug || ""

    // 1. If payment ID is provided, look up payment record to extract registration and course info before deletion
    if (id) {
      const { data: pay } = await supabaseServer
        .from("payments")
        .select("*, registrations(*)")
        .eq("id", id)
        .maybeSingle()

      if (pay) {
        if (!targetRegId && pay.registration_id) targetRegId = pay.registration_id
        if (!targetEmail) {
          targetEmail = (pay.registrations?.email || "").toLowerCase().trim()
        }
        if (!targetSlug) {
          targetSlug = pay.registrations?.course_slug || ""
        }
        if (!targetSlug && pay.course_title) {
          const t = pay.course_title.toLowerCase()
          if (t.includes("business")) targetSlug = "bootcamp-business-exec"
          else if (t.includes("carriere") || t.includes("pro")) targetSlug = "bootcamp-pro-2"
        }
      }
    }

    // 2. If targetRegId is provided, look up registration record if email is still missing
    if (targetRegId && !targetEmail) {
      const { data: reg } = await supabaseServer
        .from("registrations")
        .select("*")
        .eq("id", targetRegId)
        .maybeSingle()

      if (reg) {
        targetEmail = (reg.email || "").toLowerCase().trim()
        if (!targetSlug) targetSlug = reg.course_slug || ""
      }
    }

    // 3. Delete payment if ID is provided
    if (id) {
      const { error: payErr } = await supabaseServer
        .from("payments")
        .delete()
        .eq("id", id)

      if (payErr) {
        console.warn("Payment delete note:", payErr.message)
      }
    }

    // 4. Delete registration if registrationId is provided or exact email + courseSlug match
    if (targetRegId) {
      await supabaseServer
        .from("registrations")
        .delete()
        .eq("id", targetRegId)
    } else if (targetEmail && targetSlug) {
      await supabaseServer
        .from("registrations")
        .delete()
        .ilike("email", targetEmail)
        .eq("course_slug", targetSlug)
    }

    // 5. Delete and revoke ONLY the specific user_courses for this exact course
    if (targetEmail) {
      if (targetSlug) {
        await supabaseServer
          .from("user_courses")
          .delete()
          .ilike("user_email", targetEmail)
          .eq("course_slug", targetSlug)
      } else {
        await supabaseServer
          .from("user_courses")
          .delete()
          .ilike("user_email", targetEmail)
      }

      // Check remaining active courses for user
      const { data: remainingUC } = await supabaseServer
        .from("user_courses")
        .select("id")
        .ilike("user_email", targetEmail)
        .eq("status", "active")

      if (!remainingUC || remainingUC.length === 0) {
        await supabaseServer
          .from("profiles")
          .update({ plan: "FREE" })
          .ilike("email", targetEmail)
          .not("role", "in", '("admin","super_admin")')
      }
    }

    return NextResponse.json({
      success: true,
      message: "Apprenant et inscription supprimés avec succès du Bootcamp. L'accès a été révoqué."
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
