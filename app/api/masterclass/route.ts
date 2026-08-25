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

    const isActive = settingsMap.masterclass_is_active !== "false" && !!settingsMap.masterclass_date
    const scheduledAt = settingsMap.masterclass_date || ""
    const dateDisplay = settingsMap.masterclass_date_display || (scheduledAt ? new Date(scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "")

    const upcomingSession = {
      is_active: isActive,
      title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: settingsMap.masterclass_description || "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct. Démonstrations d'outils, cas pratiques et questions-réponses.",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah",
      instructorRole: "Fondateur Le Guide IA & Expert en Intelligence Artificielle",
      scheduledAt: scheduledAt,
      dateDisplay: dateDisplay,
      thumbnailUrl: settingsMap.masterclass_thumbnail_url || "",
      meetUrl: settingsMap.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      duration: "1h 30min",
      price: "100% Gratuit (Accès Libre)"
    }

    // 2. Vérifier si l'utilisateur est déjà inscrit
    let isRegistered = false
    if (emailParam) {
      const { data: reg } = await supabaseServer
        .from("registrations")
        .select("id, status")
        .ilike("email", emailParam)
        .or("course_slug.eq.masterclass-ia,source.eq.masterclass_dimanche")
        .maybeSingle()

      if (reg) {
        isRegistered = true
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
    const fullName = body.fullName || body.name || "Participant Masterclass"
    const whatsapp = body.whatsapp || ""
    const country = body.country || "CI"

    if (!email) {
      return NextResponse.json({ error: "Adresse email requise." }, { status: 400 })
    }

    // 1. Vérifier si déjà inscrit
    const { data: existingReg } = await supabaseServer
      .from("registrations")
      .select("id")
      .ilike("email", email)
      .or("course_slug.eq.masterclass-ia,source.eq.masterclass_dimanche")
      .maybeSingle()

    let regId = existingReg?.id

    const regPayload: any = {
      full_name: fullName,
      email: email,
      whatsapp: whatsapp || null,
      country: country || null,
      source: "masterclass_dimanche",
      course_slug: "masterclass-ia",
      status: "inscrit",
      notes: JSON.stringify({
        source: "masterclass_dimanche",
        registered_at: new Date().toISOString()
      })
    }

    if (existingReg) {
      await supabaseServer
        .from("registrations")
        .update(regPayload)
        .eq("id", existingReg.id)
    } else {
      const { data: newReg, error: regErr } = await supabaseServer
        .from("registrations")
        .insert(regPayload)
        .select("id")
        .single()

      if (regErr) {
        console.warn("Masterclass registration insert note:", regErr)
      }
      if (newReg) {
        regId = newReg.id
      }
    }

    // 2. Ajouter automatiquement aux abonnés newsletter
    try {
      await supabaseServer.from("newsletter_subscribers").upsert({
        email: email,
        name: fullName,
        status: "active",
        subscribed_at: new Date().toISOString()
      }, { onConflict: "email" })
    } catch (newsErr) {
      console.warn("Newsletter sync note:", newsErr)
    }

    // 3. Récupérer les données de la session actuelle pour le retour et pour l'email
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
      meetUrl: settingsMap.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah"
    }

    // 4. Envoyer l'email de confirmation immédiat via Resend
    try {
      await sendMasterclassRegistrationEmail(fullName, email, sessionInfo)
    } catch (emailErr) {
      console.warn("Could not send immediate masterclass confirmation email:", emailErr)
    }

    return NextResponse.json({
      success: true,
      message: "Inscription confirmée avec succès ! Un email avec vos liens d'accès vous a été envoyé.",
      isRegistered: true,
      meetUrl: sessionInfo.meetUrl,
      youtubeLiveUrl: sessionInfo.youtubeLiveUrl
    })
  } catch (error: any) {
    console.error("Masterclass POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
