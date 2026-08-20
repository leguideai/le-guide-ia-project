import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    let { data: courses, error } = await supabaseServer
      .from("courses")
      .select("*")
      .order("sequence_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      const fallback = await supabaseServer
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true })
      courses = fallback.data
    }

    if (courses && courses.length > 0) {
      courses.sort((a: any, b: any) => {
        const seqA = a.sequence_order !== undefined && a.sequence_order !== null ? Number(a.sequence_order) : 999
        const seqB = b.sequence_order !== undefined && b.sequence_order !== null ? Number(b.sequence_order) : 999
        if (seqA !== seqB) return seqA - seqB
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      })

      // Dual-layer fallback: Hydrate offer dates from site_settings if columns are empty
      try {
        const { data: settingsData } = await supabaseServer.from("site_settings").select("*")
        if (settingsData && settingsData.length > 0) {
          const settingsMap: Record<string, any> = {}
          settingsData.forEach((s: any) => {
            if (s.key && s.key.startsWith("offer_")) {
              try { settingsMap[s.key] = JSON.parse(s.value) } catch { settingsMap[s.key] = s.value }
            }
          })
          courses.forEach((c: any) => {
            const offerBackup = settingsMap[`offer_${c.slug}`]
            if (offerBackup && typeof offerBackup === "object") {
              if (!c.offer_start_date && offerBackup.offer_start_date) c.offer_start_date = offerBackup.offer_start_date
              if (!c.offer_end_date && offerBackup.offer_end_date) c.offer_end_date = offerBackup.offer_end_date
              if (!c.offer_badge_text && offerBackup.offer_badge_text) c.offer_badge_text = offerBackup.offer_badge_text
            }
          })
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, courses: courses || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id, title, slug, subtitle, price, original_price, badge, category, status,
      poster, dates, start_date, end_date, session_count, whatsapp_url, instructor,
      live_meet_url, sequence_order, offer_start_date, offer_end_date, offer_badge_text, lessons
    } = body

    if (!title || !slug) {
      return NextResponse.json({ error: "Le titre et le slug sont obligatoires." }, { status: 400 })
    }

    const upsertPayload: any = {
      ...(id ? { id } : {}),
      title,
      slug,
      description: subtitle || body.description || "",
      subtitle: subtitle || body.description || "",
      price: price !== undefined ? price : 0,
      original_price: original_price || "",
      badge: badge || "Nouveau",
      category: category || "Bootcamp",
      status: status || "published",
      thumbnail: body.thumbnail || body.poster || null,
      poster: body.poster || body.thumbnail || null,
      pdf_url: body.pdf_url || body.programme_url || null,
      format: body.format || "100% En Ligne",
      certificate: body.certificate || "Certificat Officiel",
      sequence_order: sequence_order !== undefined ? Number(sequence_order) : 1,
      dates: dates || "",
      start_date: start_date || null,
      end_date: end_date || null,
      offer_start_date: offer_start_date || null,
      offer_end_date: offer_end_date || null,
      offer_badge_text: offer_badge_text || "",
      session_count: session_count !== undefined && session_count !== null ? Number(session_count) : 0,
      whatsapp_url: whatsapp_url || "",
      instructor: instructor || "Alfred Dah",
      live_meet_url: live_meet_url || "",
      features: body.features || [],
      skills: body.skills || body.features || [],
      updated_at: new Date().toISOString()
    }

    let { data: course, error } = await supabaseServer
      .from("courses")
      .upsert(upsertPayload, { onConflict: "slug" })
      .select()
      .single()

    if (error && (error.message.includes("sequence_order") || error.message.includes("column") || error.message.includes("skills") || error.message.includes("offer_"))) {
      // Si des colonnes n'existent pas encore dans courses, repli sans les nouvelles colonnes
      const fallbackPayload = { ...upsertPayload }
      delete fallbackPayload.skills
      delete fallbackPayload.start_date
      delete fallbackPayload.end_date
      delete fallbackPayload.offer_start_date
      delete fallbackPayload.offer_end_date
      delete fallbackPayload.offer_badge_text
      delete fallbackPayload.session_count
      delete fallbackPayload.whatsapp_url
      delete fallbackPayload.sequence_order
      const retry = await supabaseServer
        .from("courses")
        .upsert(fallbackPayload, { onConflict: "slug" })
        .select()
        .single()
      course = retry.data
      error = retry.error
    }

    // Always backup offer validity into site_settings so it is guaranteed to persist immediately
    try {
      if (offer_start_date !== undefined || offer_end_date !== undefined || offer_badge_text !== undefined) {
        await supabaseServer.from("site_settings").upsert({
          key: `offer_${slug}`,
          value: JSON.stringify({
            offer_start_date: offer_start_date || null,
            offer_end_date: offer_end_date || null,
            offer_badge_text: offer_badge_text || "Offre Fondateur"
          }),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })
      }
    } catch (e) {}

    if (error) {
      console.error("Error saving course to Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If lessons provided, save them in lessons table
    if (lessons && Array.isArray(lessons)) {
      for (const lesson of lessons) {
        await supabaseServer.from("lessons").upsert({
          course_id: course.id,
          course_slug: slug,
          title: lesson.title,
          num: lesson.num,
          duration: lesson.duration,
          video_url: lesson.videoUrl || lesson.video_url,
          pdf_url: lesson.pdfUrl || lesson.pdf_url,
          pdf_name: lesson.pdfName || lesson.pdf_name,
          scheduled_date: lesson.scheduledDate || lesson.scheduled_date,
          description: lesson.description
        }, { onConflict: "course_slug,num" })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Formation "${title}" enregistrée dans Supabase !`,
      course
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requis." }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from("courses")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Formation supprimée avec succès." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
