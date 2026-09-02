import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || "Alfred Dah — LE GUIDE IA <alfred@leguideai.com>"

// 1. Inscription à la Newsletter (Client ou Admin)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name = "", source = "footer_newsletter" } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Veuillez fournir une adresse email valide." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const nowIso = new Date().toISOString()
    let saved = false

    // 1. Enregistrement dans newsletter_subscribers (colonnes réelles: email, name, status, subscribed_at)
    try {
      const { error: insErr } = await supabaseServer
        .from("newsletter_subscribers")
        .upsert({
          email: emailClean,
          name: name || null,
          status: "active",
          subscribed_at: nowIso
        }, { onConflict: "email" })

      if (!insErr) {
        saved = true
      } else {
        console.warn("newsletter_subscribers upsert error, attempting insert:", insErr)
        const { error: retryErr } = await supabaseServer
          .from("newsletter_subscribers")
          .insert({
            email: emailClean,
            name: name || null,
            status: "active",
            subscribed_at: nowIso
          })
        if (!retryErr) saved = true
        else console.error("newsletter_subscribers insert error:", retryErr)
      }
    } catch (dbErr) {
      console.warn("newsletter_subscribers insert error:", dbErr)
    }

    // Toujours enregistrer dans registrations en secours pour ne jamais perdre d'email
    try {
      const { data: existing } = await supabaseServer
        .from("registrations")
        .select("id")
        .eq("email", emailClean)
        .maybeSingle()

      if (existing) {
        await supabaseServer
          .from("registrations")
          .update({
            full_name: name || "Abonné Newsletter",
            source: "newsletter",
            status: "active"
          })
          .eq("id", existing.id)
        saved = true
      } else {
        await supabaseServer
          .from("registrations")
          .insert({
            full_name: name || "Abonné Newsletter",
            email: emailClean,
            source: "newsletter",
            status: "active",
            created_at: nowIso
          })
        saved = true
      }
    } catch (fallbackErr) {
      console.warn("Fallback registrations insert error:", fallbackErr)
    }

    // 2. Envoi d'un email de bienvenue officiel de la part d'Alfred Dah
    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [emailClean],
          replyTo: "alfred@leguideai.com",
          subject: "⚡ Bienvenue dans la Newsletter Officielle — LE GUIDE IA",
          text: `Bonjour et bienvenue !\n\nMerci de vous être inscrit(e) à la newsletter LE GUIDE IA. Vous recevrez nos veilles IA exclusives, prompts métiers et invitations à nos sessions live.\n\nÀ très vite,\nAlfred Dah · LE GUIDE IA\nhttps://leguideai.com`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
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
                  <li>🔥 <strong>Nos analyses &amp; veilles IA exclusives</strong> (ChatGPT, Claude 3.5, automatisation Make &amp; n8n).</li>
                  <li>🎯 <strong>Des prompts métiers prêts à l'emploi</strong> pour booster votre productivité.</li>
                  <li>📅 <strong>Les dates et offres préférentielles</strong> pour nos prochains Bootcamps (Carrière &amp; Business).</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://leguideai.com/bootcamp" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px;">
                  Découvrir les Prochains Bootcamps →
                </a>
              </div>

              <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <p style="margin: 0;"><strong>Alfred Dah</strong> · Fondateur LE GUIDE IA</p>
                <p style="margin: 4px 0 0 0;">Contact direct : <a href="mailto:alfred@leguideai.com" style="color: #0284c7; text-decoration: none;">alfred@leguideai.com</a> | WhatsApp : +226 0505 0577</p>
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
    const subscriberMap = new Map<string, any>()

    // A. Source 1: newsletter_subscribers
    try {
      const { data: newsData } = await supabaseServer
        .from("newsletter_subscribers")
        .select("*")

      if (newsData && newsData.length > 0) {
        newsData.forEach(sub => {
          if (sub.email) {
            const em = sub.email.toLowerCase().trim()
            subscriberMap.set(em, {
              id: sub.id || em,
              email: em,
              name: sub.name || null,
              status: sub.status || "active",
              source: sub.source || "newsletter",
              created_at: sub.created_at || sub.subscribed_at || new Date().toISOString()
            })
          }
        })
      }
    } catch (e) {
      console.warn("Failed querying newsletter_subscribers table:", e)
    }

    // B. Source 2: registrations avec source = 'newsletter' ou 'footer_newsletter'
    try {
      const { data: regNews } = await supabaseServer
        .from("registrations")
        .select("*")
        .or("source.ilike.%newsletter%,status.eq.newsletter,source.eq.footer_newsletter")

      if (regNews && regNews.length > 0) {
        regNews.forEach(r => {
          if (r.email) {
            const em = r.email.toLowerCase().trim()
            if (!subscriberMap.has(em)) {
              subscriberMap.set(em, {
                id: r.id || em,
                email: em,
                name: r.full_name || null,
                status: "active",
                source: r.source || "footer_newsletter",
                created_at: r.created_at || new Date().toISOString()
              })
            }
          }
        })
      }
    } catch (e) {
      console.warn("Failed querying registrations table for newsletter:", e)
    }

    const subscribers = Array.from(subscriberMap.values()).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

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

    const emailClean = email ? email.toLowerCase().trim() : null

    // Delete from newsletter_subscribers
    try {
      if (id && id.length > 20) {
        await supabaseServer.from("newsletter_subscribers").delete().eq("id", id)
      }
      if (emailClean) {
        await supabaseServer.from("newsletter_subscribers").delete().eq("email", emailClean)
      }
    } catch (e) {}

    // Delete from registrations where source = 'newsletter'
    try {
      if (emailClean) {
        await supabaseServer.from("registrations").delete().eq("email", emailClean).eq("source", "newsletter")
      } else if (id) {
        await supabaseServer.from("registrations").delete().eq("id", id).eq("source", "newsletter")
      }
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Abonné supprimé avec succès." })
  } catch (err: any) {
    console.error("Newsletter DELETE error:", err)
    return NextResponse.json({ message: "Erreur lors de la suppression." }, { status: 500 })
  }
}
