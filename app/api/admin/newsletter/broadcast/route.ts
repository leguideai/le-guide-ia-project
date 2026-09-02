import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || "Alfred Dah — LE GUIDE IA <alfred@leguideai.com>"

export async function POST(req: Request) {
  try {
    const { 
      subject, 
      title, 
      bodyHtml, 
      recipientEmails, 
      includePlatformMembers = false,
      isTest = false,
      testEmail = ""
    } = await req.json()

    if (!subject || !bodyHtml) {
      return NextResponse.json({ message: "Le sujet et le contenu de l'email sont obligatoires." }, { status: 400 })
    }

    if (!resend) {
      return NextResponse.json({ 
        message: "Clé API Resend non configurée sur le serveur.",
        warning: "Configurez RESEND_API_KEY dans les variables d'environnement." 
      }, { status: 500 })
    }

    let targetEmails: string[] = []

    if (isTest) {
      if (!testEmail) {
        return NextResponse.json({ message: "Veuillez renseigner une adresse email de test." }, { status: 400 })
      }
      targetEmails = [testEmail.toLowerCase().trim()]
    } else if (recipientEmails && Array.isArray(recipientEmails) && recipientEmails.length > 0) {
      targetEmails = Array.from(new Set(recipientEmails.map((e: string) => e.toLowerCase().trim()).filter(Boolean)))
    } else {
      const emailSet = new Set<string>()

      // 1. Fetch from newsletter_subscribers
      try {
        const { data: subs } = await supabaseServer
          .from("newsletter_subscribers")
          .select("email")
          .eq("status", "active")
        if (subs && subs.length > 0) {
          subs.forEach(s => s.email && emailSet.add(s.email.toLowerCase().trim()))
        }
      } catch (e) {}

      // 2. Fetch from registrations (where source = 'newsletter' or all registrations if includePlatformMembers is true)
      try {
        const query = supabaseServer.from("registrations").select("email")
        if (!includePlatformMembers) {
          query.eq("source", "newsletter")
        }
        const { data: regs } = await query
        if (regs && regs.length > 0) {
          regs.forEach(r => r.email && emailSet.add(r.email.toLowerCase().trim()))
        }
      } catch (e) {}

      // 3. If includePlatformMembers is true, also fetch from profiles (registered users on platform)
      if (includePlatformMembers) {
        try {
          const { data: profs } = await supabaseServer.from("profiles").select("email")
          if (profs && profs.length > 0) {
            profs.forEach(p => p.email && emailSet.add(p.email.toLowerCase().trim()))
          }
        } catch (e) {}
      }

      targetEmails = Array.from(emailSet).filter(e => e.includes("@"))
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ message: "Aucun destinataire trouvé pour cette diffusion." }, { status: 400 })
    }

    let successCount = 0
    let failureCount = 0
    const errors: any[] = []

    // Format HTML Template
    const fullHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0284c7;">
          <h1 style="color: #0284c7; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">LE GUIDE IA</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">La plateforme d'excellence en Intelligence Artificielle</p>
        </div>

        ${title ? `<h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 16px;">${title}</h2>` : ""}

        <div style="color: #334155; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
          ${bodyHtml}
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #0f172a; font-size: 14px;">Besoin d'un accompagnement personnalisé ?</p>
          <a href="https://leguideai.com/bootcamp" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 13px;">
            Accéder à la plateforme LE GUIDE IA →
          </a>
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px;">
          <p style="margin: 0;">Cet email a été envoyé par <strong>Alfred Dah</strong> via <strong>LE GUIDE IA</strong>.</p>
          <p style="margin: 4px 0 0 0;">Pour toute question, répondez directement à <a href="mailto:alfred@leguideai.com" style="color: #0284c7; text-decoration: none;">alfred@leguideai.com</a> | WhatsApp: +226 0505 0577</p>
        </div>
      </div>
    `

    // Batch sending via Resend
    for (const email of targetEmails) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [email],
          replyTo: "alfred@leguideai.com",
          subject: subject,
          html: fullHtml
        })
        successCount++
      } catch (err: any) {
        failureCount++
        errors.push({ email, error: err.message || err })
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failureCount: failureCount,
      totalRecipients: targetEmails.length,
      errors: errors.slice(0, 5)
    })
  } catch (err: any) {
    console.error("Newsletter broadcast error:", err)
    return NextResponse.json({ message: "Erreur serveur lors de la diffusion." }, { status: 500 })
  }
}

