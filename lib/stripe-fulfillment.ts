import { supabaseServer } from "@/lib/supabase-server"
import { sendStripeSuccessEmail } from "@/lib/email"

export async function fulfillStripeCheckout(session: any) {
  try {
    const refCommand = session.client_reference_id || session.metadata?.refCommand || `LGI-STRIPE-${Date.now()}`
    const metadata = session.metadata || {}

    const email = (session.customer_email || metadata.email || "").toLowerCase().trim()
    const fullName = metadata.fullName || "Membre Le Guide IA"
    const whatsapp = metadata.whatsapp || ""
    const country = metadata.country || ""
    const courseSlug = metadata.courseSlug || "bootcamp-ia-pro"
    const courseTitle = metadata.courseTitle || "Bootcamp IA"
    const price = Number(metadata.price) || (session.amount_total ? Math.round((session.amount_total / 100) * 655.957) : 99000)

    if (!email) {
      console.warn("Stripe fulfillment: Missing customer email")
      return { success: false, error: "Missing email" }
    }

    // 1. Resolve Course Record
    const { data: course } = await supabaseServer
      .from("courses")
      .select("id, title, slug")
      .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
      .maybeSingle()

    const resolvedCourseSlug = course?.slug || courseSlug
    const resolvedCourseTitle = course?.title || courseTitle

    // 2. Upsert Registration with status "paye" and course_slug
    const { data: registration } = await supabaseServer
      .from("registrations")
      .upsert({
        full_name: fullName,
        email: email,
        whatsapp: whatsapp || null,
        country: country || null,
        source: "checkout_stripe",
        course_slug: resolvedCourseSlug,
        course_id: course?.id || null,
        status: "paye",
        notes: JSON.stringify({
          course_slug: resolvedCourseSlug,
          course_title: resolvedCourseTitle,
          payment_method: "stripe",
          ref: refCommand,
          paid_at: new Date().toISOString()
        })
      }, { onConflict: "email" })
      .select("id")
      .single()

    const regId = registration?.id || null

    // 3. Check if payment already exists
    const { data: existingPayment } = await supabaseServer
      .from("payments")
      .select("id, status")
      .eq("transaction_ref", refCommand)
      .maybeSingle()

    if (existingPayment) {
      await supabaseServer
        .from("payments")
        .update({
          registration_id: regId,
          amount: price,
          currency: "XOF",
          method: "stripe",
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", existingPayment.id)
    } else {
      await supabaseServer
        .from("payments")
        .insert({
          registration_id: regId,
          amount: price,
          currency: "XOF",
          method: "stripe",
          status: "confirmed",
          transaction_ref: refCommand,
          confirmed_at: new Date().toISOString(),
        })
    }

    // 4. Create or fetch user in Supabase Auth & profiles
    let userId: string | null = null

    const { data: existingUser } = await supabaseServer
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
      await supabaseServer
        .from("profiles")
        .update({
          plan: "PRO",
          full_name: fullName || undefined,
          whatsapp: whatsapp || undefined,
          country: country || undefined,
          status: "active"
        })
        .eq("id", userId)
    } else {
      // Create user in Auth
      const tempPassword = "Lgi" + Math.floor(100000 + Math.random() * 900000) + "!"
      const { data: newUser, error: createErr } = await supabaseServer.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, whatsapp: whatsapp },
      })

      if (!createErr && newUser?.user) {
        userId = newUser.user.id
        await supabaseServer
          .from("profiles")
          .upsert({
            id: userId,
            email: email,
            full_name: fullName,
            whatsapp: whatsapp || null,
            country: country || null,
            role: "user",
            plan: "PRO",
            status: "active"
          })
      }
    }

    // 5. Enroll User in user_courses (Activates instantly on Dashboard & API)
    await supabaseServer.from("user_courses").upsert({
      user_email: email,
      user_id: userId || null,
      course_slug: resolvedCourseSlug,
      course_id: course?.id || null,
      status: "active",
      amount_paid: price,
      payment_method: "stripe",
      updated_at: new Date().toISOString()
    }, { onConflict: "user_email,course_slug" })

    // 6. Send official instant confirmation email
    await sendStripeSuccessEmail({
      fullName,
      email,
      courseTitle: resolvedCourseTitle,
      amount: price,
      transactionRef: refCommand,
    })

    console.log(`[Stripe Fulfillment] Successfully fulfilled order for ${email} (${resolvedCourseSlug})`)
    return { success: true, email, courseTitle: resolvedCourseTitle }
  } catch (err: any) {
    console.error("[Stripe Fulfillment] Error fulfilling checkout:", err)
    return { success: false, error: err.message || "Fulfillment error" }
  }
}
