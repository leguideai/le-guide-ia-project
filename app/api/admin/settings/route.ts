import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const EMPTY_SETTINGS: Record<string, string> = {
  announcement_text: "",
  announcement_cta: "",
  vsl_youtube_url: "",
  vsl_videos_pool: "",
  hero_badge: "",
  hero_title: "",
  hero_subtitle: "",
  hero_dates: "",
  hero_time: "",
  hero_format: "",
  hero_sessions: "",
  hero_promo_price: "",
  hero_normal_price: "",
  whatsapp_number: "",
  hero_poster_url: "",
  hero_programme_url: ""
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("site_settings")
      .select("*")

    if (error || !data || data.length === 0) {
      return NextResponse.json({ settings: EMPTY_SETTINGS })
    }

    // Convert array of key-value pairs to object
    const settingsObj: Record<string, string> = { ...EMPTY_SETTINGS }
    data.forEach((row: { key: string; value: string }) => {
      if (row.key && row.value !== undefined && row.value !== null) {
        settingsObj[row.key] = row.value
      }
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (err: any) {
    return NextResponse.json({ settings: EMPTY_SETTINGS })
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
