import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { DEFAULT_FORMATIONS, DEFAULT_FORMATION_CATEGORIES, FormationItem, FormationCategory } from "@/lib/formations-data"

export const dynamic = "force-dynamic"

// Helper to mirror formations array to site_settings
async function updateSettingsMirror(items: FormationItem[]) {
  try {
    await supabaseServer
      .from("site_settings")
      .upsert({
        key: "ondemand_formations",
        value: JSON.stringify(items),
        updated_at: new Date().toISOString()
      }, { onConflict: "key" })
  } catch (e) {
    console.warn("Failed to update formations site_settings mirror:", e)
  }
}

// Helper to mirror categories array to site_settings
async function updateCategoriesMirror(items: FormationCategory[]) {
  try {
    await supabaseServer
      .from("site_settings")
      .upsert({
        key: "formation_categories",
        value: JSON.stringify(items),
        updated_at: new Date().toISOString()
      }, { onConflict: "key" })
  } catch (e) {
    console.warn("Failed to update categories site_settings mirror:", e)
  }
}

// Helper to get current categories list
async function getCategoriesList(): Promise<FormationCategory[]> {
  let categoriesList: FormationCategory[] = []
  try {
    const { data: dbCategories } = await supabaseServer
      .from("formation_categories")
      .select("*")
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
          categoriesList = parsed
        }
      }
    } catch (e) {}
  }

  if (categoriesList.length === 0) {
    categoriesList = [...DEFAULT_FORMATION_CATEGORIES]
    await updateCategoriesMirror(categoriesList)
  }

  return categoriesList
}

