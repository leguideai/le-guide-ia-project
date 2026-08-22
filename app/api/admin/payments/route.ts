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
      const joined = (rawPayments || [])
        .filter(p => !(p.method === "stripe" && p.status === "pending"))
        .map(p => ({
          ...p,
          registrations: regMap.get(p.registration_id) || null
        }))

      return NextResponse.json({ success: true, payments: joined })
    }

    // Auto-heal any unlinked confirmed stripe payments with existing registration
    try {
      const { data: unlinkedStripe } = await supabaseServer
        .from("payments")
        .select("id, transaction_ref, course_title")
        .eq("method", "stripe")
        .is("registration_id", null)

      if (unlinkedStripe && unlinkedStripe.length > 0) {
        const { data: targetReg } = await supabaseServer
          .from("registrations")
          .select("id, email, full_name, course_slug")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (targetReg) {
          for (const un of unlinkedStripe) {
            await supabaseServer
              .from("payments")
              .update({ registration_id: targetReg.id })
              .eq("id", un.id)

            if (targetReg.email) {
              const slugToActivate = targetReg.course_slug || "bootcamp-business-exec"
              await supabaseServer.from("user_courses").upsert({
                user_email: targetReg.email.toLowerCase().trim(),
                course_slug: slugToActivate,
                status: "active",
                payment_method: "stripe",
                updated_at: new Date().toISOString()
              }, { onConflict: "user_email,course_slug" })
            }
          }
        }
      }
    } catch (healErr) {
      console.warn("Auto-heal warning:", healErr)
    }

    // Re-fetch payments after healing
    const { data: updatedPayments } = await supabaseServer
      .from("payments")
      .select(`
        *,
        registrations (
          *
        )
      `)
      .order("created_at", { ascending: false })

    const finalPayments = (updatedPayments || payments || [])
    return NextResponse.json({ success: true, payments: finalPayments })
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

      await supabaseServer
        .from("user_courses")
        .update({ status: "active" })
        .ilike("user_email", studentEmail)

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

    // 4. Delete registration if registrationId is provided
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
        .or(`course_slug.eq.${targetSlug},course_slug.is.null`)
    }

    // 5. Delete and revoke user_courses
    if (targetEmail) {
      if (targetSlug) {
        const slugsToDelete = [targetSlug]
        if (targetSlug.includes("carriere") || targetSlug.includes("pro")) {
          slugsToDelete.push("bootcamp-pro-2", "bootcamp-ia-pro", "bootcamp-ia-carriere")
        }
        if (targetSlug.includes("business") || targetSlug.includes("exec")) {
          slugsToDelete.push("bootcamp-business-exec", "bootcamp-ia-business")
        }

        for (const s of slugsToDelete) {
          await supabaseServer
            .from("user_courses")
            .delete()
            .ilike("user_email", targetEmail)
            .eq("course_slug", s)
        }
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
