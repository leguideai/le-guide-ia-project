import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

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

export async function GET() {
  try {
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

    const scheduledAt = settingsMap.masterclass_date || ""
    const isActive = settingsMap.masterclass_is_active !== "false" && !!scheduledAt
    const dateDisplay = settingsMap.masterclass_date_display || (scheduledAt ? new Date(scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "")

    const upcomingSession = {
      is_active: isActive,
      title: settingsMap.masterclass_title || "Masterclass IA Interactive en Direct",
      description: settingsMap.masterclass_description || "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct. Démonstrations d'outils, cas pratiques et questions-réponses.",
      instructor: settingsMap.masterclass_instructor || "Alfred Dah",
      scheduledAt: scheduledAt,
      dateDisplay: dateDisplay,
      meetUrl: settingsMap.masterclass_meet_url || "https://meet.google.com/qvt-gkyh-yuv",
      youtubeLiveUrl: settingsMap.masterclass_youtube_url || "https://www.youtube.com/@LeGuideIA",
      duration: "1h 30min",
      price: "100% Gratuit (Accès Libre)"
    }

    let replays = DEFAULT_REPLAYS
    if (settingsMap.masterclass_replays) {
      try {
        const parsed = JSON.parse(settingsMap.masterclass_replays)
        if (Array.isArray(parsed) && parsed.length > 0) {
          replays = parsed
        }
      } catch (pErr) {
        console.warn("Could not parse masterclass_replays JSON:", pErr)
      }
    }

    // 2. Récupérer les inscriptions liées à la Masterclass
    const { data: participants } = await supabaseServer
      .from("registrations")
      .select("id, full_name, email, whatsapp, country, status, created_at, notes, course_slug, source")
      .or("course_slug.eq.masterclass-ia,source.eq.masterclass_dimanche")
      .order("created_at", { ascending: false })

    return NextResponse.json({
      success: true,
      upcomingSession,
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
    const { action, sessionData, replayData, replayId } = body

    if (action === "save_session") {
      // Sauvegarder les paramètres de la session live
      const updates = [
        { key: "masterclass_title", value: sessionData.title || "" },
        { key: "masterclass_description", value: sessionData.description || "" },
        { key: "masterclass_date", value: sessionData.scheduledAt || "" },
        { key: "masterclass_date_display", value: sessionData.dateDisplay || "" },
        { key: "masterclass_meet_url", value: sessionData.meetUrl || "" },
        { key: "masterclass_youtube_url", value: sessionData.youtubeLiveUrl || "" },
        { key: "masterclass_instructor", value: sessionData.instructor || "Alfred Dah" },
        { key: "masterclass_is_active", value: sessionData.is_active !== false ? "true" : "false" }
      ]

      for (const item of updates) {
        await supabaseServer
          .from("site_settings")
          .upsert({
            key: item.key,
            value: item.value,
            updated_at: new Date().toISOString()
          }, { onConflict: "key" })
      }

      return NextResponse.json({
        success: true,
        message: "Session Masterclass mise à jour avec succès dans Supabase !"
      })
    }

    if (action === "add_replay" || action === "update_replay") {
      // Récupérer la liste existante des replays
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
        // update_replay
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

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 })
  } catch (error: any) {
    console.error("Admin Masterclasses POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
