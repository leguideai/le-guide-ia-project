import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { FormationItem, FormationCategory } from "@/lib/formations-data"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    let formationsList: FormationItem[] = []
    let categoriesList: FormationCategory[] = []

    // 1. Lire Formations
    try {
      const { data: dbFormations } = await supabaseServer
        .from("formations")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (dbFormations && dbFormations.length > 0) {
        formationsList = dbFormations
      }
    } catch (e) {}

    if (formationsList.length === 0) {
      try {
        const { data: settingRow } = await supabaseServer
          .from("site_settings")
          .select("value")
          .eq("key", "ondemand_formations")
          .maybeSingle()

        if (settingRow?.value) {
          const parsed = JSON.parse(settingRow.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            formationsList = parsed.filter((f: FormationItem) => f.is_active !== false)
          }
        }
      } catch (e) {}
    }

    // 2. Lire Catégories
    try {
      const { data: dbCategories } = await supabaseServer
        .from("formation_categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (dbCategories && dbCategories.length > 0) {
        categoriesList = dbCategories
      }
    } catch (e) {}

    if (categoriesList.length === 0) {
      try {
        const { data: catSettingRow } = await supabaseServer
          .from("site_settings")
          .select("value")
          .eq("key", "formation_categories")
          .maybeSingle()

        if (catSettingRow?.value) {
          const parsed = JSON.parse(catSettingRow.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            categoriesList = parsed.filter((c: FormationCategory) => c.is_active !== false)
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      formations: formationsList,
      categories: categoriesList
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      formations: [],
      categories: [],
      error: error.message
    })
  }
}
