import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { sendManualEnrollmentEmail } from "@/lib/email"

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
    const body = await req.json()
    const {
      userId,
      role,
      action,
      sendEmail = true
    } = body

    const userEmail = body.userEmail || body.email || body.user_email
    const courseSlug = body.courseSlug || body.course_slug
    const userName = body.userName || body.name || body.fullName || body.full_name
    const paymentMethod = body.paymentMethod || body.payment_method
    const transactionRef = body.transactionRef || body.transaction_ref
    const courseTitleOverride = body.course_title || body.courseTitle
    const amountPaidOverride = body.amount_paid || body.amountPaid || body.amount

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

    if (action === "enroll_course" || action === "enroll_single_course") {
      if (!userEmail || !courseSlug) {
        return NextResponse.json({ error: "userEmail et courseSlug requis." }, { status: 400 })
      }

      const emailClean = userEmail.toLowerCase().trim()

      // 1. Fetch course details
      const { data: courseData } = await supabaseServer
        .from("courses")
        .select("*")
        .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
        .maybeSingle()

      const courseId = courseData?.id || null
      const courseSlugFinal = courseData?.slug || courseSlug
      const courseTitle = courseTitleOverride || courseData?.title || courseSlug
      const amountNum = amountPaidOverride ? Number(amountPaidOverride) : (courseData?.price ? parseInt(String(courseData.price).replace(/\D/g, "")) : 0)

      // 2. Look up or Create Auth User in Supabase Auth
      let authUserId: string | null = null
      let isNewAccount = false
      let tempPassword: string | undefined = undefined

      try {
        const { data: listData } = await supabaseServer.auth.admin.listUsers()
        const existingAuthUser = listData?.users?.find(u => u.email?.toLowerCase() === emailClean)

        if (existingAuthUser) {
          authUserId = existingAuthUser.id
        } else {
          // Generate secure temporary password for new student
          isNewAccount = true
          tempPassword = `Lgi${Math.floor(1000 + Math.random() * 9000)}!2026`
          const { data: newUser, error: createErr } = await supabaseServer.auth.admin.createUser({
            email: emailClean,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: userName || emailClean.split("@")[0] }
          })

          if (newUser?.user) {
            authUserId = newUser.user.id
          } else if (createErr) {
            console.warn("Supabase auth createUser warning:", createErr.message)
          }
        }
      } catch (authErr) {
        console.warn("Auth check/creation exception:", authErr)
      }

      // 3. Get or update profile
      const { data: existingProfile } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("email", emailClean)
        .maybeSingle()

      const resolvedFullName = userName?.trim() || existingProfile?.full_name || emailClean.split("@")[0]

      if (authUserId) {
        await supabaseServer
          .from("profiles")
          .upsert({
            id: authUserId,
            email: emailClean,
            full_name: resolvedFullName,
            role: existingProfile?.role || "student",
            updated_at: new Date().toISOString()
          }, { onConflict: "id" })
      } else if (!existingProfile) {
        await supabaseServer
          .from("profiles")
          .insert({
            email: emailClean,
            full_name: resolvedFullName,
            role: "student"
          })
      }

      // 4. Check or create registration for this email & course
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
          const { data: newReg, error: regErr } = await supabaseServer
            .from("registrations")
            .insert({
              full_name: resolvedFullName,
              email: emailClean,
              ...(courseId ? { course_id: courseId } : {}),
              course_slug: courseSlugFinal,
              status: "paye",
              source: "admin_manual_enroll"
            })
            .select()
            .single()

          if (regErr && (regErr.message.includes("column") || regErr.code === "42703")) {
            const { data: fbReg } = await supabaseServer
              .from("registrations")
              .insert({
                full_name: resolvedFullName,
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

      // 5. Create confirmed payment record for the receipt
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

      // 6. Add to user_courses for immediate platform access
      try {
        const { error: enrollErr } = await supabaseServer
          .from("user_courses")
          .upsert({
            user_email: emailClean,
            course_slug: courseSlugFinal,
            status: "active"
          }, { onConflict: "user_email,course_slug" })

        if (enrollErr) {
          await supabaseServer
            .from("user_courses")
            .insert({
              user_email: emailClean,
              course_slug: courseSlugFinal,
              status: "active"
            })
        }
      } catch (ucErrCatch) {
        console.warn("user_courses note:", ucErrCatch)
      }

      // 7. Envoi de l'Email de confirmation et d'accès automatique via Resend
      let emailSent = false
      if (sendEmail !== false) {
        try {
          const mailRes = await sendManualEnrollmentEmail({
            fullName: resolvedFullName,
            email: emailClean,
            courseTitle,
            amount: amountNum,
            paymentMethod: methodLabel,
            transactionRef: refCode,
            tempPassword,
            isNewAccount
          })
          emailSent = !!mailRes.success
        } catch (mailErr) {
          console.error("Failed to send manual enrollment email:", mailErr)
        }
      }

      return NextResponse.json({
        success: true,
        emailSent,
        isNewAccount,
        tempPassword,
        message: `Apprenant ${emailClean} inscrit à "${courseTitle}" ! ${
          emailSent
            ? "📧 Email d'accès et reçu envoyé avec succès."
            : "⚠️ Accès débloqué (email non délivré si clé API Resend absente)."
        }`
      })
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
