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

    return NextResponse.json({ success: true, resources: resources || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, title, description, category, access_level, download_url, prompt_text, downloads_count } = body

    if (!title) {
      return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 })
    }

    const { data: resource, error } = await supabaseServer
      .from("resources")
      .upsert({
        ...(id ? { id } : {}),
        title,
        description,
        category: category || "Productivity",
        access_level: access_level || "Gratuit",
        download_url: download_url || null,
        prompt_text: prompt_text || null,
        downloads_count: downloads_count || 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Ressource "${title}" enregistrée avec succès !`,
      resource
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 })

    const { error } = await supabaseServer.from("resources").delete().eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: "Ressource supprimée avec succès." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
