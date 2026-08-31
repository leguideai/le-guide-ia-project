import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: lives, error } = await supabaseServer
      .from("live_sessions")
      .select("*")
      .order("scheduled_at", { ascending: true })

    if (error) {
      console.warn("Live sessions fetch warning:", error.message)
      return NextResponse.json({ success: true, lives: [] })
    }

    return NextResponse.json({ success: true, lives: lives || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, title, course_slug, meet_url, replay_url, scheduled_at, status } = body

    if (!title) {
      return NextResponse.json({ error: "Le titre de la session est requis." }, { status: 400 })
    }

    const cleanMeetUrl = meet_url && String(meet_url).trim() !== "https://meet.google.com" ? String(meet_url).trim() : null

    const { data: live, error } = await supabaseServer
      .from("live_sessions")
      .upsert({
        ...(id ? { id } : {}),
        title,
        course_slug: course_slug || "bootcamp-pro-2",
        meet_url: cleanMeetUrl,
        replay_url: replay_url || null,
        scheduled_at: scheduled_at || new Date().toISOString(),
        status: status || "upcoming"
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Session Live "${title}" mise à jour avec succès !`,
      live
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
