import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendMasterclassReminderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function runMasterclassCron(isManualTrigger = false) {
  const now = Date.now()
  const results: any = {
    executedAt: new Date().toISOString(),
    isManualTrigger,
    sessionsEvaluated: 0,
    activeSessions: [],
    remindersSent: {
      j_minus_2: 0,
      h_minus_1: 0
    },
    skippedAlreadySent: 0,
    errors: []
  }

  // 1. Récupérer les paramètres et les sessions depuis site_settings
  const { data: rows, error: settingsErr } = await supabaseServer
    .from("site_settings")
    .select("key, value")

  if (settingsErr) {
    results.errors.push(`Settings fetch error: ${settingsErr.message}`)
    return results
  }

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

  // Fallback sur les paramètres par défaut si aucune session dans la liste JSON
  if (sessionsList.length === 0 && settingsMap.masterclass_date) {
    sessionsList = [{
      id: "mc_default",
      title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: settingsMap.masterclass_description || "",
      scheduledAt: settingsMap.masterclass_date,
      dateDisplay: settingsMap.masterclass_date_display || "",
      whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://meet.google.com",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah",
      is_active: settingsMap.masterclass_is_active !== "false",
      status: "upcoming"
    }]
  }

  // Filtrer uniquement les sessions actives et futures (ou dans la tolérance de 4h)
  const activeUpcoming = sessionsList.filter(s => {
    if (s.is_active === false || s.status === "past") return false
    if (!s.scheduledAt) return false
    const sched = new Date(s.scheduledAt).getTime()
    return !isNaN(sched) && sched >= now - (2 * 3600 * 1000)
  })

  results.sessionsEvaluated = sessionsList.length
  results.activeSessions = activeUpcoming.map(s => ({
    id: s.id,
    title: s.title,
    scheduledAt: s.scheduledAt
  }))

  if (activeUpcoming.length === 0) {
    return results
  }

  // 2. Charger tous les inscrits aux masterclasses
  const { data: allRegistrations, error: regErr } = await supabaseServer
    .from("registrations")
    .select("id, full_name, email, notes, course_slug, source")
    .order("created_at", { ascending: false })

  if (regErr) {
    results.errors.push(`Registrations fetch error: ${regErr.message}`)
    return results
  }

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

  // 3. Évaluer chaque session à venir
  for (const session of activeUpcoming) {
    const scheduledTime = new Date(session.scheduledAt).getTime()
    const diffMs = scheduledTime - now
    const hoursUntil = diffMs / (1000 * 60 * 60)

    let reminderType: "j_minus_2" | "h_minus_1" | null = null

    // Fenêtre J-2 : Entre 48h et 2h avant le direct (déclenche dès qu'on entre dans les 48h)
    // Fenêtre H-1 : Moins de 2h avant le direct et jusqu'au début
    if (hoursUntil <= 2 && hoursUntil > -0.5) {
      reminderType = "h_minus_1"
    } else if (hoursUntil <= 48 && hoursUntil > 2) {
      reminderType = "j_minus_2"
    }

    if (!reminderType) {
      continue
    }

    const sessionIdLower = String(session.id || "").toLowerCase().trim()
    const sessionTitleLower = String(session.title || "").toLowerCase().trim()

    // Identifier les participants pour cette session
    const targetParticipants = rawParticipants.filter(p => {
      if (!p.email || !p.email.includes("@")) return false

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

      // 1. Match direct par ID de session
      if (pRegisteredList.includes(sessionIdLower)) return true

      // 2. Si session par défaut ou première session
      if (sessionIdLower === "mc_default" || sessionIdLower === "current_live") {
        if (pMasterclassId === "current_live" || pMasterclassId === "mc_default" || !pMasterclassId) {
          return true
        }
      }

      // 3. Match par titre approchant
      if (sessionTitleLower && pMasterclassTitle) {
        const pTitleLower = pMasterclassTitle.toLowerCase().trim()
        if (sessionTitleLower.includes(pTitleLower) || pTitleLower.includes(sessionTitleLower)) {
          return true
        }
      }

      return false
    })

    const sessionObjForEmail = {
      title: session.title || "Masterclass IA Interactive en Direct",
      scheduledAt: session.scheduledAt,
      dateDisplay: session.dateDisplay,
      whatsappGroupUrl: session.whatsappGroupUrl || settingsMap.masterclass_whatsapp_group_url,
      youtubeLiveUrl: session.youtubeLiveUrl || session.meetUrl || settingsMap.masterclass_youtube_url || "https://meet.google.com",
      instructor: session.instructor || settingsMap.masterclass_instructor || "Alfred Dah"
    }

    // 4. Envoi cadencé avec protection anti-doublon absolue
    for (const p of targetParticipants) {
      let parsedNotes: any = {}
      if (p.notes) {
        try {
          parsedNotes = typeof p.notes === "string" ? JSON.parse(p.notes) : (p.notes || {})
        } catch (_) {
          parsedNotes = {}
        }
      }

      const remindersSent = parsedNotes.reminders_sent || {}
      const reminderKey = `${session.id}_${reminderType}`

      // Si déjà envoyé pour cette session et ce jalon, NE PAS RENVOYER
      if (remindersSent[reminderKey]) {
        results.skippedAlreadySent++
        continue
      }

      // Temporisation de 350ms pour respecter les limites Resend (max 2 req/s)
      await sleep(350)

      try {
        const res = await sendMasterclassReminderEmail(
          p.full_name || "Apprenant",
          p.email.trim(),
          sessionObjForEmail,
          reminderType
        )

        if (res.success) {
          // Marquer comme envoyé dans Supabase immédiatement
          remindersSent[reminderKey] = new Date().toISOString()
          parsedNotes.reminders_sent = remindersSent

          await supabaseServer
            .from("registrations")
            .update({
              notes: JSON.stringify(parsedNotes)
            })
            .eq("id", p.id)

          results.remindersSent[reminderType]++
        } else {
          results.errors.push(`${p.email}: ${res.error || "Erreur Resend"}`)
        }
      } catch (sendErr: any) {
        results.errors.push(`${p.email}: ${sendErr.message}`)
      }
    }
  }

  return results
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    // Autoriser si pas de secret configuré ou si le token correspond
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url)
      const querySecret = url.searchParams.get("key")
      if (querySecret !== cronSecret) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
      }
    }

    const results = await runMasterclassCron(false)
    return NextResponse.json({
      success: true,
      message: `Cron Masterclasses exécuté : ${results.remindersSent.j_minus_2} rappel(s) J-2, ${results.remindersSent.h_minus_1} rappel(s) H-1 envoyés, ${results.skippedAlreadySent} déjà traités.`,
      ...results
    })
  } catch (error: any) {
    console.error("Cron masterclass error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Déclencheur manuel (depuis le tableau de bord admin)
    const results = await runMasterclassCron(true)
    return NextResponse.json({
      success: true,
      message: `Vérification automatique effectuée : ${results.remindersSent.j_minus_2} rappel(s) J-2, ${results.remindersSent.h_minus_1} rappel(s) H-1 envoyés, ${results.skippedAlreadySent} déjà traités.`,
      ...results
    })
  } catch (error: any) {
    console.error("Manual masterclass cron trigger error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