// GET all formations & categories (Admin)
export async function GET() {
  try {
    let formationsList: FormationItem[] = []

    // 1. Lire depuis la table SQL formations
    try {
      const { data: dbData, error } = await supabaseServer
        .from("formations")
        .select("*")
        .order("order_index", { ascending: true })

      if (!error && dbData && dbData.length > 0) {
        formationsList = dbData
      }
    } catch (e) {}

    // 2. Si vide, lire depuis site_settings
    if (formationsList.length === 0) {
      try {
        const { data: setRow } = await supabaseServer
          .from("site_settings")
          .select("value")
          .eq("key", "ondemand_formations")
          .maybeSingle()

        if (setRow?.value) {
          const parsed = JSON.parse(setRow.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            formationsList = parsed
          }
        }
      } catch (e) {}
    }

    // 3. Si toujours vide, initialiser avec DEFAULT_FORMATIONS
    if (formationsList.length === 0) {
      formationsList = [...DEFAULT_FORMATIONS]
      await updateSettingsMirror(formationsList)
    }

    const categoriesList = await getCategoriesList()

    return NextResponse.json({
      success: true,
      formations: formationsList,
      categories: categoriesList
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Save Formations or Categories (CRUD)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      action = "save", 
      formation, 
      formationId, 
      formationSlug, 
      items,
      category,
      categoryId,
      categorySlug,
      categories
    } = body

    // ============================================
    // GESTION DES CATÉGORIES CRUD
    // ============================================
    if (action === "save_category") {
      if (!category?.label || !category?.slug) {
        return NextResponse.json({ error: "Label et Slug requis" }, { status: 400 })
      }

      let currentCats = await getCategoriesList()
      const existingIdx = currentCats.findIndex(c => (category.id && c.id === category.id) || c.slug === category.slug)

      const categoryToSave: FormationCategory = {
        id: category.id || `cat-${Date.now()}`,
        slug: category.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-"),
        label: category.label.trim(),
        icon: category.icon || "sparkles",
        order_index: category.order_index ?? (currentCats.length + 1),
        is_active: category.is_active !== false
      }

      if (existingIdx >= 0) {
        currentCats[existingIdx] = { ...currentCats[existingIdx], ...categoryToSave }
      } else {
        currentCats.push(categoryToSave)
      }

      // Sync Supabase table formation_categories
      try {
        await supabaseServer.from("formation_categories").upsert({
          id: categoryToSave.id,
          slug: categoryToSave.slug,
          label: categoryToSave.label,
          icon: categoryToSave.icon,
          order_index: categoryToSave.order_index,
          is_active: categoryToSave.is_active,
          updated_at: new Date().toISOString()
        }, { onConflict: "slug" })
      } catch (e) {}

      await updateCategoriesMirror(currentCats)

      return NextResponse.json({
        success: true,
        category: categoryToSave,
        categories: currentCats
      })
    }

    if (action === "delete_category") {
      let currentCats = await getCategoriesList()
      currentCats = currentCats.filter(c => c.id !== categoryId && c.slug !== categorySlug)

      try {
        if (categoryId) {
          await supabaseServer.from("formation_categories").delete().eq("id", categoryId)
        } else if (categorySlug) {
          await supabaseServer.from("formation_categories").delete().eq("slug", categorySlug)
        }
      } catch (e) {}

      await updateCategoriesMirror(currentCats)

      return NextResponse.json({
        success: true,
        categories: currentCats
      })
    }

    if (action === "reorder_categories" && Array.isArray(categories)) {
      await updateCategoriesMirror(categories)
      try {
        for (let i = 0; i < categories.length; i++) {
          const c = categories[i]
          await supabaseServer.from("formation_categories").update({ order_index: i + 1 }).eq("slug", c.slug)
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        categories
      })
    }

    // ============================================
    // GESTION DES FORMATIONS CRUD
    // ============================================
    let currentList: FormationItem[] = []
    try {
      const { data: existingDb } = await supabaseServer.from("formations").select("*").order("order_index", { ascending: true })
      if (existingDb && existingDb.length > 0) {
        currentList = existingDb
      }
    } catch (e) {}

    if (currentList.length === 0) {
      try {
        const { data: setRow } = await supabaseServer.from("site_settings").select("value").eq("key", "ondemand_formations").maybeSingle()
        if (setRow?.value) {
          const parsed = JSON.parse(setRow.value)
          if (Array.isArray(parsed)) currentList = parsed
        }
      } catch (e) {}
    }

    if (currentList.length === 0) {
      currentList = [...DEFAULT_FORMATIONS]
    }

    // ACTION: SAVE (Create or Update Formation)
    if (action === "save") {
      if (!formation || !formation.title || !formation.slug) {
        return NextResponse.json({ error: "Titre et Slug obligatoires" }, { status: 400 })
      }

      const existingIndex = currentList.findIndex(f => 
        (formation.id && f.id === formation.id) || f.slug === formation.slug
      )

      const formationToSave: FormationItem = {
        id: formation.id || `formation-${Date.now()}`,
        slug: formation.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-"),
        title: formation.title.trim(),
        tagline: formation.tagline || "",
        description: formation.description || "",
        badge: formation.badge || "Nouveau",
        tool_icon: formation.tool_icon || "chatgpt",
        category_slug: formation.category_slug || formation.tool_icon || "chatgpt",
        thumbnail: formation.thumbnail || "/images/formation_claude_thumb.jpg",
        instructor: formation.instructor || "Alfred Dah · Expert IA & Productivité",
        rating: formation.rating || 4.9,
        reviews_count: formation.reviews_count || "150+ avis",
        duration: formation.duration || "10h de vidéo",
        modules_count: formation.modules_count || "20 leçons",
        prompts_count: formation.prompts_count || "100+ prompts",
        price: Number(formation.price) || 39000,
        original_price: formation.original_price || "69 000 FCFA",
        currency: formation.currency || "FCFA",
        features: Array.isArray(formation.features) ? formation.features : [],
        stats: Array.isArray(formation.stats) ? formation.stats : [],
        testimonial: formation.testimonial || {
          quote: "Une formation claire et directement applicable.",
          author_name: "Apprenant Vérifié",
          rating: 5
        },
        video_preview_url: formation.video_preview_url || "",
        order_index: formation.order_index ?? currentList.length + 1,
        is_active: formation.is_active !== false,
        updated_at: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        currentList[existingIndex] = formationToSave
      } else {
        currentList.push(formationToSave)
      }

      // Upsert in SQL Table formations
      try {
        await supabaseServer
          .from("formations")
          .upsert({
            id: formationToSave.id,
            slug: formationToSave.slug,
            title: formationToSave.title,
            tagline: formationToSave.tagline,
            description: formationToSave.description,
            badge: formationToSave.badge,
            tool_icon: formationToSave.tool_icon,
            category_slug: formationToSave.category_slug,
            thumbnail: formationToSave.thumbnail,
            instructor: formationToSave.instructor,
            rating: formationToSave.rating,
            reviews_count: formationToSave.reviews_count,
            duration: formationToSave.duration,
            modules_count: formationToSave.modules_count,
            prompts_count: formationToSave.prompts_count,
            price: formationToSave.price,
            original_price: formationToSave.original_price,
            currency: formationToSave.currency,
            features: formationToSave.features,
            stats: formationToSave.stats,
            testimonial: formationToSave.testimonial,
            video_preview_url: formationToSave.video_preview_url,
            order_index: formationToSave.order_index,
            is_active: formationToSave.is_active,
            updated_at: new Date().toISOString()
          }, { onConflict: "slug" })
      } catch (e) {
        console.warn("SQL upsert formations error:", e)
      }

      await updateSettingsMirror(currentList)

      return NextResponse.json({
        success: true,
        formation: formationToSave,
        formations: currentList
      })
    }

    // ACTION: DELETE
    if (action === "delete") {
      currentList = currentList.filter(f => f.id !== formationId && f.slug !== formationSlug)

      try {
        if (formationId) {
          await supabaseServer.from("formations").delete().eq("id", formationId)
        } else if (formationSlug) {
          await supabaseServer.from("formations").delete().eq("slug", formationSlug)
        }
      } catch (e) {}

      await updateSettingsMirror(currentList)

      return NextResponse.json({
        success: true,
        formations: currentList
      })
    }

    // ACTION: TOGGLE ACTIVE
    if (action === "toggle_active") {
      const idx = currentList.findIndex(f => f.id === formationId || f.slug === formationSlug)
      if (idx >= 0) {
        currentList[idx].is_active = !currentList[idx].is_active

        try {
          await supabaseServer
            .from("formations")
            .update({ is_active: currentList[idx].is_active })
            .eq("slug", currentList[idx].slug)
        } catch (e) {}

        await updateSettingsMirror(currentList)
      }

      return NextResponse.json({
        success: true,
        formations: currentList
      })
    }

    // ACTION: REORDER
    if (action === "reorder" && Array.isArray(items)) {
      await updateSettingsMirror(items)
      try {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          await supabaseServer
            .from("formations")
            .update({ order_index: i + 1 })
            .eq("slug", item.slug)
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        formations: items
      })
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 })
  } catch (error: any) {
    console.error("Admin formations API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
