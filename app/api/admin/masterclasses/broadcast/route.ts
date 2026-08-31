import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { 
  sendMasterclassReminderEmail, 
  sendMasterclassPlatformInvitationEmail,
  sendMasterclassTargetedEmail
} from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      target = "all_platform_users", // "all_platform_users" | "registered_only" | "specific_masterclass"
      masterclassId = "current_live",
      masterclassTitle = "",
      emailType = "reminder", // "reminder" | "replay" | "custom" | "invitation"
      reminderType = "j_minus_2", 
      subject = "",
      customMessage = "", 
      testEmail 
    } = body

    // 1. Récupérer la session active et les replays
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

    let replaysList: any[] = []
    if (settingsMap.masterclass_replays) {
      try {
        replaysList = JSON.parse(settingsMap.masterclass_replays)
      } catch (_) {}
    }

    let chosenSession: any = {
      title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: settingsMap.masterclass_description || "",
      scheduledAt: settingsMap.masterclass_date || "",
      dateDisplay: settingsMap.masterclass_date_display || "",
      thumbnailUrl: settingsMap.masterclass_thumbnail_url || "",
      whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah"
    }

    if (masterclassId && masterclassId !== "current_live") {
      const foundReplay = replaysList.find(r => r.id === masterclassId)
      if (foundReplay) {
        chosenSession = {
          title: foundReplay.title || masterclassTitle,
          description: foundReplay.description || "",
          scheduledAt: "",
          dateDisplay: foundReplay.date || "",
          thumbnailUrl: foundReplay.thumbnail || "",
          whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
          youtubeLiveUrl: foundReplay.youtubeUrl || `https://www.youtube.com/watch?v=${foundReplay.youtubeId || ''}`,
          instructor: foundReplay.instructor || "Alfred Dah"
        }
      } else if (masterclassTitle) {
        chosenSession.title = masterclassTitle
      }
    } else if (masterclassTitle) {
      chosenSession.title = masterclassTitle
    }

    const emailSubject = subject || (
      emailType === "replay" 
        ? `📼 Replay & Ressources disponibles : ${chosenSession.title}`
        : emailType === "reminder"
        ? `⏰ Rappel Masterclass en Direct : ${chosenSession.title}`
        : `📢 Information importante Masterclass : ${chosenSession.title}`
    )

    // 2. Si c'est un envoi de test
    if (testEmail) {
      let result: any
      if (target === "all_platform_users" && emailType === "invitation") {
        result = await sendMasterclassPlatformInvitationEmail(
          "Testeur Admin",
          testEmail.trim(),
          chosenSession
        )
      } else if (emailType === "reminder" && !customMessage) {
        result = await sendMasterclassReminderEmail(
          "Testeur Admin",
          testEmail.trim(),
          chosenSession,
          reminderType,
          customMessage
        )
      } else {
        result = await sendMasterclassTargetedEmail({
          name: "Testeur Admin",
          email: testEmail.trim(),
          subject: `[TEST] ${emailSubject}`,
          emailType: (emailType as any) || "custom",
          customMessage,
          session: chosenSession
        })
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
        .select("email, name, full_name")

      if (subs) {
        subs.forEach(s => {
          if (s.email && s.email.includes("@")) {
            recipientMap.set(s.email.toLowerCase().trim(), s.full_name || s.name || "")
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
      // Uniquement les inscrits à la Masterclass (filtrés si specific_masterclass)
      const { data: rawParticipants } = await supabaseServer
        .from("registrations")
        .select("email, full_name, notes, course_slug, source")
        .or("course_slug.ilike.%masterclass%,source.ilike.%masterclass%,course_slug.eq.masterclass-ia,course_slug.eq.masterclass-live,source.eq.masterclass_dimanche")

      if (rawParticipants) {
        rawParticipants.forEach(p => {
          if (!p.email || !p.email.includes("@")) return

          let pMasterclassId = "current_live"
          let pMasterclassTitle = ""
          if (p.notes) {
            try {
              const parsed = typeof p.notes === "string" ? JSON.parse(p.notes) : p.notes
              if (parsed.masterclass_id) pMasterclassId = parsed.masterclass_id
              if (parsed.masterclass_title) pMasterclassTitle = parsed.masterclass_title
            } catch (_) {
              if (typeof p.notes === "string") pMasterclassTitle = p.notes
            }
          }

          if (target === "specific_masterclass") {
            const matchesId = pMasterclassId === masterclassId
            const matchesTitle = masterclassTitle && pMasterclassTitle && (
              pMasterclassTitle.toLowerCase().includes(masterclassTitle.toLowerCase()) ||
              masterclassTitle.toLowerCase().includes(pMasterclassTitle.toLowerCase())
            )
            // If target is current_live, include records with current_live or default
            if (masterclassId === "current_live") {
              if (matchesId || !pMasterclassId || matchesTitle) {
                recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
              }
            } else {
              if (matchesId || matchesTitle) {
                recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
              }
            }
          } else {
            // registered_only (all masterclasses)
            recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
          }
        })
      }
    }

    const recipientsList = Array.from(recipientMap.entries()).map(([email, name]) => ({ email, name }))

    if (recipientsList.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Aucun apprenant trouvé pour cette cible."
      }, { status: 400 })
    }

    let sentCount = 0
    let failedCount = 0

    // Envoi séquentiel avec gestion des erreurs
    for (const r of recipientsList) {
      try {
        let res: any
        if (target === "all_platform_users" && emailType === "invitation") {
          res = await sendMasterclassPlatformInvitationEmail(
            r.name || "Membre",
            r.email,
            chosenSession
          )
        } else if (emailType === "reminder" && !customMessage) {
          res = await sendMasterclassReminderEmail(
            r.name || "Apprenant",
            r.email,
            chosenSession,
            reminderType,
            customMessage
          )
        } else {
          res = await sendMasterclassTargetedEmail({
            name: r.name || "Apprenant",
            email: r.email,
            subject: emailSubject,
            emailType: (emailType as any) || "custom",
            customMessage,
            session: chosenSession
          })
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
      message: `Emails envoyés avec succès : ${sentCount} réussis, ${failedCount} échoués sur ${recipientsList.length} apprenants ciblés.`,
      sentCount,
      failedCount,
      total: recipientsList.length
    })
  } catch (error: any) {
    console.error("Broadcast masterclass error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
