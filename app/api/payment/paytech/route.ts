import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { courseSlug, courseTitle, price, fullName, email, whatsapp, country } = await req.json()

    if (!email || !fullName || !courseSlug || !price) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 })
    }

    const refCommand = `LGI-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const { data: registration } = await supabaseServer
      .from("registrations")
      .upsert({
        full_name: fullName,
        email: email.toLowerCase(),
        whatsapp,
        country,
        source: "checkout_paytech",
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
        method: "paytech",
        status: "pending",
        transaction_ref: refCommand,
      })
      .select("id")
      .single()

    const apiKey = process.env.PAYTECH_API_KEY?.trim()
    const apiSecret = process.env.PAYTECH_API_SECRET?.trim()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

    if (!apiKey || !apiSecret) {
      console.warn("PayTech API keys not configured. Simulating PayTech redirect URL.")
      return NextResponse.json({
        redirectUrl: `${baseUrl}/checkout/success?ref=${refCommand}&simulated=true`,
        ref: refCommand,
      })
    }

    const paytechEnv = process.env.PAYTECH_ENV?.trim() || "test"

    const ipnUrl = baseUrl.startsWith("https://")
      ? `${baseUrl}/api/webhooks/paytech`
      : "https://leguideai.com/api/webhooks/paytech"

    const createPaytechRequest = (envMode: string) => JSON.stringify({
      item_name: courseTitle,
      item_price: price,
      currency: "XOF",
      ref_command: refCommand,
      command_name: `Inscription ${courseTitle} - Le Guide IA`,
      env: envMode,
      ipn_url: ipnUrl,
      success_url: `${baseUrl}/checkout/success?ref=${refCommand}`,
      cancel_url: `${baseUrl}/checkout/${courseSlug}`,
      api_key: apiKey,
      api_secret: apiSecret,
      custom_field: JSON.stringify({
        fullName,
        email: email.toLowerCase(),
        whatsapp,
        country,
        courseSlug,
        paymentId: payment?.id,
      }),
    })

    const requestHeaders = {
      "Content-Type": "application/json",
      API_KEY: apiKey,
      API_SECRET: apiSecret,
      api_key: apiKey,
      api_secret: apiSecret,
    }

    let paytechRes = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: requestHeaders,
      body: createPaytechRequest(paytechEnv),
    })

    let paytechData = await paytechRes.json()
    console.log(`PayTech API Raw Response (env: ${paytechEnv}):`, paytechData)

    // Fallback attempt with alternate env mode if vendor/key validation fails
    if (paytechData.success === -1 && (paytechData.message?.includes("vendeur") || paytechData.message?.includes("cle"))) {
      const fallbackEnv = paytechEnv === "prod" ? "test" : "prod"
      console.log(`Retrying PayTech API with fallback env: ${fallbackEnv}`)

      paytechRes = await fetch("https://paytech.sn/api/payment/request-payment", {
        method: "POST",
        headers: requestHeaders,
        body: createPaytechRequest(fallbackEnv),
      })
      paytechData = await paytechRes.json()
      console.log(`PayTech API Raw Response (fallback env: ${fallbackEnv}):`, paytechData)
    }

    const redirectUrl = paytechData.redirect_url || paytechData.redirectUrl || paytechData.url
    if (redirectUrl) {
      return NextResponse.json({ redirectUrl, ref: refCommand })
    }

    const errMsg = typeof paytechData.message === "string"
      ? paytechData.message
      : (typeof paytechData.error === "string" ? paytechData.error : JSON.stringify(paytechData))

    return NextResponse.json({
      message: errMsg || "Erreur de communication avec le serveur PayTech.",
    }, { status: 500 })

  } catch (error: any) {
    console.error("PayTech payment initialization error:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur." }, { status: 500 })
  }
}
