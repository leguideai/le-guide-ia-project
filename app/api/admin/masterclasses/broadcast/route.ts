import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendMasterclassReminderEmail, sendMasterclassPlatformInvitationEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      target = "all_platform_users", // "all_platform_users" | "registered_only"
      reminderType = "j_minus_2", 
      customMessage = "", 
      testEmail 
    } = body

    // 1. Récupérer la session active
    const { data: rows } = await supabaseServer
      .from("site_settings")
      .select("key, value")

    const settingsMap: Record<string, string> = {}
    if (rows && rows.length > 0) {
      rows.forEach((r) => {
        if (r.key && r.value !== undefined) {
          settingsMap[r.key] = r.value
        }
      })
    }

    const sessionData = {
      title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: settingsMap.masterclass_description || "",
      scheduledAt: settingsMap.masterclass_date || "",
      dateDisplay: settingsMap.masterclass_date_display || "",
      thumbnailUrl: settingsMap.masterclass_thumbnail_url || "",
      whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah"
    }

    // 2. Si c'est un envoi de test
    if (testEmail) {
      let result: any
      if (target === "all_platform_users") {
        result = await sendMasterclassPlatformInvitationEmail(
          "Testeur Admin",
          testEmail.trim(),
          sessionData
        )
      } else {
        result = await sendMasterclassReminderEmail(
          "Testeur Admin",
          testEmail.trim(),
          sessionData,
          reminderType,
          customMessage
        )
      }
      return NextResponse.json({
        success: true,
        message: `Email test envoyé avec succès à ${testEmail}`,
        result
      })
    }

    // 3. Récupérer les destinataires
    let recipientMap = new Map<string, string>() // email -> name

    if (target === "all_platform_users") {
      // 3.A Récupérer les inscrits de la newsletter
      const { data: subs } = await supabaseServer
        .from("newsletter_subscribers")
        .select("email, full_name")

      if (subs) {
        subs.forEach(s => {
          if (s.email && s.email.includes("@")) {
            recipientMap.set(s.email.toLowerCase().trim(), s.full_name || "")
          }
        })
      }

      // 3.B Récupérer tous les apprenants inscrits à des bootcamps/formations
      const { data: regs } = await supabaseServer
        .from("registrations")
        .select("email, full_name")

      if (regs) {
        regs.forEach(r => {
          if (r.email && r.email.includes("@")) {
            recipientMap.set(r.email.toLowerCase().trim(), r.full_name || "")
          }
        })
      }

      // 3.C Récupérer tous les comptes utilisateurs Supabase Auth
      try {
        const { data: authUsers } = await supabaseServer.auth.admin.listUsers({ perPage: 1000 })
        if (authUsers && authUsers.users) {
          authUsers.users.forEach(u => {
            if (u.email && u.email.includes("@")) {
              const name = u.user_metadata?.full_name || ""
              if (!recipientMap.has(u.email.toLowerCase().trim())) {
                recipientMap.set(u.email.toLowerCase().trim(), name)
              }
            }
          })
        }
      } catch (authErr) {
        console.warn("Could not list auth users:", authErr)
      }
    } else {
      // Uniquement les inscrits à la Masterclass
      const { data: participants } = await supabaseServer
        .from("registrations")
        .select("email, full_name")
        .or("course_slug.eq.masterclass-ia,source.eq.masterclass_dimanche")

      if (participants) {
        participants.forEach(p => {
          if (p.email && p.email.includes("@")) {
            recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
          }
        })
      }
    }

    const recipientsList = Array.from(recipientMap.entries()).map(([email, name]) => ({ email, name }))

    if (recipientsList.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Aucun utilisateur trouvé pour l'envoi."
      }, { status: 400 })
    }

    let sentCount = 0
    let failedCount = 0

    // Envoi par lots de 5 pour éviter les surcharges Resend
    for (const r of recipientsList) {
      try {
        let res: any
        if (target === "all_platform_users") {
          res = await sendMasterclassPlatformInvitationEmail(
            r.name || "Membre",
            r.email,
            sessionData
          )
        } else {
          res = await sendMasterclassReminderEmail(
            r.name || "Apprenant",
            r.email,
            sessionData,
            reminderType,
            customMessage
          )
        }

        if (res.success) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (e) {
        console.error(`Failed to send email to ${r.email}:`, e)
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails envoyés avec succès : ${sentCount} réussis, ${failedCount} échoués sur ${recipientsList.length} destinataires.`,
      sentCount,
      failedCount,
      total: recipientsList.length
    })
  } catch (error: any) {
    console.error("Broadcast masterclass error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
