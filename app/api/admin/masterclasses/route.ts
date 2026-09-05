import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendMasterclassRegistrationEmail } from "@/lib/email"
import { parsePhoneNumber } from "@/lib/countries"

export const dynamic = "force-dynamic"

// Helper pour extraire l'ID YouTube à partir d'un lien standard, raccourci ou ID brut
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return ""
  const clean = urlOrId.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean
  const vMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (vMatch && vMatch[1]) return vMatch[1]
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch && shortMatch[1]) return shortMatch[1]
  const embedMatch = clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch && embedMatch[1]) return embedMatch[1]
  const liveMatch = clean.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/)
  if (liveMatch && liveMatch[1]) return liveMatch[1]
  return clean
}

const DEFAULT_REPLAYS = [
  {
    id: "rep-1",
    title: "Masterclass #1 : Les Fondamentaux du Prompt Engineering & ChatGPT",
    description: "Apprenez à structurer des prompts professionnels pour obtenir des résultats précis dès la première tentative.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1h 15min",
    category: "Prompting",
    instructor: "Alfred Dah",
    date: "18 Août 2026",
    is_published: true,
    views: "1 240",
  },
  {
    id: "rep-2",
    title: "Masterclass #2 : Automatisation de vos tâches quotidiennes avec l'IA",
    description: "Découvrez comment connecter vos outils et créer des workflows automatisés sans écrire une seule ligne de code.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1h 22min",
    category: "Automatisation",
    instructor: "Alfred Dah",
    date: "11 Août 2026",
    is_published: true,
    views: "980",
  },
  {
    id: "rep-3",
    title: "Masterclass #3 : Création de Contenu & Stratégie Digitale avec l'IA",
    description: "Multipliez votre production de contenu (posts, visuels, scripts) par 10 grâce aux assistants IA spécialisés.",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1h 05min",
    category: "Création de Contenu",
    instructor: "Alfred Dah",
    date: "4 Août 2026",
    is_published: true,
    views: "1 450",
  }
]

// Helper robuste pour charger toutes les sessions et initialiser le stockage si vide
async function loadAllMasterclassSessions(): Promise<{ sessions: any[]; settingsMap: Record<string, string> }> {
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

  let sessions: any[] = []
  if (settingsMap.masterclass_sessions) {
    try {
      const parsed = JSON.parse(settingsMap.masterclass_sessions)
      if (Array.isArray(parsed) && parsed.length > 0) {
        sessions = parsed
      }
    } catch (e) {
      console.warn("Could not parse masterclass_sessions JSON:", e)
    }
  }

  // Si aucune session n'est encore enregistrée dans le tableau JSON, initialiser avec la session historique
  if (sessions.length === 0) {
    const scheduledAt = settingsMap.masterclass_date || new Date(Date.now() + 7 * 86400000).toISOString()
    const isActive = settingsMap.masterclass_is_active !== "false"
    const dateDisplay = settingsMap.masterclass_date_display || (scheduledAt ? new Date(scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Dimanche Prochain à 19h00 (GMT)")

    const initialSession = {
      id: "mc_default",
      title: settingsMap.masterclass_title || "Masterclass IA : Fondamentaux & Cas Pratiques en Direct",
      description: settingsMap.masterclass_description || "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct sur Google Meet. Démonstrations d'outils, cas pratiques et questions-réponses.",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah",
      scheduledAt: scheduledAt,
      dateDisplay: dateDisplay,
      thumbnailUrl: settingsMap.masterclass_thumbnail_url || "",
      whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://meet.google.com",
      duration: "1h 30min",
      status: "upcoming",
      is_active: isActive,
      created_at: new Date().toISOString()
    }

    sessions = [initialSession]

    // Sauvegarder immédiatement dans site_settings pour que les prochains ajouts n'écrasent rien
    try {
      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_sessions",
          value: JSON.stringify(sessions),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })
    } catch (saveErr) {
      console.warn("Could not initialize masterclass_sessions in site_settings:", saveErr)
    }
  }

  return { sessions, settingsMap }
}

