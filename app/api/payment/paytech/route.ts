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

    const apiKey = process.env.PAYTECH_API_KEY
    const apiSecret = process.env.PAYTECH_API_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://leguideai.com"

    if (!apiKey || !apiSecret) {
      console.warn("PayTech API keys not configured. Simulating PayTech redirect URL.")
      return NextResponse.json({
        redirectUrl: `${baseUrl}/checkout/success?ref=${refCommand}&simulated=true`,
        ref: refCommand,
      })
    }

    const paytechRes = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        API_KEY: apiKey,
        API_SECRET: apiSecret,
      },
      body: JSON.stringify({
        item_name: courseTitle,
        item_price: price,
        currency: "XOF",
        ref_command: refCommand,
        command_name: `Inscription ${courseTitle} - Le Guide IA`,
        ipn_url: `${baseUrl}/api/webhooks/paytech`,
        success_url: `${baseUrl}/checkout/success?ref=${refCommand}`,
        cancel_url: `${baseUrl}/checkout/${courseSlug}`,
        custom_field: JSON.stringify({
          fullName,
          email: email.toLowerCase(),
          whatsapp,
          country,
          courseSlug,
          paymentId: payment?.id,
        }),
      }),
    })

    const paytechData = await paytechRes.json()

    if (paytechData.success === 1 && paytechData.redirect_url) {
      return NextResponse.json({ redirectUrl: paytechData.redirect_url, ref: refCommand })
    }

    return NextResponse.json({
      message: paytechData.message || "Erreur de communication avec le serveur PayTech.",
    }, { status: 500 })

  } catch (error: any) {
    console.error("PayTech payment initialization error:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur." }, { status: 500 })
  }
}
