import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { courseSlug, courseTitle, price, fullName, email, whatsapp, country } = await req.json()

    if (!email || !fullName || !courseSlug || !price) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const refCommand = `LGI-STRIPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // 1. Resolve Course ID and Slug
    const { data: courseData } = await supabaseServer
      .from("courses")
      .select("id, title, slug")
      .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
      .maybeSingle()

    const resolvedCourseSlug = courseData?.slug || courseSlug
    const resolvedCourseTitle = courseData?.title || courseTitle || courseSlug
    const courseId = courseData?.id || null

    // 2. Manage Registration in 'registrations' table (Exactly as in Mobile Money)
    let registrationId: string | null = null
    const { data: existingReg } = await supabaseServer
      .from("registrations")
      .select("id")
      .eq("email", emailClean)
      .maybeSingle()

    const regPayload: any = {
      full_name: fullName,
      email: emailClean,
      whatsapp: whatsapp || null,
      country: country || "CI",
      source: "checkout_stripe",
      course_slug: resolvedCourseSlug,
      course_id: courseId,
      status: "inscrit",
      notes: JSON.stringify({
        course_slug: resolvedCourseSlug,
        course_title: resolvedCourseTitle,
        payment_method: "stripe",
        transaction_ref: refCommand,
        initiated_at: new Date().toISOString()
      })
    }

    if (existingReg) {
      registrationId = existingReg.id
      await supabaseServer
        .from("registrations")
        .update(regPayload)
        .eq("id", existingReg.id)
    } else {
      const { data: newReg, error: regErr } = await supabaseServer
        .from("registrations")
        .insert(regPayload)
        .select("id")
        .single()

      if (newReg) {
        registrationId = newReg.id
      }
    }

    const priceNumber = Number(price) || 0

    // 3. Create Payment record in 'payments' table with 'pending' status
    const { data: payment } = await supabaseServer
      .from("payments")
      .insert({
        registration_id: registrationId,
        amount: priceNumber,
        currency: "XOF",
        method: "stripe",
        status: "pending",
        transaction_ref: refCommand,
        course_title: resolvedCourseTitle,
        payment_method: "Carte Bancaire (Stripe)"
      })
      .select("id")
      .single()

    // 4. Create user_courses in 'pending_verification' status
    try {
      await supabaseServer.from("user_courses").upsert({
        user_email: emailClean,
        course_slug: resolvedCourseSlug,
        course_id: courseId,
        status: "pending_verification",
        amount_paid: priceNumber,
        payment_method: "stripe",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_email,course_slug" })
    } catch (ucErr) {
      console.warn("user_courses pending stripe upsert warning:", ucErr)
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

    if (!stripeSecretKey) {
      console.warn("Stripe Secret Key not configured. Simulating Stripe redirect URL.")
      return NextResponse.json({
        url: `${baseUrl}/checkout/success?ref=${refCommand}&simulated=true`,
        ref: refCommand,
      })
    }

    if (priceNumber <= 0) {
      return NextResponse.json({
        url: `${baseUrl}/checkout/success?ref=${refCommand}&free=true`,
        ref: refCommand
      })
    }

    // Conversion FCFA -> EUR en centimes pour Stripe
    // Note : Stripe exige un montant minimum de 50 centimes (0.50 €) par transaction CB.
    const rawCents = Math.round((priceNumber / 655.957) * 100)
    const priceInEurCents = Math.max(50, rawCents)

    const params = new URLSearchParams()
    params.append("mode", "payment")
    params.append("success_url", `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${refCommand}`)
    params.append("cancel_url", `${baseUrl}/checkout/${courseSlug}`)
    params.append("customer_email", emailClean)
    params.append("client_reference_id", refCommand)
    
    params.append("line_items[0][price_data][currency]", "eur")
    params.append("line_items[0][price_data][unit_amount]", priceInEurCents.toString())
    params.append("line_items[0][price_data][product_data][name]", `Inscription ${resolvedCourseTitle} - Le Guide IA`)
    params.append("line_items[0][price_data][product_data][description]", `${priceNumber.toLocaleString("fr-FR")} FCFA — Accès complet au Bootcamp`)
    params.append("line_items[0][price_data][product_data][tax_code]", "txcd_10000000")
    params.append("line_items[0][quantity]", "1")
    params.append("managed_payments[enabled]", "false")

    params.append("metadata[registrationId]", registrationId || "")
    params.append("metadata[paymentId]", payment?.id || "")
    params.append("metadata[fullName]", fullName)
    params.append("metadata[email]", emailClean)
    params.append("metadata[whatsapp]", whatsapp || "")
    params.append("metadata[country]", country || "")
    params.append("metadata[courseSlug]", resolvedCourseSlug)
    params.append("metadata[courseTitle]", resolvedCourseTitle)
    params.append("metadata[price]", String(priceNumber))
    params.append("metadata[refCommand]", refCommand)

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const stripeData = await stripeRes.json()

    if (stripeRes.ok && stripeData.url) {
      return NextResponse.json({ url: stripeData.url, ref: refCommand })
    }

    return NextResponse.json({
      message: stripeData.error?.message || "Erreur de communication avec Stripe.",
    }, { status: 500 })

  } catch (error: any) {
    console.error("Stripe payment initialization error:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur." }, { status: 500 })
  }
}