// Helper pour synchroniser les clés individuelles avec la session active la plus proche
async function syncPrimarySessionKeys(sessions: any[]) {
  const now = Date.now()
  const upcomingSessions = sessions
    .filter(s => s.status === "upcoming" || (!s.status && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
    .sort((a, b) => {
      const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity
      const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity
      return timeA - timeB
    })

  const primary = upcomingSessions.find(s => s.is_active !== false) || upcomingSessions[0] || sessions[0]

  if (primary) {
    const updates = [
      { key: "masterclass_title", value: primary.title || "Masterclass IA en Direct" },
      { key: "masterclass_description", value: primary.description || "" },
      { key: "masterclass_date", value: primary.scheduledAt || "" },
      { key: "masterclass_date_display", value: primary.dateDisplay || "" },
      { key: "masterclass_thumbnail_url", value: primary.thumbnailUrl || "" },
      { key: "masterclass_whatsapp_group_url", value: primary.whatsappGroupUrl || "" },
      { key: "masterclass_youtube_url", value: primary.youtubeLiveUrl || "https://meet.google.com" },
      { key: "masterclass_instructor", value: primary.instructor || "Alfred Dah" },
      { key: "masterclass_is_active", value: primary.is_active !== false ? "true" : "false" }
    ]

    for (const item of updates) {
      await supabaseServer
        .from("site_settings")
        .upsert({ key: item.key, value: item.value, updated_at: new Date().toISOString() }, { onConflict: "key" })
    }
  }
}

export async function GET() {
  try {
    const { sessions, settingsMap } = await loadAllMasterclassSessions()

    // Séparer les sessions à venir et passées
    const now = Date.now()
    const upcomingSessions = sessions
      .filter(s => s.status === "upcoming" || (!s.status && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
      .sort((a, b) => {
        const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity
        const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity
        return timeA - timeB
      })

    const pastSessions = sessions
      .filter(s => s.status === "past" || (s.scheduledAt && new Date(s.scheduledAt).getTime() < now - 4 * 3600 * 1000 && s.status !== "upcoming"))
      .sort((a, b) => {
        const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
        const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
        return timeB - timeA
      })

    // La session la plus proche à venir
    const closestUpcomingSession = upcomingSessions.find(s => s.is_active !== false) || upcomingSessions[0] || sessions[0]

    let replays: any[] = []
    if (settingsMap.masterclass_replays) {
      try {
        const parsed = JSON.parse(settingsMap.masterclass_replays)
        if (Array.isArray(parsed)) {
          replays = parsed
        }
      } catch (pErr) {
        console.warn("Could not parse masterclass_replays JSON from Supabase:", pErr)
      }
    }

    // 2. Récupérer toutes les inscriptions liées aux Masterclasses (par course_slug, source ou notes)
    const { data: allRegistrations } = await supabaseServer
      .from("registrations")
      .select("id, full_name, email, whatsapp, country, status, created_at, notes, course_slug, source")
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

    // Récupérer les profils correspondants pour enrichir avec pays, profession/secteur et numéro WhatsApp officiel
    const participantEmails = (rawParticipants || []).map(p => p.email?.toLowerCase().trim()).filter(Boolean)
    const profileMap = new Map<string, any>()

    if (participantEmails.length > 0) {
      try {
        const { data: matchedProfiles } = await supabaseServer
          .from("profiles")
          .select("email, full_name, whatsapp, country, city, sector")
          .in("email", participantEmails)

        if (matchedProfiles && matchedProfiles.length > 0) {
          matchedProfiles.forEach(pr => {
            if (pr.email) profileMap.set(pr.email.toLowerCase().trim(), pr)
          })
        }
      } catch (profErr) {
        console.warn("Could not fetch profiles for masterclass participants:", profErr)
      }
    }

    const sessionMap = new Map<string, any>()
    sessions.forEach(s => { if (s.id) sessionMap.set(s.id, s) })
    replays.forEach(r => { if (r.id) sessionMap.set(r.id, r) })

    const activeThemeTitle = closestUpcomingSession?.title || settingsMap.masterclass_title || "Masterclass IA"

    const participants = (rawParticipants || []).map(p => {
      let masterclassId = "mc_default"
      let masterclassTitle = activeThemeTitle
      let parsedNotes: any = {}

      if (p.notes) {
        try {
          parsedNotes = typeof p.notes === "string" ? JSON.parse(p.notes) : p.notes
          if (parsedNotes.masterclass_id) masterclassId = parsedNotes.masterclass_id
          if (parsedNotes.masterclass_title) masterclassTitle = parsedNotes.masterclass_title
        } catch (_) {
          if (typeof p.notes === "string" && p.notes.length > 0) {
            masterclassTitle = p.notes
          }
        }
      }

      const matchedSession = sessionMap.get(masterclassId)

      const isGenericPlaceholder = !parsedNotes.masterclass_title || 
        parsedNotes.masterclass_title === "Masterclass IA en Direct" ||
        parsedNotes.masterclass_title === "Masterclass IA Interactive" ||
        parsedNotes.masterclass_title === "Masterclass IA" ||
        parsedNotes.masterclass_title === "Masterclass" ||
        parsedNotes.masterclass_title === "Session Direct Actuelle"

      if (matchedSession?.title) {
        masterclassTitle = matchedSession.title
      } else if (isGenericPlaceholder && activeThemeTitle) {
        masterclassTitle = activeThemeTitle
      }

      const emailNorm = p.email?.toLowerCase().trim()
      const prof = emailNorm ? profileMap.get(emailNorm) : null

      const resolvedWhatsApp = (p.whatsapp && !p.whatsapp.startsWith("wa_") && !p.whatsapp.includes("@"))
        ? p.whatsapp
        : (prof?.whatsapp || parsedNotes.whatsapp || parsedNotes.phone || "")

      const rawCountry = prof?.country || p.country || parsedNotes.country || parsedNotes.country_name || ""
      const resolvedSector = prof?.sector || parsedNotes.sector || parsedNotes.profession || parsedNotes.job || ""
      const resolvedCity = prof?.city || parsedNotes.city || ""

      // Déduction intelligente du pays :
      let resolvedCountry = rawCountry
      if (resolvedWhatsApp) {
        const parsed = parsePhoneNumber(resolvedWhatsApp)
        if (parsed?.country?.name) {
          // Si le pays est le faux fallback "CI" ou vide alors que le WhatsApp indique un autre pays (ex: Sénégal +221)
          if (!resolvedCountry || (resolvedCountry === "CI" && parsed.country.code !== "CI" && !resolvedCity && !resolvedSector)) {
            resolvedCountry = parsed.country.name
          }
        }
      }

      // Si le pays est encore resté sur le placeholder technique "CI" sans confirmation de ville/secteur ni téléphone ivoirien (+225)
      if (resolvedCountry === "CI" && !resolvedCity && !resolvedSector && (!resolvedWhatsApp || !resolvedWhatsApp.includes("225"))) {
        resolvedCountry = ""
      }

      const resolvedFullName = (p.full_name && p.full_name !== "Participant Masterclass" && !p.full_name.includes("@"))
        ? p.full_name
        : (prof?.full_name || parsedNotes.full_name || p.email?.split("@")[0] || "Apprenant")

      return {
        ...p,
        full_name: resolvedFullName,
        whatsapp: resolvedWhatsApp,
        country: resolvedCountry,
        sector: resolvedSector,
        city: resolvedCity,
        masterclass_id: masterclassId,
        masterclass_title: masterclassTitle,
        parsed_notes: parsedNotes
      }
    })

    return NextResponse.json({
      success: true,
      upcomingSession: closestUpcomingSession,
      sessions,
      upcomingSessions,
      pastSessions,
      replays,
      participants: participants || []
    })
  } catch (error: any) {
    console.error("Admin Masterclasses GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, sessionData, sessionId, replayData, replayId, participantData, participantId } = body

    // 1. Charger toutes les sessions existantes (garantit qu'aucune session historique n'est omise)
    const { sessions: existingSessions } = await loadAllMasterclassSessions()
    let sessionsList = [...existingSessions]

    if (action === "save_session" || action === "create_session" || action === "update_session") {
      const isNew = !sessionData.id || sessionData.id === "new" || sessionData.id === "create"
      const currentId = isNew ? `mc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` : sessionData.id

      const dateDisplay = sessionData.dateDisplay || (sessionData.scheduledAt ? new Date(sessionData.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "")

      const formattedSession = {
        id: currentId,
        title: sessionData.title || "Masterclass IA en Direct",
        description: sessionData.description || "",
        instructor: sessionData.instructor || "Alfred Dah",
        scheduledAt: sessionData.scheduledAt || "",
        dateDisplay: dateDisplay,
        thumbnailUrl: sessionData.thumbnailUrl || "",
        whatsappGroupUrl: sessionData.whatsappGroupUrl || "",
        youtubeLiveUrl: sessionData.youtubeLiveUrl || "https://meet.google.com",
        duration: sessionData.duration || "1h 30min",
        status: sessionData.status || "upcoming",
        is_active: sessionData.is_active !== false,
        updated_at: new Date().toISOString()
      }

      if (isNew) {
        // Ajouter la nouvelle session SANS écraser les anciennes
        sessionsList = [formattedSession, ...sessionsList]
      } else {
        // Mettre à jour la session existante ciblée
        const index = sessionsList.findIndex(s => s.id === currentId)
        if (index >= 0) {
          sessionsList[index] = { ...sessionsList[index], ...formattedSession }
        } else {
          // Si l'ID n'était pas trouvé, l'ajouter
          sessionsList = [formattedSession, ...sessionsList]
        }
      }

      // Sauvegarder la liste complète dans site_settings
      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_sessions",
          value: JSON.stringify(sessionsList),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })

      // Synchroniser la session active la plus proche pour les clés legacy
      await syncPrimarySessionKeys(sessionsList)

      const now = Date.now()
      const upcomingSessions = sessionsList
        .filter(s => s.status === "upcoming" || (!s.status && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
        .sort((a, b) => {
          const tA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity
          const tB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity
          return tA - tB
        })

      const pastSessions = sessionsList
        .filter(s => s.status === "past" || (s.scheduledAt && new Date(s.scheduledAt).getTime() < now - 4 * 3600 * 1000 && s.status !== "upcoming"))
        .sort((a, b) => {
          const tA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
          const tB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
          return tB - tA
        })

      return NextResponse.json({
        success: true,
        session: formattedSession,
        sessions: sessionsList,
        upcomingSessions,
        pastSessions,
        message: isNew ? "Nouvelle Masterclass programmée avec succès !" : "Masterclass mise à jour !"
      })
    }

    if (action === "delete_session") {
      const targetId = sessionId || sessionData?.id
      if (!targetId) {
        return NextResponse.json({ error: "ID de session requis." }, { status: 400 })
      }

      sessionsList = sessionsList.filter(s => s.id !== targetId)

      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_sessions",
          value: JSON.stringify(sessionsList),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })

      await syncPrimarySessionKeys(sessionsList)

      const now = Date.now()
      const upcomingSessions = sessionsList
        .filter(s => s.status === "upcoming" || (!s.status && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
        .sort((a, b) => (a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity) - (b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity))

      const pastSessions = sessionsList
        .filter(s => s.status === "past" || (s.scheduledAt && new Date(s.scheduledAt).getTime() < now - 4 * 3600 * 1000 && s.status !== "upcoming"))
        .sort((a, b) => (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0) - (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0))

      return NextResponse.json({
        success: true,
        sessions: sessionsList,
        upcomingSessions,
        pastSessions,
        message: "Masterclass supprimée avec succès !"
      })
    }

    if (action === "toggle_session_status") {
      const { id, status, is_active } = body
      sessionsList = sessionsList.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: status !== undefined ? status : s.status,
            is_active: is_active !== undefined ? is_active : s.is_active,
            updated_at: new Date().toISOString()
          }
        }
        return s
      })

      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_sessions",
          value: JSON.stringify(sessionsList),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })

      await syncPrimarySessionKeys(sessionsList)

      const now = Date.now()
      const upcomingSessions = sessionsList
        .filter(s => s.status === "upcoming" || (!s.status && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
        .sort((a, b) => (a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity) - (b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity))

      const pastSessions = sessionsList
        .filter(s => s.status === "past" || (s.scheduledAt && new Date(s.scheduledAt).getTime() < now - 4 * 3600 * 1000 && s.status !== "upcoming"))
        .sort((a, b) => (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0) - (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0))

      return NextResponse.json({
        success: true,
        sessions: sessionsList,
        upcomingSessions,
        pastSessions,
        message: "Statut mis à jour avec succès !"
      })
    }

    if (action === "add_replay" || action === "update_replay") {
      const { data: existingRow } = await supabaseServer
        .from("site_settings")
        .select("value")
        .eq("key", "masterclass_replays")
        .maybeSingle()

      let replays: any[] = DEFAULT_REPLAYS
      if (existingRow && existingRow.value) {
        try {
          const parsed = JSON.parse(existingRow.value)
          if (Array.isArray(parsed)) replays = parsed
        } catch (e) {}
      }

      const cleanYtId = extractYouTubeId(replayData.youtubeUrl || replayData.youtubeId || "")

      if (action === "add_replay") {
        const newReplay = {
          id: "rep-" + Date.now(),
          title: replayData.title,
          description: replayData.description || "",
          youtubeId: cleanYtId,
          youtubeUrl: replayData.youtubeUrl || `https://www.youtube.com/watch?v=${cleanYtId}`,
          duration: replayData.duration || "1h 30min",
          category: replayData.category || "Prompting",
          instructor: replayData.instructor || "Alfred Dah",
          date: replayData.date || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          is_published: replayData.is_published !== false,
          views: "0",
          created_at: new Date().toISOString()
        }
        replays = [newReplay, ...replays]
      } else {
        replays = replays.map((r) => {
          if (r.id === replayData.id) {
            return {
              ...r,
              ...replayData,
              youtubeId: cleanYtId || r.youtubeId,
              youtubeUrl: replayData.youtubeUrl || (cleanYtId ? `https://www.youtube.com/watch?v=${cleanYtId}` : r.youtubeUrl),
              updated_at: new Date().toISOString()
            }
          }
          return r
        })
      }

      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_replays",
          value: JSON.stringify(replays),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })

      return NextResponse.json({
        success: true,
        replays,
        message: action === "add_replay" ? "Replay ajouté avec succès !" : "Replay mis à jour !"
      })
    }

    if (action === "delete_replay") {
      const { data: existingRow } = await supabaseServer
        .from("site_settings")
        .select("value")
        .eq("key", "masterclass_replays")
        .maybeSingle()

      let replays: any[] = DEFAULT_REPLAYS
      if (existingRow && existingRow.value) {
        try {
          const parsed = JSON.parse(existingRow.value)
          if (Array.isArray(parsed)) replays = parsed
        } catch (e) {}
      }

      replays = replays.filter(r => r.id !== replayId)

      await supabaseServer
        .from("site_settings")
        .upsert({
          key: "masterclass_replays",
          value: JSON.stringify(replays),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })

      return NextResponse.json({
        success: true,
        replays,
        message: "Replay supprimé avec succès !"
      })
    }

    if (action === "add_participant") {
      const { participantData } = body
      if (!participantData?.email) {
        return NextResponse.json({ error: "Email requis pour l'inscription." }, { status: 400 })
      }

      const emailClean = participantData.email.toLowerCase().trim()
      const cleanWhatsApp = (participantData.whatsapp && participantData.whatsapp.trim()) 
        ? participantData.whatsapp.trim() 
        : `wa_${emailClean}`
      const cleanFullName = participantData.fullName || participantData.full_name || emailClean.split("@")[0]

      const masterclassId = participantData.masterclassId || participantData.masterclass_id || "current_live"
      const masterclassTitle = participantData.masterclassTitle || participantData.masterclass_title || "Masterclass IA Interactive"

      const regPayload = {
        full_name: cleanFullName,
        email: emailClean,
        whatsapp: cleanWhatsApp,
        country: participantData.country || "",
        source: "masterclass_dimanche",
        course_slug: "masterclass-ia",
        status: "inscrit",
        notes: JSON.stringify({
          added_by_admin: true,
          masterclass_id: masterclassId,
          masterclass_title: masterclassTitle,
          created_at: new Date().toISOString()
        })
      }

      let newParticipant: any = null
      const { data: insData, error: pErr } = await supabaseServer
        .from("registrations")
        .insert(regPayload)
        .select()
        .single()

      if (pErr) {
        if (pErr.code === "23505") {
          regPayload.whatsapp = `wa_${emailClean}_${Date.now()}`
          const { data: retryData, error: retryErr } = await supabaseServer
            .from("registrations")
            .insert(regPayload)
            .select()
            .single()
          if (retryErr) {
            return NextResponse.json({ error: retryErr.message }, { status: 500 })
          }
          newParticipant = retryData
        } else {
          return NextResponse.json({ error: pErr.message }, { status: 500 })
        }
      } else {
        newParticipant = insData
      }

      try {
        await supabaseServer.from("newsletter_subscribers").upsert({
          email: emailClean,
          name: participantData.fullName || participantData.full_name || emailClean.split("@")[0],
          status: "active",
          subscribed_at: new Date().toISOString()
        }, { onConflict: "email" })
      } catch (nErr) {}

      return NextResponse.json({
        success: true,
        participant: newParticipant,
        message: "Apprenant inscrit à la Masterclass avec succès !"
      })
    }

    if (action === "batch_enroll_users") {
      const {
        sessionId = "current_live",
        sessionTitle = "Masterclass IA en Direct",
        sessionData,
        users = [],
        sendEmail = true,
        requesterEmail
      } = body

      // 🛡️ Sécurité stricte : Seul samba@leguideai.com est autorisé
      const cleanRequester = String(requesterEmail || "").toLowerCase().trim()
      if (cleanRequester !== "samba@leguideai.com") {
        return NextResponse.json(
          { error: "Accès refusé : Seul le super-administrateur fondateur (samba@leguideai.com) peut inscrire des utilisateurs en masse." },
          { status: 403 }
        )
      }

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: "Aucun utilisateur sélectionné pour l'inscription." }, { status: 400 })
      }

      // Récupérer les informations de la session pour l'email
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

      // Trouver les détails de la session (sessionData passé par le client ou trouvé dans sessionsList)
      let targetSessionObj: any = sessionData || null
      if (!targetSessionObj && sessionsList.length > 0) {
        targetSessionObj = sessionsList.find(s => s.id === sessionId)
        if (!targetSessionObj && (sessionId === "current_live" || sessionId === "mc_default" || !sessionId)) {
          targetSessionObj = sessionsList.find(s => s.status === "upcoming" || s.is_active !== false) || sessionsList[0]
        }
      }

      const liveMeetUrl = targetSessionObj?.youtubeLiveUrl || targetSessionObj?.meetUrl || targetSessionObj?.meet_url || settingsMap.masterclass_youtube_url || "https://meet.google.com"

      const sessionInfo = {
        title: targetSessionObj?.title || sessionTitle || settingsMap.masterclass_title || "Masterclass IA en Direct",
        scheduledAt: targetSessionObj?.scheduledAt || settingsMap.masterclass_date || "",
        dateDisplay: targetSessionObj?.dateDisplay || settingsMap.masterclass_date_display || "",
        whatsappGroupUrl: targetSessionObj?.whatsappGroupUrl || settingsMap.masterclass_whatsapp_group_url || "",
        youtubeLiveUrl: liveMeetUrl,
        instructor: targetSessionObj?.instructor || settingsMap.masterclass_instructor || "Alfred Dah"
      }

      const enrolledParticipants: any[] = []
      const errors: string[] = []

      for (const u of users) {
        const emailClean = (u.email || "").toLowerCase().trim()
        if (!emailClean) continue

        // Double protection : ignorer tout compte admin ou superadmin
        if (u.role === "admin" || u.role === "super_admin" || emailClean === "samba@leguideai.com") {
          continue
        }

        const fullName = (u.full_name && u.full_name.trim() && !u.full_name.includes("@"))
          ? u.full_name.trim()
          : (emailClean.split("@")[0] || "Apprenant")

        const whatsapp = (u.whatsapp && u.whatsapp.trim())
          ? u.whatsapp.trim()
          : `wa_${emailClean}`

        const country = u.country || ""
        const sector = u.sector || ""
        const city = u.city || ""

        try {
          // Vérifier si déjà présent dans registrations
          const { data: existingRegs } = await supabaseServer
            .from("registrations")
            .select("id, notes, full_name, whatsapp, country")
            .ilike("email", emailClean)
            .limit(1)

          const existing = existingRegs && existingRegs.length > 0 ? existingRegs[0] : null

          let savedReg: any = null

          if (existing) {
            let existingNotes: any = {}
            try {
              existingNotes = typeof existing.notes === "string" ? JSON.parse(existing.notes) : (existing.notes || {})
            } catch (_) {}

            const registeredMasterclasses = Array.isArray(existingNotes.registered_masterclasses)
              ? existingNotes.registered_masterclasses
              : (existingNotes.masterclass_id ? [existingNotes.masterclass_id] : [])

            if (!registeredMasterclasses.includes(sessionId)) {
              registeredMasterclasses.push(sessionId)
            }

            const updatedNotes = {
              ...existingNotes,
              added_by_admin: true,
              enrolled_by: "samba@leguideai.com",
              masterclass_id: sessionId,
              masterclass_title: sessionInfo.title,
              registered_masterclasses: registeredMasterclasses,
              profession: sector || existingNotes.profession || "",
              sector: sector || existingNotes.sector || "",
              country: country || existingNotes.country || "",
              city: city || existingNotes.city || "",
              last_masterclass_at: new Date().toISOString()
            }

            const { data: updData, error: updErr } = await supabaseServer
              .from("registrations")
              .update({
                notes: JSON.stringify(updatedNotes),
                course_slug: "masterclass-ia",
                status: "inscrit"
              })
              .eq("id", existing.id)
              .select()
              .single()

            if (!updErr && updData) {
              savedReg = updData
            } else {
              savedReg = existing
            }
          } else {
            const newPayload = {
              full_name: fullName,
              email: emailClean,
              whatsapp: whatsapp,
              country: country,
              source: "admin_batch_enrollment",
              course_slug: "masterclass-ia",
              status: "inscrit",
              notes: JSON.stringify({
                added_by_admin: true,
                enrolled_by: "samba@leguideai.com",
                masterclass_id: sessionId,
                masterclass_title: sessionInfo.title,
                registered_masterclasses: [sessionId],
                profession: sector,
                sector: sector,
                country: country,
                city: city,
                registered_at: new Date().toISOString()
              })
            }

            let { data: insData, error: insErr } = await supabaseServer
              .from("registrations")
              .insert(newPayload)
              .select()
              .single()

            if (insErr && insErr.code === "23505") {
              newPayload.whatsapp = `wa_${emailClean}_${Date.now()}`
              const { data: retryData } = await supabaseServer
                .from("registrations")
                .insert(newPayload)
                .select()
                .single()
              insData = retryData
            }

            if (insData) {
              savedReg = insData
            }
          }

          if (savedReg) {
            enrolledParticipants.push({
              ...savedReg,
              full_name: fullName,
              email: emailClean,
              whatsapp: whatsapp,
              country: country,
              sector: sector,
              city: city,
              masterclass_id: sessionId,
              masterclass_title: sessionInfo.title,
              parsed_notes: {
                added_by_admin: true,
                masterclass_id: sessionId,
                masterclass_title: sessionInfo.title
              }
            })
          }

          // Inscription newsletter
          try {
            await supabaseServer.from("newsletter_subscribers").upsert({
              email: emailClean,
              name: fullName,
              status: "active",
              subscribed_at: new Date().toISOString()
            }, { onConflict: "email" })
          } catch (_) {}

          // Envoi d'email de confirmation si demandé
          if (sendEmail) {
            try {
              await sendMasterclassRegistrationEmail(fullName, emailClean, sessionInfo)
            } catch (emErr) {
              console.warn(`Could not send confirmation email to ${emailClean}:`, emErr)
            }
          }
        } catch (itemErr: any) {
          errors.push(`${emailClean}: ${itemErr.message}`)
        }
      }

      return NextResponse.json({
        success: true,
        enrolledCount: enrolledParticipants.length,
        participants: enrolledParticipants,
        errors: errors.length > 0 ? errors : undefined,
        message: `${enrolledParticipants.length} apprenant(s) inscrit(s) avec succès à la Masterclass !`
      })
    }

    if (action === "delete_participant") {
      const { participantId } = body
      if (!participantId) {
        return NextResponse.json({ error: "ID participant requis." }, { status: 400 })
      }

      const { error: delErr } = await supabaseServer
        .from("registrations")
        .delete()
        .eq("id", participantId)

      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Inscription supprimée avec succès !"
      })
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 })
  } catch (error: any) {
    console.error("Admin Masterclasses POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
