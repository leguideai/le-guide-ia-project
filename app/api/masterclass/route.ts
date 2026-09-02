import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendMasterclassRegistrationEmail } from "@/lib/email"

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const emailParam = searchParams.get("email")?.toLowerCase().trim()

    // 1. Récupérer les paramètres et replays depuis site_settings
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

    // Récupérer la liste des sessions configurées
    let sessions: any[] = []
    if (settingsMap.masterclass_sessions) {
      try {
        const parsed = JSON.parse(settingsMap.masterclass_sessions)
        if (Array.isArray(parsed)) {
          sessions = parsed
        }
      } catch (e) {
        console.warn("Could not parse masterclass_sessions JSON:", e)
      }
    }

    const now = Date.now()
    let upcomingSession: any = null
    let allUpcomingSessions: any[] = []

    if (sessions.length > 0) {
      // Filtrer STRICTEMENT les sessions futures et actives (date >= now - 4h et statut !== 'past')
      allUpcomingSessions = sessions
        .filter(s => s.status === "upcoming" || (!s.status && s.status !== "past" && (!s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)))
        .filter(s => s.status !== "past" && (s.is_active !== false))
        .filter(s => !s.scheduledAt || new Date(s.scheduledAt).getTime() >= now - 4 * 3600 * 1000)
        .sort((a, b) => {
          const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity
          const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity
          return timeA - timeB
        })

      if (allUpcomingSessions.length > 0) {
        upcomingSession = allUpcomingSessions.find(s => s.is_active !== false) || allUpcomingSessions[0]
      }
    }

    // Fallback uniquement si une date future est explicitement configurée dans site_settings
    if (!upcomingSession) {
      const scheduledAt = settingsMap.masterclass_date || ""
      const isExplicitActive = settingsMap.masterclass_is_active === "true"
      const isFuture = scheduledAt && new Date(scheduledAt).getTime() >= now - 4 * 3600 * 1000

      if (isExplicitActive && isFuture) {
        const dateDisplay = settingsMap.masterclass_date_display || (scheduledAt ? new Date(scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "")

        upcomingSession = {
          id: "mc_default",
          is_active: true,
          title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
          description: settingsMap.masterclass_description || "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct. Démonstrations d'outils, cas pratiques et questions-réponses.",
          instructor: settingsMap.masterclass_instructor || "Alfred Dah",
          instructorRole: "Fondateur Le Guide IA & Expert en Intelligence Artificielle",
          scheduledAt: scheduledAt,
          dateDisplay: dateDisplay,
          thumbnailUrl: settingsMap.masterclass_thumbnail_url || "",
          whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
          youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://meet.google.com",
          duration: "1h 30min",
          price: "100% Gratuit (Accès Libre)"
        }
        allUpcomingSessions = [upcomingSession]
      } else {
        // Aucune session future n'est active : afficher l'état propre sans direct
        upcomingSession = null
        allUpcomingSessions = []
      }
    }

    // 2. Vérifier si l'utilisateur est déjà inscrit spécifiquement à CETTE session
    let isRegistered = false
    const requestedSessionId = searchParams.get("sessionId") || upcomingSession?.id

    if (emailParam && requestedSessionId) {
      const { data: userRegistrations } = await supabaseServer
        .from("registrations")
        .select("id, status, notes, course_slug, source")
        .ilike("email", emailParam)

      if (userRegistrations && userRegistrations.length > 0) {
        // Vérifier si l'une des inscriptions correspond à la session demandée
        isRegistered = userRegistrations.some((r) => {
          if (!r.notes) return false
          try {
            const pNotes = typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes
            if (pNotes) {
              if (pNotes.masterclass_id === requestedSessionId) return true
              if (Array.isArray(pNotes.registered_masterclasses) && pNotes.registered_masterclasses.includes(requestedSessionId)) return true
            }
          } catch (_) {}
          return false
        })
      }
    }

    // 3. Récupérer les replays configurés et filtrer les replays publiés directement depuis Supabase
    let replays: any[] = []
    if (settingsMap.masterclass_replays) {
      try {
        const parsed = JSON.parse(settingsMap.masterclass_replays)
        if (Array.isArray(parsed)) {
          replays = parsed.filter((r: any) => r.is_published !== false)
        }
      } catch (pErr) {
        console.warn("Could not parse masterclass_replays JSON from Supabase:", pErr)
      }
    }

    return NextResponse.json({
      success: true,
      upcomingSession,
      allUpcomingSessions,
      isRegistered,
      replays
    })
  } catch (error: any) {
    console.error("Masterclass GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body.email || "").toLowerCase().trim()
    const fullName = body.fullName || body.name || ""
    const whatsapp = body.whatsapp || ""
    const country = body.country || ""
    const masterclassId = body.masterclassId || body.masterclass_id || "current_live"
    const masterclassTitle = body.masterclassTitle || body.masterclass_title || "Masterclass IA en Direct"

    if (!email) {
      return NextResponse.json({ error: "Adresse email requise." }, { status: 400 })
    }

    // 1. Vérifier si déjà inscrit spécifiquement à cette Masterclass
    const { data: userRegistrations } = await supabaseServer
      .from("registrations")
      .select("id, notes, course_slug, source")
      .ilike("email", email)
      .order("created_at", { ascending: false })

    const existingMatch = (userRegistrations || []).find(r => {
      if (!r.notes) return false
      try {
        const pNotes = typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes
        if (pNotes) {
          if (pNotes.masterclass_id === masterclassId) return true
          if (Array.isArray(pNotes.registered_masterclasses) && pNotes.registered_masterclasses.includes(masterclassId)) return true
        }
      } catch (_) {}
      return false
    })

    // 2. Récupérer les données de la session actuelle pour le retour et pour l'email
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

    const sessionInfo = {
      title: settingsMap.masterclass_title || "Masterclass IA en Direct",
      scheduledAt: settingsMap.masterclass_date || "",
      dateDisplay: settingsMap.masterclass_date_display || "",
      whatsappGroupUrl: settingsMap.masterclass_whatsapp_group_url || "",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://meet.google.com",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah"
    }

    if (existingMatch) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        isRegistered: true,
        message: "Vous êtes déjà inscrit à cette Masterclass !",
        whatsappGroupUrl: sessionInfo.whatsappGroupUrl,
        youtubeLiveUrl: sessionInfo.youtubeLiveUrl
      })
    }

    // Fetch profile if available to enrich registration data
    let userProf: any = null
    try {
      const { data: pData } = await supabaseServer
        .from("profiles")
        .select("full_name, whatsapp, country, city, sector")
        .eq("email", email)
        .maybeSingle()
      userProf = pData
    } catch (_) {}

    const cleanWhatsApp = (whatsapp && whatsapp.trim()) 
      ? whatsapp.trim() 
      : (userProf?.whatsapp || `wa_${email}`)

    const cleanFullName = (fullName && fullName.trim() && fullName !== "Participant Masterclass") 
      ? fullName.trim() 
      : (userProf?.full_name || email.split("@")[0])

    const cleanCountry = country || userProf?.country || "CI"
    const cleanSector = body.profession || body.sector || userProf?.sector || ""

    const existingReg = (userRegistrations || [])[0]

    if (existingReg) {
      // Mettre à jour l'enregistrement existant en ajoutant la masterclass dans notes
      let existingNotes: any = {}
      try {
        existingNotes = typeof existingReg.notes === "string" ? JSON.parse(existingReg.notes) : (existingReg.notes || {})
      } catch (_) {}

      const registeredMasterclasses = Array.isArray(existingNotes.registered_masterclasses)
        ? existingNotes.registered_masterclasses
        : (existingNotes.masterclass_id ? [existingNotes.masterclass_id] : [])

      if (!registeredMasterclasses.includes(masterclassId)) {
        registeredMasterclasses.push(masterclassId)
      }

      const updatedNotes = {
        ...existingNotes,
        masterclass_id: masterclassId,
        masterclass_title: masterclassTitle,
        registered_masterclasses: registeredMasterclasses,
        profession: cleanSector || existingNotes.profession || "",
        sector: cleanSector || existingNotes.sector || "",
        country: cleanCountry || existingNotes.country || "",
        city: userProf?.city || body.city || existingNotes.city || "",
        last_masterclass_at: new Date().toISOString()
      }

      await supabaseServer
        .from("registrations")
        .update({
          full_name: cleanFullName,
          whatsapp: cleanWhatsApp,
          country: cleanCountry,
          notes: JSON.stringify(updatedNotes)
        })
        .eq("id", existingReg.id)
    } else {
      // Créer une nouvelle fiche d'inscription
      const regPayload: any = {
        full_name: cleanFullName,
        email: email,
        whatsapp: cleanWhatsApp,
        country: cleanCountry,
        source: "masterclass_dimanche",
        course_slug: "masterclass-ia",
        status: "inscrit",
        notes: JSON.stringify({
          source: "masterclass_dimanche",
          masterclass_id: masterclassId,
          masterclass_title: masterclassTitle,
          registered_masterclasses: [masterclassId],
          profession: cleanSector,
          sector: cleanSector,
          country: cleanCountry,
          city: userProf?.city || body.city || "",
          registered_at: new Date().toISOString()
        })
      }

      const { error: regErr } = await supabaseServer
        .from("registrations")
        .insert(regPayload)

      if (regErr) {
        console.warn("Masterclass registration insert error:", regErr.message)
      }
    }

    // 2. Ajouter automatiquement aux abonnés newsletter
    try {
      await supabaseServer.from("newsletter_subscribers").upsert({
        email: email,
        name: cleanFullName,
        status: "active",
        subscribed_at: new Date().toISOString()
      }, { onConflict: "email" })
    } catch (newsErr) {
      console.warn("Newsletter sync note:", newsErr)
    }

    // 3. Envoyer l'email de confirmation immédiat via Resend
    try {
      await sendMasterclassRegistrationEmail(cleanFullName, email, sessionInfo)
    } catch (emailErr) {
      console.warn("Could not send immediate masterclass confirmation email:", emailErr)
    }

    return NextResponse.json({
      success: true,
      message: "Inscription confirmée avec succès ! Un email avec vos liens d'accès vous a été envoyé.",
      isRegistered: true,
      whatsappGroupUrl: sessionInfo.whatsappGroupUrl,
      youtubeLiveUrl: sessionInfo.youtubeLiveUrl
    })
  } catch (error: any) {
    console.error("Masterclass POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
