import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseServer
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Admin users fetch error:", error)
      return NextResponse.json({ users: [] })
    }

    return NextResponse.json({ success: true, users: profiles || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, role, action, courseSlug, userEmail } = await req.json()

    if (action === "update_role") {
      if (!userId || !role) {
        return NextResponse.json({ error: "userId et role requis." }, { status: 400 })
      }

      const { data, error } = await supabaseServer
        .from("profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, user: data, message: `Rôle mis à jour avec succès: ${role}` })
    }

    if (action === "enroll_course") {
      if (!userEmail || !courseSlug) {
        return NextResponse.json({ error: "userEmail et courseSlug requis." }, { status: 400 })
      }

      // Check if registration exists
      const { data: existingReg } = await supabaseServer
        .from("registrations")
        .select("id")
        .eq("email", userEmail.toLowerCase())
        .maybeSingle()

      if (existingReg) {
        await supabaseServer
          .from("registrations")
          .update({ status: "paye" })
          .eq("id", existingReg.id)
      } else {
        await supabaseServer
          .from("registrations")
          .insert({
            full_name: userEmail.split("@")[0],
            email: userEmail.toLowerCase(),
            status: "paye",
            source: "admin_manual_enroll"
          })
      }

      // Add to user_courses if table exists
      const { error: enrollErr } = await supabaseServer
        .from("user_courses")
        .upsert({
          user_email: userEmail.toLowerCase(),
          course_slug: courseSlug,
          status: "active"
        }, { onConflict: "user_email,course_slug" })

      if (enrollErr) console.warn("user_courses insert warning:", enrollErr.message)

      return NextResponse.json({ success: true, message: `Utilisateur ${userEmail} inscrit avec succès au cours ${courseSlug}` })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
