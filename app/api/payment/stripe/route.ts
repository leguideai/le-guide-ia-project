import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { courseSlug, courseTitle, price, fullName, email, whatsapp, country } = await req.json()

    if (!email || !fullName || !courseSlug || !price) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const refCommand = `LGI-STRIPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const { data: registration } = await supabaseServer
      .from("registrations")
      .upsert({
        full_name: fullName,
        email: email.toLowerCase(),
        whatsapp,
        country,
        source: "checkout_stripe",
        status: "inscrit",
      }, { onConflict: "email" })
      .select("id")
      .single()

    const { data: payment } = await supabaseServer
      .from("payments")
      .insert({
        registration_id: registration?.id || null,
        amount: price,
        currency: "XOF",
        method: "stripe",
        status: "pending",
        transaction_ref: refCommand,
      })
      .select("id")
      .single()

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

    if (!stripeSecretKey) {
      console.warn("Stripe Secret Key not configured. Simulating Stripe redirect URL.")
      return NextResponse.json({
        url: `${baseUrl}/checkout/success?ref=${refCommand}&simulated=true`,
        ref: refCommand,
      })
    }

    const priceInEurCents = Math.round((price / 655.957) * 100)

    const params = new URLSearchParams()
    params.append("mode", "payment")
    params.append("success_url", `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${refCommand}`)
    params.append("cancel_url", `${baseUrl}/checkout/${courseSlug}`)
    params.append("customer_email", email.toLowerCase())
    params.append("client_reference_id", refCommand)
    
    params.append("line_items[0][price_data][currency]", "eur")
    params.append("line_items[0][price_data][unit_amount]", priceInEurCents.toString())
    params.append("line_items[0][price_data][product_data][name]", `Inscription ${courseTitle} - Le Guide IA`)
    params.append("line_items[0][price_data][product_data][tax_code]", "txcd_10000000")
    params.append("line_items[0][quantity]", "1")
    params.append("managed_payments[enabled]", "false")

    params.append("metadata[fullName]", fullName)
    params.append("metadata[email]", email.toLowerCase())
    params.append("metadata[whatsapp]", whatsapp)
    params.append("metadata[country]", country)
    params.append("metadata[courseSlug]", courseSlug)
    params.append("metadata[paymentId]", payment?.id || "")

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
