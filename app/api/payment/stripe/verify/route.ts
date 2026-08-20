import { NextResponse } from "next/server"
import { fulfillStripeCheckout } from "@/lib/stripe-fulfillment"

export async function POST(req: Request) {
  try {
    const { sessionId, ref } = await req.json()

    if (!sessionId && !ref) {
      return NextResponse.json({ error: "Identifiant de session manquant." }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ simulated: true, success: true })
    }

    if (sessionId && sessionId.startsWith("cs_")) {
      const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      })

      if (!stripeRes.ok) {
        return NextResponse.json({ error: "Session Stripe introuvable." }, { status: 404 })
      }

      const session = await stripeRes.json()

      if (session.payment_status === "paid" || session.status === "complete") {
        const result: any = await fulfillStripeCheckout(session)
        return NextResponse.json({
          success: true,
          status: "confirmed",
          courseTitle: result?.courseTitle,
          email: result?.email
        })
      } else {
        return NextResponse.json({
          success: false,
          status: session.payment_status,
          message: "Le paiement n'a pas encore été validé par Stripe."
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Stripe verification error:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 })
  }
}
