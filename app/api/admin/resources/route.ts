import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: resources, error } = await supabaseServer
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Resources fetch warning:", error.message)
      return NextResponse.json({ success: true, resources: [] })
    }

    const formatted = (resources || []).map((r: any) => ({
      ...r,
      access_level: r.tier || (r.is_free ? "Gratuit" : "Membre Premium"),
      tier: r.tier || (r.is_free ? "Gratuit" : "Membre Premium"),
      download_url: r.file_url || r.download_url || "",
      file_url: r.file_url || r.download_url || "",
      downloads_count: r.download_count ?? r.downloads_count ?? 0,
      download_count: r.download_count ?? r.downloads_count ?? 0
    }))

    return NextResponse.json({ success: true, resources: formatted })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, title, description, category, access_level, tier, download_url, file_url, prompt_text, type, downloads_count, download_count } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 })
    }

    const effectiveTier = access_level || tier || "Gratuit"
    const isFree = effectiveTier === "Gratuit"
    const effectiveFileUrl = download_url || file_url || null
    const effectiveDownloadCount = downloads_count ?? download_count ?? 0

    const rowData: Record<string, any> = {
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category || "Business Plan & Entrepreneuriat",
      tier: effectiveTier,
      is_free: isFree,
      type: type || (prompt_text && effectiveFileUrl ? "Pack" : effectiveFileUrl ? "Document" : "Prompt"),
      file_url: effectiveFileUrl,
      prompt_text: prompt_text ? prompt_text.trim() : null,
      download_count: effectiveDownloadCount,
      is_published: true
    }

    if (id) {
      rowData.id = id
      if (body.slug) {
        rowData.slug = body.slug
      } else {
        const { data: existing } = await supabaseServer.from("resources").select("slug").eq("id", id).maybeSingle()
        rowData.slug = existing?.slug || title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") + "-" + id.slice(0, 6)
      }
    } else {
      rowData.slug = (body.slug || title)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)
    }

    const { data: resource, error } = await supabaseServer
      .from("resources")
      .upsert(rowData)
      .select()
      .single()

    if (error) {
      console.error("Resources save error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = {
      ...resource,
      access_level: resource.tier || (resource.is_free ? "Gratuit" : "Membre Premium"),
      download_url: resource.file_url || "",
      downloads_count: resource.download_count || 0
    }

    return NextResponse.json({
      success: true,
      message: `Ressource "${title}" enregistrée avec succès !`,
      resource: formatted
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get("id")
    const idsParam = searchParams.get("ids")

    let idsToDelete: string[] = []

    if (idsParam) {
      idsToDelete = idsParam.split(",").map(s => s.trim()).filter(Boolean)
    } else if (idParam) {
      idsToDelete = [idParam.trim()]
    } else {
      try {
        const body = await req.json()
        if (Array.isArray(body?.ids)) {
          idsToDelete = body.ids.map((s: any) => String(s).trim()).filter(Boolean)
        } else if (body?.id) {
          idsToDelete = [String(body.id).trim()]
        }
      } catch (_) {
        // body not present or invalid JSON
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: "Aucun identifiant de ressource fourni pour la suppression." }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from("resources")
      .delete()
      .in("id", idsToDelete)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const count = idsToDelete.length
    return NextResponse.json({ 
      success: true, 
      message: count > 1 
        ? `${count} ressources supprimées avec succès.` 
        : "Ressource supprimée avec succès.",
      deletedCount: count
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
