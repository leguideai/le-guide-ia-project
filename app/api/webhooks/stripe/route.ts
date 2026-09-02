import { NextResponse } from "next/server"
import { fulfillStripeCheckout } from "@/lib/stripe-fulfillment"

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const event = JSON.parse(payload)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      await fulfillStripeCheckout(session)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
