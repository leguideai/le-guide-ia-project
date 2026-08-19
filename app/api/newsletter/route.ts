import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || "Le Guide IA <samba@leguideai.com>"

// 1. Inscription à la Newsletter (Client)
export async function POST(req: Request) {
  try {
    const { email, source = "footer_newsletter" } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Veuillez fournir une adresse email valide." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()

    // 1. Enregistrement dans Supabase (table newsletter_subscribers ou leads)
    try {
      const { error: insErr } = await supabaseServer
        .from("newsletter_subscribers")
        .upsert({
          email: emailClean,
          status: "active",
          source: source,
          created_at: new Date().toISOString()
        }, { onConflict: "email" })

      if (insErr) {
        // Fallback dans leads si newsletter_subscribers n'existe pas encore
        await supabaseServer.from("leads").upsert({
          email: emailClean,
          source: "newsletter",
          created_at: new Date().toISOString()
        }, { onConflict: "email" }).catch(() => {})
      }
    } catch (dbErr) {
      console.warn("DB newsletter insertion warning:", dbErr)
    }

    // 2. Envoi d'un email de bienvenue officiel de la part de samba@leguideai.com
    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [emailClean],
          reply_to: "samba@leguideai.com",
          subject: "⚡ Bienvenue dans la Newsletter Officielle — LE GUIDE IA",
          text: `Bonjour et bienvenue !\n\nMerci de vous être inscrit(e) à notre newsletter LE GUIDE IA. Vous recevrez nos veilles IA exclusives, prompts métiers et invitations à nos sessions live.\n\nÀ très vite,\nL'équipe LE GUIDE IA\nhttps://leguideai.com`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
              <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0284c7;">
                <h1 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">LE GUIDE IA</h1>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">La référence de l'Intelligence Artificielle en Afrique</p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Bonjour et bienvenue !</h2>
                <p style="color: #334155; font-size: 14px;">
                  Merci de vous être inscrit(e) à notre newsletter. Vous recevrez désormais en avant-première :
                </p>
                <ul style="color: #475569; font-size: 14px; padding-left: 20px; line-height: 1.8;">
                  <li>🔥 <strong>Nos analyses & veilles IA exclusives</strong> (ChatGPT, Claude 3.5, automatisation Make & n8n).</li>
                  <li>🎯 <strong>Des prompts métiers prêts à l'emploi</strong> pour booster votre productivité.</li>
                  <li>📅 <strong>Les dates et offres préférentielles</strong> pour nos prochains Bootcamps (Carrière & Business).</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://leguideai.com/bootcamp" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px;">
                  Découvrir les Prochains Bootcamps →
                </a>
              </div>

              <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <p style="margin: 0;">LE GUIDE IA · Samba Diop & Alfred Dah</p>
                <p style="margin: 4px 0 0 0;">Contact direct : <a href="mailto:samba@leguideai.com" style="color: #0284c7;">samba@leguideai.com</a> | WhatsApp : +226 0505 0577</p>
              </div>
            </div>
          `
        })
      } catch (emailErr) {
        console.warn("Newsletter welcome email warning:", emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Merci ! Votre inscription à la newsletter a été validée avec succès."
    })
  } catch (err: any) {
    console.error("Newsletter subscription error:", err)
    return NextResponse.json({ message: "Erreur lors de l'enregistrement." }, { status: 500 })
  }
}

// 2. Liste des Inscrits à la Newsletter (Admin)
export async function GET() {
  try {
    let subscribers: any[] = []

    const { data: newsData, error: newsErr } = await supabaseServer
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })

    if (newsData && newsData.length > 0) {
      subscribers = newsData
    } else {
      // Fallback leads
      const { data: leadData } = await supabaseServer
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
      if (leadData) subscribers = leadData
    }

    return NextResponse.json({ success: true, subscribers })
  } catch (err: any) {
    console.error("Newsletter GET error:", err)
    return NextResponse.json({ success: false, subscribers: [] }, { status: 500 })
  }
}

// 3. Suppression d'un abonné (Admin)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const email = searchParams.get("email")

    if (!id && !email) {
      return NextResponse.json({ message: "ID ou email requis." }, { status: 400 })
    }

    if (id) {
      await supabaseServer.from("newsletter_subscribers").delete().eq("id", id)
      await supabaseServer.from("leads").delete().eq("id", id).catch(() => {})
    } else if (email) {
      await supabaseServer.from("newsletter_subscribers").delete().eq("email", email)
      await supabaseServer.from("leads").delete().eq("email", email).catch(() => {})
    }

    return NextResponse.json({ success: true, message: "Abonné supprimé avec succès." })
  } catch (err: any) {
    console.error("Newsletter DELETE error:", err)
    return NextResponse.json({ message: "Erreur lors de la suppression." }, { status: 500 })
  }
}
