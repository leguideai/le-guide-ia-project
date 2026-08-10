import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: courses, error } = await supabaseServer
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Courses fetch error from Supabase:", error.message)
      return NextResponse.json({ success: true, courses: [] })
    }

    return NextResponse.json({ success: true, courses: courses || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, title, slug, subtitle, price, original_price, badge, category, status, poster, dates, instructor, live_meet_url, lessons } = body

    if (!title || !slug) {
      return NextResponse.json({ error: "Le titre et le slug sont obligatoires." }, { status: 400 })
    }

    // Upsert Course into Supabase
    const { data: course, error } = await supabaseServer
      .from("courses")
      .upsert({
        ...(id ? { id } : {}),
        title,
        slug,
        subtitle,
        price: price || "99 000 FCFA",
        original_price: original_price || "150 000 FCFA",
        badge: badge || "Nouveau",
        category: category || "Bootcamp",
        status: status || "published",
        poster: poster || "/images/bootcamp_pro_thumb.jpg",
        dates: dates || "Sur 7 jours",
        instructor: instructor || "Alfred Dah",
        live_meet_url: live_meet_url || "https://meet.google.com/xyz-abc-def",
        updated_at: new Date().toISOString()
      }, { onConflict: "slug" })
      .select()
      .single()

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
