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
      const { paymentMethod, transactionRef } = await req.json().catch(() => ({}))
      if (!userEmail || !courseSlug) {
        return NextResponse.json({ error: "userEmail et courseSlug requis." }, { status: 400 })
      }

      const emailClean = userEmail.toLowerCase().trim()

      // Fetch course details
      const { data: courseData } = await supabaseServer
        .from("courses")
        .select("*")
        .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
        .maybeSingle()

      const courseId = courseData?.id || null
      const courseSlugFinal = courseData?.slug || courseSlug
      const courseTitle = courseData?.title || courseSlug
      const rawPrice = courseData?.price ? String(courseData.price).replace(/\D/g, "") : "99000"
      const amountNum = parseInt(rawPrice) || 99000

      // 1. Get or create profile
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("full_name")
        .eq("email", emailClean)
        .maybeSingle()

      const fullName = profile?.full_name || emailClean.split("@")[0]

      // 2. Check or create registration for this email & course
      let regId: string | null = null

      try {
        let queryReg = supabaseServer
          .from("registrations")
          .select("id")
          .eq("email", emailClean)

        if (courseId) {
          queryReg = queryReg.eq("course_id", courseId)
        }

        const { data: existingReg, error: selErr } = await queryReg.maybeSingle()

        if (!selErr && existingReg) {
          regId = existingReg.id
          await supabaseServer
            .from("registrations")
            .update({
              status: "paye",
              ...(courseId ? { course_id: courseId } : {}),
              course_slug: courseSlugFinal
            })
            .eq("id", regId)
        } else {
          let { data: newReg, error: regErr } = await supabaseServer
            .from("registrations")
            .insert({
              full_name: fullName,
              email: emailClean,
              ...(courseId ? { course_id: courseId } : {}),
              course_slug: courseSlugFinal,
              status: "paye",
              source: "admin_manual_enroll"
            })
            .select()
            .single()

          if (regErr && (regErr.message.includes("column") || regErr.code === "42703")) {
            // Fallback: insert basic registration without extra columns if SQL not run yet
            const { data: fbReg } = await supabaseServer
              .from("registrations")
              .insert({
                full_name: fullName,
                email: emailClean,
                status: "paye",
                source: "admin_manual_enroll"
              })
              .select()
              .single()

            if (fbReg) regId = fbReg.id
          } else if (newReg) {
            regId = newReg.id
          }
        }
      } catch (err) {
        console.error("Registration error:", err)
      }

      // 3. Create confirmed payment record for the receipt
      const methodLabel = paymentMethod && paymentMethod.trim() !== "" ? paymentMethod : "Inscription Manuelle (Admin)"
      const refCode = transactionRef && transactionRef.trim() !== "" ? transactionRef : `ADM-${Date.now().toString().slice(-6)}`

      if (regId) {
        await supabaseServer
          .from("payments")
          .insert({
            registration_id: regId,
            amount: amountNum,
            currency: "XOF",
            method: methodLabel,
            status: "confirmed",
            transaction_ref: refCode,
            created_at: new Date().toISOString()
          })
      }

      // 4. Add to user_courses if table exists
      const { error: enrollErr } = await supabaseServer
        .from("user_courses")
        .upsert({
          user_email: emailClean,
          course_slug: courseSlug,
          status: "active"
        }, { onConflict: "user_email,course_slug" })

      if (enrollErr) console.warn("user_courses insert warning:", enrollErr.message)

      return NextResponse.json({
        success: true,
        message: `Utilisateur ${emailClean} inscrit avec succès à "${courseTitle}" (${methodLabel})`
      })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
