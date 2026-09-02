import { supabaseServer } from "@/lib/supabase-server"
import { sendStripeSuccessEmail, sendSubscriptionActivatedEmail } from "@/lib/email"
import { calculateSubscriptionExpiry } from "@/lib/subscriptions"

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

    const isSubscription = metadata.type === "subscription" || metadata.courseSlug === "subscription-vip" || metadata.plan

    // === BRANCH 1: VIP SUBSCRIPTION FULFILLMENT ===
    if (isSubscription) {
      const plan = metadata.plan || (price >= 25000 ? "1_year" : "3_months")
      const planLabel = metadata.planLabel || (plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)")
      const startsAt = new Date().toISOString()
      const expiresAt = calculateSubscriptionExpiry(plan).toISOString()
      const subId = metadata.subscriptionId || `sub_stripe_${Date.now()}`

      // A. Mettre à jour dans 'subscriptions' table
      try {
        await supabaseServer.from("subscriptions").upsert({
          id: subId,
          email: email,
          full_name: fullName,
          whatsapp: whatsapp || null,
          country: country || "CI",
          plan: plan,
          plan_label: planLabel,
          amount: price,
          currency: "XOF",
          status: "active",
          payment_method: "Stripe (Carte Bancaire)",
          transaction_ref: refCommand,
          starts_at: startsAt,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        })
      } catch (subDbErr) {
        console.warn("subscriptions upsert note in stripe fulfillment:", subDbErr)
      }

      // B. Mettre à jour dans le miroir site_settings.subscriptions
      try {
        const { data: setRow } = await supabaseServer.from("site_settings").select("value").eq("key", "subscriptions").maybeSingle()
        let existing = []
        if (setRow?.value) {
          try { existing = typeof setRow.value === "string" ? JSON.parse(setRow.value) : setRow.value } catch (_) {}
        }
        const updated = [{
          id: subId,
          email: email,
          full_name: fullName,
          whatsapp: whatsapp || null,
          country: country || "CI",
          plan: plan,
          plan_label: planLabel,
          amount: price,
          currency: "XOF",
          status: "active",
          payment_method: "Stripe (Carte Bancaire)",
          transaction_ref: refCommand,
          starts_at: startsAt,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        }, ...existing.filter((s: any) => s.email?.toLowerCase() !== email)]

        await supabaseServer.from("site_settings").upsert({
          key: "subscriptions",
          value: JSON.stringify(updated),
          updated_at: new Date().toISOString()
        }, { onConflict: "key" })
      } catch (mirrorErr) {
        console.warn("mirror sync in stripe fulfillment:", mirrorErr)
      }

      // C. Ensure Profile
      try {
        const { data: existingProfile } = await supabaseServer
          .from("profiles")
          .select("id")
          .ilike("email", email)
          .maybeSingle()

        if (existingProfile) {
          await supabaseServer
            .from("profiles")
            .update({
              full_name: fullName || undefined,
              whatsapp: whatsapp || undefined,
              country: country || undefined,
              role: "student",
              plan: "PRO",
              status: "active",
              updated_at: new Date().toISOString()
            })
            .eq("id", existingProfile.id)
        }
      } catch (authErr) {
        console.warn("Auth user ensure note:", authErr)
      }

      // D. Envoyer l'email d'activation VIP
      try {
        await sendSubscriptionActivatedEmail(fullName, email, planLabel, expiresAt)
      } catch (_) {}

      console.log(`[Stripe Fulfillment] Successfully activated VIP Subscription for ${email} (${planLabel})`)
      return { success: true, email, courseTitle: `Abonnement VIP — ${planLabel}` }
    }

    // === BRANCH 2: BOOTCAMP FULFILLMENT ===
    // 1. Resolve Course Record
    const { data: course } = await supabaseServer
      .from("courses")
      .select("id, title, slug")
      .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
      .maybeSingle()

    const resolvedCourseSlug = course?.slug || courseSlug
    const resolvedCourseTitle = course?.title || courseTitle

    // 2. Manage Registration (safe select + update / insert)
    let regId: string | null = null
    const { data: existingReg } = await supabaseServer
      .from("registrations")
      .select("id")
      .ilike("email", email)
      .maybeSingle()

    const regPayload: any = {
      full_name: fullName,
      email: email,
      whatsapp: whatsapp || null,
      country: country || "CI",
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
    }

    if (existingReg) {
      regId = existingReg.id
      await supabaseServer.from("registrations").update(regPayload).eq("id", existingReg.id)
    } else {
      const { data: newReg } = await supabaseServer.from("registrations").insert(regPayload).select("id").single()
      regId = newReg?.id || null
    }

    // 3. Manage Payment Record
    const { data: existingPayment } = await supabaseServer
      .from("payments")
      .select("id")
      .eq("transaction_ref", refCommand)
      .maybeSingle()

    const paymentPayload: any = {
      registration_id: regId,
      amount: price,
      currency: "XOF",
      method: "stripe",
      status: "confirmed",
      transaction_ref: refCommand,
      course_title: resolvedCourseTitle,
      payment_method: "Carte Bancaire (Stripe)",
      confirmed_at: new Date().toISOString()
    }

    if (existingPayment) {
      await supabaseServer.from("payments").update(paymentPayload).eq("id", existingPayment.id)
    } else {
      await supabaseServer.from("payments").insert(paymentPayload)
    }

    // 4. Enroll User in user_courses (Activates instantly on Dashboard & throughout platform)
    const { data: existingUC } = await supabaseServer
      .from("user_courses")
      .select("id")
      .ilike("user_email", email)
      .eq("course_slug", resolvedCourseSlug)
      .maybeSingle()

    if (existingUC) {
      await supabaseServer
        .from("user_courses")
        .update({ status: "active" })
        .eq("id", existingUC.id)
    } else {
      await supabaseServer
        .from("user_courses")
        .insert({
          user_email: email,
          course_slug: resolvedCourseSlug,
          status: "active"
        })
    }

    // Update any other user_courses matching email & course_slug to active
    await supabaseServer
      .from("user_courses")
      .update({ status: "active" })
      .ilike("user_email", email)
      .eq("course_slug", resolvedCourseSlug)

    // 5. Ensure Profile and Auth User
    try {
      const { data: existingProfile } = await supabaseServer
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle()

      if (existingProfile) {
        await supabaseServer
          .from("profiles")
          .update({
            full_name: fullName || undefined,
            whatsapp: whatsapp || undefined,
            country: country || undefined,
            role: "student",
            plan: "PRO",
            status: "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", existingProfile.id)
      } else {
        const { data: listData } = await supabaseServer.auth.admin.listUsers()
        const existingAuthUser = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
        let authUserId = existingAuthUser?.id

        if (!existingAuthUser) {
          const tempPassword = `Lgi${Math.floor(1000 + Math.random() * 9000)}!2026`
          const { data: newAuth } = await supabaseServer.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName, whatsapp: whatsapp }
          })
          authUserId = newAuth?.user?.id
        }

        if (authUserId) {
          await supabaseServer.from("profiles").upsert({
            id: authUserId,
            email: email,
            full_name: fullName,
            whatsapp: whatsapp || null,
            country: country || null,
            role: "student",
            plan: "PRO",
            status: "active"
          })
        }
      }
    } catch (authErr) {
      console.warn("Auth user ensure warning in Stripe fulfillment:", authErr)
    }

    // 6. Send official instant confirmation email
    await sendStripeSuccessEmail({
      fullName,
      email,
      courseTitle: resolvedCourseTitle,
      amount: price,
      originalPrice: metadata.originalPrice,
      subscriptionCredit: metadata.subscriptionCredit || metadata.subscription_credit || metadata.subscription_deduction,
      subscriptionPlan: metadata.subscriptionPlan || metadata.subscription_plan,
      transactionRef: refCommand,
    })

    console.log(`[Stripe Fulfillment] Successfully fulfilled order and granted instant access to ${email} for course ${resolvedCourseSlug}`)
    return { success: true, email, courseTitle: resolvedCourseTitle }
  } catch (err: any) {
    console.error("[Stripe Fulfillment] Error fulfilling checkout:", err)
    return { success: false, error: err.message || "Fulfillment error" }
  }
}
