import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: true })

    if (error || !data) {
      return NextResponse.json({ testimonials: [] })
    }

    return NextResponse.json({ testimonials: data })
  } catch (err) {
    return NextResponse.json({ testimonials: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, role, country, text, avatar_url } = body

    if (!name || !text) {
      return NextResponse.json({ message: "Le nom et le texte du témoignage sont obligatoires." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("testimonials")
      .insert({
        name,
        role: role || "",
        country: country || "",
        text,
        avatar_url: avatar_url || null,
        image: avatar_url || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, testimonial: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, role, country, text, avatar_url } = body

    if (!id || !name || !text) {
      return NextResponse.json({ message: "ID, nom et texte sont requis." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("testimonials")
      .update({
        name,
        role: role || "",
        country: country || "",
        text,
        avatar_url: avatar_url || null,
        image: avatar_url || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, testimonial: data })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "ID manquant." }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from("testimonials")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Erreur serveur." }, { status: 500 })
  }
}
