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
          id,
          full_name,
          email,
          whatsapp,
          country,
          source
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
    const { paymentId, status } = await req.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: "paymentId et status requis." }, { status: 400 })
    }

    // 1. Update payment status
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
          const fromEmail = process.env.RESEND_FROM_EMAIL || "Le Guide IA <samba@leguideai.com>"
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
