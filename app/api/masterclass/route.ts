import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

// Liste initiale de replays YouTube par défaut (modifiables via Admin)
const DEFAULT_REPLAYS = [
  {
    id: "rep-1",
    title: "Masterclass #1 : Les Fondamentaux du Prompt Engineering & ChatGPT",
    description: "Apprenez à structurer des prompts professionnels pour obtenir des résultats précis dès la première tentative.",
    youtubeId: "dQw4w9WgXcQ", // Ex. placeholder ID YouTube
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "1h 15min",
    category: "Prompting",
    instructor: "Alfred Dah",
    date: "Dimanche 18 Août 2026",
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
    date: "Dimanche 11 Août 2026",
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
    date: "Dimanche 4 Août 2026",
    views: "1 450",
  }
]

// Calcul dynamique de la date du prochain dimanche à 19h00 GMT
function getNextSundayDate(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Dimanche
  const daysUntilSunday = (7 - day) % 7 === 0 && now.getUTCHours() < 20 ? 0 : ((7 - day) % 7 || 7)
  
  const nextSunday = new Date(now)
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
  nextSunday.setUTCHours(19, 0, 0, 0)
  return nextSunday.toISOString()
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const emailParam = searchParams.get("email")?.toLowerCase().trim()

    // 1. Récupérer les paramètres de la masterclass depuis les settings si disponibles
    const { data: settingsData } = await supabaseServer
      .from("platform_settings")
      .select("*")
      .maybeSingle()

    const settings = settingsData || {}
    const nextSundayIso = getNextSundayDate()

    const upcomingSession = {
      title: settings.masterclass_title || "Masterclass IA Hebdomadaire : Fondamentaux & Cas Pratiques en Direct",
      description: settings.masterclass_description || "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct. Questions & réponses, démonstrations d'outils et cas concrets appliqués au marché africain.",
      instructor: "Alfred Dah",
      instructorRole: "Fondateur Le Guide IA & Expert en Intelligence Artificielle",
      scheduledAt: settings.masterclass_date || nextSundayIso,
      meetUrl: settings.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv",
      youtubeLiveUrl: settings.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      duration: "1h30",
      price: "100% Gratuit (Accès Libre)",
      isLive: false,
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

    // 3. Récupérer les replays (ou fallback sur la liste par défaut)
    const replays = DEFAULT_REPLAYS

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

    // 3. Récupérer les liens de connexion
    const { data: settingsData } = await supabaseServer
      .from("platform_settings")
      .select("masterclass_meet_url, masterclass_youtube_url")
      .maybeSingle()

    const meetUrl = settingsData?.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv"
    const youtubeLiveUrl = settingsData?.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA"

    return NextResponse.json({
      success: true,
      message: "Inscription confirmée avec succès !",
      isRegistered: true,
      meetUrl,
      youtubeLiveUrl
    })
  } catch (error: any) {
    console.error("Masterclass POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
