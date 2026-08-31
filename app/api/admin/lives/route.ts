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
    const { id, title, course_slug, course_id, meet_url, replay_url, recording_url, scheduled_at, status } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre du bootcamp / direct est requis." }, { status: 400 })
    }

    const cleanMeetUrl = meet_url && String(meet_url).trim() !== "https://meet.google.com" && String(meet_url).trim() !== "" 
      ? String(meet_url).trim() 
      : null

    const finalReplayUrl = (replay_url || recording_url || "").trim() || null

    // 1. Trouver le cours associé
    let targetCourseId = course_id
    let targetCourseSlug = course_slug

    if (!targetCourseId && targetCourseSlug) {
      const { data: c } = await supabaseServer
        .from("courses")
        .select("id, slug")
        .eq("slug", targetCourseSlug)
        .maybeSingle()
      if (c) targetCourseId = c.id
    }

    if (!targetCourseId) {
      const { data: firstCourse } = await supabaseServer
        .from("courses")
        .select("id, slug")
        .limit(1)
        .maybeSingle()
      if (firstCourse) {
        targetCourseId = firstCourse.id
        targetCourseSlug = targetCourseSlug || firstCourse.slug
      }
    }

    // 2. Calculer le session_number si nouvelle session
    let sessionNumber = 1
    if (targetCourseId) {
      const { data: existingSessions } = await supabaseServer
        .from("bootcamp_sessions")
        .select("session_number")
        .eq("course_id", targetCourseId)
        .order("session_number", { ascending: false })
        .limit(1)

      if (existingSessions && existingSessions.length > 0) {
        sessionNumber = (existingSessions[0].session_number || 0) + 1
      }
    }

    // 3. Sauvegarder dans bootcamp_sessions
    const bootcampPayload: any = {
      title: title.trim(),
      course_id: targetCourseId || "default",
      course_slug: targetCourseSlug || "bootcamp-pro-2",
      meet_url: cleanMeetUrl,
      recording_url: finalReplayUrl,
      scheduled_at: scheduled_at || new Date().toISOString(),
      status: status || "upcoming"
    }

    const isRealId = id && !String(id).startsWith("sess-") && !String(id).startsWith("launch-")
    if (isRealId) {
      bootcampPayload.id = id
    } else {
      bootcampPayload.session_number = sessionNumber
    }

    let savedSession: any = null

    const { data: savedBootcamp, error: bError } = await supabaseServer
      .from("bootcamp_sessions")
      .upsert(bootcampPayload)
      .select()
      .maybeSingle()

    if (bError) {
      console.warn("bootcamp_sessions upsert note:", bError.message)
    } else if (savedBootcamp) {
      savedSession = savedBootcamp
    }

    // 4. Sauvegarder également dans live_sessions pour compatibilité
    try {
      const livePayload: any = {
        title: title.trim(),
        course_slug: targetCourseSlug || "bootcamp-pro-2",
        meet_url: cleanMeetUrl,
        replay_url: finalReplayUrl,
        scheduled_at: scheduled_at || new Date().toISOString(),
        status: status || "upcoming"
      }
      if (isRealId) {
        livePayload.id = id
      }
      const { data: savedLive } = await supabaseServer
        .from("live_sessions")
        .upsert(livePayload)
        .select()
        .maybeSingle()

      if (!savedSession && savedLive) {
        savedSession = savedLive
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Bootcamp / Session "${title}" enregistré avec succès !`,
      session: savedSession || bootcampPayload
    })
  } catch (error: any) {
    console.error("Save live error:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'enregistrement de la session." }, { status: 500 })
  }
}
