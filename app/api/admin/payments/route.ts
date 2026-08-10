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
      .select()
      .single()

    if (payErr || !updatedPayment) {
      return NextResponse.json({ error: payErr?.message || "Paiement non trouvé" }, { status: 500 })
    }

    // 2. If confirmed, update registration status to 'paye' and send Resend confirmation
    if (status === "confirmed" && updatedPayment.registration_id) {
      const { data: reg } = await supabaseServer
        .from("registrations")
        .update({ status: "paye" })
        .eq("id", updatedPayment.registration_id)
        .select()
        .single()

      if (reg?.email && resend) {
        try {
          await resend.emails.send({
            from: "Le Guide IA <contact@leguideai.com>",
            to: [reg.email],
            subject: "🎉 Votre paiement est validé ! Accès immédiat au Bootcamp IA",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
                <h2 style="color: #16a34a;">Félicitations ${reg.full_name || ""} ! Votre paiement est confirmé !</h2>
                <p>Votre dépôt Mobile Money de <strong>${updatedPayment.amount?.toLocaleString() || "99 000"} FCFA</strong> a été validé par l'équipe d'administration Le Guide IA.</p>
                <p>Votre inscription au <strong>Bootcamp IA</strong> est désormais 100% active.</p>
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #15803d;">Vos Accès Espace Membre :</h4>
                  <p>Accédez directement à vos replays, vos modules de cours et à la salle de réunion Google Meet Live :</p>
                  <p><a href="https://leguideai.com/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accéder au Dashboard Apprenant</a></p>
                </div>
                <p>À très bientôt pour votre montée en compétences IA !</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #64748b;">Alfred Dah & L'équipe Le Guide IA</p>
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
