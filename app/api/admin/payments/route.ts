import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET() {
  try {
    const { data: payments, error: payErr } = await supabaseServer
      .from("payments")
      .select(`
        *,
        registrations (
          *
        )
      `)
      .order("created_at", { ascending: false })

    if (payErr) {
      // Fallback query without relation if foreign key is different
      const { data: rawPayments } = await supabaseServer
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })

      const { data: rawRegs } = await supabaseServer
        .from("registrations")
        .select("*")

      const regMap = new Map((rawRegs || []).map(r => [r.id, r]))
      const joined = (rawPayments || []).map(p => ({
        ...p,
        registrations: regMap.get(p.registration_id) || null
      }))

      return NextResponse.json({ success: true, payments: joined })
    }

    return NextResponse.json({ success: true, payments: payments || [] })
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

      // 1. Create or update registration
      let registrationId: string | null = null
      const { data: existingReg } = await supabaseServer
        .from("registrations")
        .select("id")
        .eq("email", emailClean)
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
      await supabaseServer.from("user_courses").upsert({
        user_email: emailClean,
        course_slug: courseSlug,
        course_id: courseId || null,
        status: "active",
        amount_paid: Number(amount) || 0,
        payment_method: "admin_manual",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_email,course_slug" })

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
                <p>Vos accès aux replays, ressources et sessions en direct sont désormais <strong>100% ACTIFS</strong> sur votre espace membre.</p>
                ${isNewAccount && tempPassword ? `
                  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Identifiants :</strong></p>
                    <p>Email : <code>${emailClean}</code></p>
                    <p>Mot de passe temporaire : <code>${tempPassword}</code></p>
                  </div>
                ` : ""}
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

    // Action 2: Update payment status (validation / confirmation)
    const { data: updatedPayment, error: payErr } = await supabaseServer
      .from("payments")
      .update({ status })
      .eq("id", paymentId)
      .select(`
        *,
        registrations (
          id,
          full_name,
          email,
          whatsapp,
          country
        )
      `)
      .single()

    if (payErr || !updatedPayment) {
      return NextResponse.json({ error: payErr?.message || "Paiement non trouvé" }, { status: 500 })
    }

    const reg = updatedPayment.registrations
    const studentEmail = reg?.email?.toLowerCase().trim()
    const studentName = reg?.full_name || "Cher Apprenant"

    // 2. If confirmed, activate registration and user_courses
    if (status === "confirmed" && studentEmail) {
      
      // Update registration status
      if (updatedPayment.registration_id) {
        await supabaseServer
          .from("registrations")
          .update({ status: "paye" })
          .eq("id", updatedPayment.registration_id)
      }

      // Activate all matching user_courses
      await supabaseServer
        .from("user_courses")
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("user_email", studentEmail)

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

                ${isNewAccount && tempPassword ? `
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">Vos identifiants de connexion :</h4>
                    <p style="margin: 4px 0; font-size: 13px;"><strong>Email :</strong> <code>${studentEmail}</code></p>
                    <p style="margin: 4px 0; font-size: 13px;"><strong>Mot de passe temporaire :</strong> <code>${tempPassword}</code></p>
                    <p style="font-size: 11px; color: #64748b; margin-top: 8px;">(Vous pourrez modifier ce mot de passe à tout moment dans votre profil).</p>
                  </div>
                ` : `
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 13px; color: #334155;">
                      Connectez-vous avec votre adresse email <strong>${studentEmail}</strong> pour accéder immédiatement à vos leçons vidéo et boîtes à outils de prompts.
                    </p>
                  </div>
                `}

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

// DELETE: Delete an inscription / payment and revoke course access
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const registrationId = searchParams.get("registration_id")
    const email = searchParams.get("email")
    const courseSlug = searchParams.get("course_slug")

    if (!id && !registrationId && !email) {
      return NextResponse.json({ error: "Identifiant du paiement ou de l'inscription requis." }, { status: 400 })
    }

    // 1. Delete payment if ID is provided
    if (id) {
      const { error: payErr } = await supabaseServer
        .from("payments")
        .delete()
        .eq("id", id)

      if (payErr) {
        console.warn("Payment delete note:", payErr.message)
      }
    }

    // 2. Delete registration if registration_id is provided
    if (registrationId) {
      await supabaseServer
        .from("registrations")
        .delete()
        .eq("id", registrationId)
    }

    // 3. Delete or deactivate user_courses if email and course_slug are provided
    if (email) {
      const emailClean = email.toLowerCase().trim()
      let ucQuery = supabaseServer.from("user_courses").delete().eq("user_email", emailClean)
      if (courseSlug) {
        ucQuery = ucQuery.eq("course_slug", courseSlug)
      }
      await ucQuery
    }

    return NextResponse.json({
      success: true,
      message: "Apprenant et inscription supprimés avec succès du Bootcamp."
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
