import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { 
  sendMasterclassReminderEmail, 
  sendMasterclassPlatformInvitationEmail,
  sendMasterclassTargetedEmail
} from "@/lib/email"

export const dynamic = "force-dynamic"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      target = "all_platform_users", // "all_platform_users" | "registered_only" | "specific_masterclass"
      masterclassId = "current_live",
      masterclassTitle = "",
      emailType = "reminder", // "reminder" | "replay" | "custom" | "invitation"
      reminderType = "j_minus_2", // "j_minus_2" | "h_minus_1" | "custom"
      subject = "",
      customMessage = "", 
      testEmail 
    } = body

    // 1. Récupérer les paramètres, les sessions configurées et les replays
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

    let sessionsList: any[] = []
    if (settingsMap.masterclass_sessions) {
      try {
        const parsed = JSON.parse(settingsMap.masterclass_sessions)
        if (Array.isArray(parsed)) sessionsList = parsed
      } catch (_) {}
    }

    let replaysList: any[] = []
    if (settingsMap.masterclass_replays) {
      try {
        replaysList = JSON.parse(settingsMap.masterclass_replays)
      } catch (_) {}
    }

    // Trouver la session ou le replay ciblé
    let matchedSessionObj: any = null

    if (masterclassId && masterclassId !== "current_live") {
      // 1. Chercher dans les sessions programmées
      matchedSessionObj = sessionsList.find(s => s.id === masterclassId)

      // 2. Si pas trouvé, chercher dans les replays
      if (!matchedSessionObj) {
        matchedSessionObj = replaysList.find(r => r.id === masterclassId)
      }

      // 3. Si toujours pas trouvé, chercher par titre
      if (!matchedSessionObj && masterclassTitle) {
        const titleLower = masterclassTitle.toLowerCase()
        matchedSessionObj = sessionsList.find(s => (s.title || "").toLowerCase().includes(titleLower)) ||
                            replaysList.find(r => (r.title || "").toLowerCase().includes(titleLower))
      }
    } else {
      // "current_live" -> Trouver la première session active ou à venir
      const now = Date.now()
      matchedSessionObj = sessionsList.find(s => s.status === "upcoming" || (!s.status && s.is_active !== false && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000))) ||
                          sessionsList.find(s => s.is_active !== false) ||
                          sessionsList[0]
    }

    const liveMeetUrl = matchedSessionObj?.youtubeLiveUrl || 
                        matchedSessionObj?.meetUrl || 
                        matchedSessionObj?.meet_url || 
                        settingsMap.masterclass_youtube_url || 
                        "https://meet.google.com"

    let chosenSession: any = {
      id: matchedSessionObj?.id || masterclassId,
      title: matchedSessionObj?.title || masterclassTitle || settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: matchedSessionObj?.description || settingsMap.masterclass_description || "",
      scheduledAt: matchedSessionObj?.scheduledAt || settingsMap.masterclass_date || "",
      dateDisplay: matchedSessionObj?.dateDisplay || settingsMap.masterclass_date_display || "",
      thumbnailUrl: matchedSessionObj?.thumbnailUrl || matchedSessionObj?.thumbnail || settingsMap.masterclass_thumbnail_url || "",
      whatsappGroupUrl: matchedSessionObj?.whatsappGroupUrl || settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: liveMeetUrl,
      instructor: matchedSessionObj?.instructor || settingsMap.masterclass_instructor || "Alfred Dah"
    }

    const emailSubject = subject || (
      emailType === "replay" 
        ? `📼 Replay & Ressources disponibles : ${chosenSession.title}`
        : emailType === "reminder"
        ? (reminderType === "h_minus_1" 
            ? `🔴 EN DIRECT DANS 1 HEURE : ${chosenSession.title}`
            : `⏳ Dans 48h : Masterclass IA en Direct — ${chosenSession.title}`)
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
          reminderType as any,
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

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: `Échec de l'envoi test vers ${testEmail} : ${result.error || "Erreur Resend"}`
        }, { status: 400 })
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
      // 3.A Inscrits de la newsletter
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

      // 3.B Tous les apprenants inscrits à des bootcamps/formations
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

      // 3.C Comptes utilisateurs Supabase Auth
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
      // Inscrits aux Masterclasses
      const { data: allRegistrations } = await supabaseServer
        .from("registrations")
        .select("id, full_name, email, notes, course_slug, source")
        .order("created_at", { ascending: false })

      const rawParticipants = (allRegistrations || []).filter((r) => {
        const slug = String(r.course_slug || "").toLowerCase()
        const src = String(r.source || "").toLowerCase()
        if (slug.includes("masterclass") || src.includes("masterclass") || src.includes("dimanche")) return true

        if (r.notes) {
          try {
            const pNotes = typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes
            if (pNotes) {
              if (pNotes.masterclass_id || pNotes.masterclass_title) return true
              if (Array.isArray(pNotes.registered_masterclasses) && pNotes.registered_masterclasses.length > 0) return true
              if (pNotes.source && String(pNotes.source).toLowerCase().includes("masterclass")) return true
            }
          } catch (_) {
            if (typeof r.notes === "string" && r.notes.toLowerCase().includes("masterclass")) return true
          }
        }
        return false
      })

      const targetIdLower = String(masterclassId || "").toLowerCase().trim()
      const chosenSessionIdLower = String(chosenSession.id || "").toLowerCase().trim()
      const titleLower = String(chosenSession.title || masterclassTitle || "").toLowerCase().trim()

      rawParticipants.forEach(p => {
        if (!p.email || !p.email.includes("@")) return

        let pMasterclassId = "current_live"
        let pMasterclassTitle = ""
        let pRegisteredList: string[] = []

        if (p.notes) {
          try {
            const parsed = typeof p.notes === "string" ? JSON.parse(p.notes) : p.notes
            if (parsed) {
              if (parsed.masterclass_id) pMasterclassId = parsed.masterclass_id
              if (parsed.masterclass_title) pMasterclassTitle = parsed.masterclass_title
              if (Array.isArray(parsed.registered_masterclasses)) {
                pRegisteredList = parsed.registered_masterclasses.map((id: any) => String(id).toLowerCase().trim())
              }
            }
          } catch (_) {
            if (typeof p.notes === "string") pMasterclassTitle = p.notes
          }
        }

        if (pMasterclassId && !pRegisteredList.includes(pMasterclassId.toLowerCase())) {
          pRegisteredList.push(pMasterclassId.toLowerCase())
        }

        if (target === "specific_masterclass" && masterclassId !== "all_masterclasses") {
          let isMatch = false

          // Match direct par ID de session ou replay
          if (pRegisteredList.includes(targetIdLower) || pRegisteredList.includes(chosenSessionIdLower)) {
            isMatch = true
          }

          // Si la cible est "current_live", inclure les inscrits récents ou session par défaut
          if (masterclassId === "current_live") {
            if (
              pMasterclassId === "current_live" || 
              pMasterclassId === "mc_default" || 
              !pMasterclassId || 
              pRegisteredList.includes("current_live") || 
              pRegisteredList.includes("mc_default")
            ) {
              isMatch = true
            }
          }

          // Match par ressemblance de titre
          if (!isMatch && titleLower && pMasterclassTitle) {
            const pTitleLower = pMasterclassTitle.toLowerCase().trim()
            if (titleLower.includes(pTitleLower) || pTitleLower.includes(titleLower)) {
              isMatch = true
            }
          }

          if (isMatch) {
            recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
          }
        } else {
          // registered_only ou all_masterclasses -> inclure tous les inscrits Masterclass
          recipientMap.set(p.email.toLowerCase().trim(), p.full_name || "")
        }
      })
    }

    const recipientsList = Array.from(recipientMap.entries()).map(([email, name]) => ({ email, name }))

    if (recipientsList.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Aucun apprenant trouvé pour cette sélection (« ${chosenSession.title} »). Vérifiez que des apprenants sont bien inscrits à cette session.`
      }, { status: 400 })
    }

    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Envoi cadencé avec temporisation de 350ms pour respecter les rate limits de Resend (max 2 req/s)
    for (let i = 0; i < recipientsList.length; i++) {
      const r = recipientsList[i]

      // Pause anti-blocage après le premier envoi
      if (i > 0) {
        await sleep(350)
      }

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
            reminderType as any,
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

        if (res && res.success) {
          sentCount++
        } else {
          failedCount++
          const errMsg = res?.error || "Erreur inconnue"
          errors.push(`${r.email}: ${errMsg}`)
          console.warn(`Email broadcast failed for ${r.email}:`, errMsg)
        }
      } catch (e: any) {
        failedCount++
        errors.push(`${r.email}: ${e.message}`)
        console.error(`Failed to send broadcast email to ${r.email}:`, e)
      }
    }

    return NextResponse.json({
      success: sentCount > 0,
      message: `Diffusion terminée : ${sentCount} email(s) distribué(s) avec succès${failedCount > 0 ? `, ${failedCount} échec(s)` : ""} sur ${recipientsList.length} destinataire(s).`,
      sentCount,
      failedCount,
      total: recipientsList.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })
  } catch (error: any) {
    console.error("Broadcast masterclass error:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur lors de la diffusion." }, { status: 500 })
  }
}
