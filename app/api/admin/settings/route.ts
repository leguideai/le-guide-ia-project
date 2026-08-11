import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const DEFAULT_SETTINGS = {
  announcement_text: "BOOTCAMP IA PRO 2 — Direct Live du 31 Août au 6 Septembre 2026. Inscriptions ouvertes !",
  announcement_cta: "Réserver ma place (149 000 FCFA) →",
  vsl_youtube_url: "https://www.youtube.com/embed/0DjfVGtWtDA?rel=0&modestbranding=1",
  hero_badge: "CO-CRÉEZ VOTRE AVENIR PROFESSIONNEL",
  hero_title: "Maîtrisez l'IA. Transformez votre carrière et votre business.",
  hero_subtitle: "Formation intensive en ligne · 100% en français · Cas africains & diaspora. Apprenez à maîtriser ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Make et n8n avec Alfred Dah.",
  hero_dates: "31 Août – 6 Sept 2026",
  hero_time: "19h00 GMT",
  hero_format: "🌍 100% En ligne",
  hero_sessions: "🎓 7 Sessions intensives",
  hero_promo_price: "149,900 F CFA",
  hero_normal_price: "250,000 F CFA",
  whatsapp_number: "+226 0505 0577",
  hero_poster_url: "/images/bootcamp_pro_poster.jpg",
  hero_programme_url: "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("site_settings")
      .select("*")

    if (error || !data || data.length === 0) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    // Convert array of key-value pairs to object
    const settingsObj: Record<string, string> = { ...DEFAULT_SETTINGS }
    data.forEach((row: { key: string; value: string }) => {
      if (row.key && row.value) {
        settingsObj[row.key] = row.value
      }
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (err: any) {
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Données de configuration invalides" }, { status: 400 })
    }

    const upsertRows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabaseServer
      .from("site_settings")
      .upsert(upsertRows, { onConflict: "key" })

    if (error) {
      console.warn("Error upserting site_settings:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Configuration du site mise à jour avec succès !",
      settings
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur de mise à jour" }, { status: 500 })
  }
}
