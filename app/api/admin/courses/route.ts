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
    }

    return NextResponse.json({ success: true, courses: courses || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, title, slug, subtitle, price, original_price, badge, category, status, poster, dates, start_date, end_date, session_count, whatsapp_url, instructor, live_meet_url, sequence_order, lessons } = body

    if (!title || !slug) {
      return NextResponse.json({ error: "Le titre et le slug sont obligatoires." }, { status: 400 })
    }

    const upsertPayload: any = {
      ...(id ? { id } : {}),
      title,
      slug,
      description: subtitle || body.description || "",
      subtitle: subtitle || body.description || "",
      price: price || 99000,
      original_price: original_price || "150 000 FCFA",
      badge: badge || "Nouveau",
      category: category || "Bootcamp",
      status: status || "published",
      thumbnail: body.thumbnail || body.poster || "/images/bootcamp_pro_thumb.jpg",
      poster: body.poster || body.thumbnail || "/images/bootcamp_pro_poster.jpg",
      pdf_url: body.pdf_url || body.programme_url || "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
      format: body.format || "100% En Ligne",
      certificate: body.certificate || "Certificat Officiel",
      sequence_order: sequence_order !== undefined ? Number(sequence_order) : 1,
      dates: dates || "Sur 7 jours",
      start_date: start_date || null,
      end_date: end_date || null,
      session_count: session_count !== undefined && session_count !== null ? Number(session_count) : 0,
      whatsapp_url: whatsapp_url || "",
      instructor: instructor || "Alfred Dah",
      live_meet_url: live_meet_url || "https://meet.google.com/xyz-abc-def",
      features: body.features || [],
      updated_at: new Date().toISOString()
    }

    let { data: course, error } = await supabaseServer
      .from("courses")
      .upsert(upsertPayload, { onConflict: "slug" })
      .select()
      .single()

    if (error && (error.message.includes("sequence_order") || error.message.includes("column"))) {
      // Si des colonnes n'existent pas encore dans Supabase, repli sans les nouvelles colonnes
      const fallbackPayload = { ...upsertPayload }
      delete fallbackPayload.start_date
      delete fallbackPayload.end_date
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
