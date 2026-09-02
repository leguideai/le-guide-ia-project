import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: tools, error } = await supabaseServer
      .from("ai_tools")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.warn("AI Tools fetch error from Supabase:", error.message)
      return NextResponse.json({ success: true, tools: [] })
    }

    return NextResponse.json({ success: true, tools: tools || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, name, slug, category, role, icon, image } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Le nom et le slug sont obligatoires." }, { status: 400 })
    }

    const { data: tool, error } = await supabaseServer
      .from("ai_tools")
      .upsert({
        ...(id ? { id } : {}),
        name,
        slug,
        category: category || "Modèles IA & Raisonnement",
        role: role || "",
        icon: icon || "⚡",
        image: image || "/images/tools/chatgpt.png"
      }, { onConflict: "slug" })
      .select()
      .single()

    if (error) {
      console.error("Error saving AI tool to Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, tool })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 })
    }

    const { error } = await supabaseServer.from("ai_tools").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
