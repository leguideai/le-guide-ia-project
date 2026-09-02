import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { 
  DEFAULT_SUBSCRIPTION_PRICING, 
  SubscriptionItem, 
  calculateSubscriptionExpiry,
  getDaysRemaining,
  formatPriceFCFA
} from "@/lib/subscriptions"
import { 
  sendAdminNewSubscriptionNotification, 
  sendSubscriptionPendingEmail, 
  sendSubscriptionActivatedEmail 
} from "@/lib/email"

export const dynamic = "force-dynamic"

// Helper: load all subscriptions from site_settings mirror
async function loadSubscriptionsFromSettings(): Promise<SubscriptionItem[]> {
  try {
    const { data } = await supabaseServer
      .from("site_settings")
      .select("value")
      .eq("key", "subscriptions")
      .maybeSingle()
    if (data?.value) {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

// Helper: load dynamic subscription pricing from site_settings
async function loadSubscriptionPricing() {
  try {
    const { data: rows } = await supabaseServer
      .from("site_settings")
      .select("key, value")
      .in("key", ["subscription_price_3m", "subscription_price_1y"])

    let p3m = DEFAULT_SUBSCRIPTION_PRICING.price3m
    let p1y = DEFAULT_SUBSCRIPTION_PRICING.price1y

    rows?.forEach(r => {
      const v = typeof r.value === "number" ? r.value : parseInt(String(r.value).replace(/\D/g, ""), 10)
      if (r.key === "subscription_price_3m" && !isNaN(v) && v > 0) p3m = v
      if (r.key === "subscription_price_1y" && !isNaN(v) && v > 0) p1y = v
    })

    return {
      price3m: p3m,
      price1y: p1y,
      price3mDisplay: formatPriceFCFA(p3m),
      price1yDisplay: formatPriceFCFA(p1y)
    }
  } catch (_) {
    return DEFAULT_SUBSCRIPTION_PRICING
  }
}

// GET: Check User Subscription Status & Pricing
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = (searchParams.get("email") || "").toLowerCase().trim()

    const pricing = await loadSubscriptionPricing()

    if (!email) {
      return NextResponse.json({
        isSubscribed: false,
        status: "none",
        pricing
      })
    }

    // 1. Vérifier dans la table 'subscriptions'
    const { data: dbSub } = await supabaseServer
      .from("subscriptions")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Fallback: vérifier dans site_settings mirror
    const allSettingsSubs = await loadSubscriptionsFromSettings()
    const mirrorSub = allSettingsSubs.find(s => s.email.toLowerCase() === email)

    // Vérifier si une inscription VIP payée existe dans 'registrations'
    const { data: vipReg } = await supabaseServer
      .from("registrations")
      .select("*")
      .ilike("email", email)
      .eq("course_slug", "subscription-vip")
      .in("status", ["paye", "confirmed", "active"])
      .maybeSingle()

    // Priorité à l'enregistrement actif le plus probant
    let activeSub: SubscriptionItem | null = null
    if (dbSub?.status === "active") {
      activeSub = dbSub
    } else if (mirrorSub?.status === "active") {
      activeSub = mirrorSub
    } else if (vipReg) {
      activeSub = {
        id: vipReg.id,
        email: email,
        full_name: vipReg.full_name || "Membre VIP",
        plan: "3_months",
        plan_label: "Pass Trimestriel (3 Mois)",
        amount: 10000,
        currency: "XOF",
        status: "active",
        payment_method: "Mobile Money",
        transaction_ref: "VIP-VALIDATED",
        starts_at: vipReg.created_at || new Date().toISOString(),
        expires_at: calculateSubscriptionExpiry("3_months", new Date(vipReg.created_at || Date.now())).toISOString(),
        created_at: vipReg.created_at || new Date().toISOString()
      }
    } else {
      activeSub = dbSub || mirrorSub || null
    }

    if (activeSub) {
      const expiresAtDate = new Date(activeSub.expires_at)
      const now = new Date()
      const isExpired = expiresAtDate.getTime() < now.getTime()
      const daysRemaining = getDaysRemaining(activeSub.expires_at)

      const effectiveStatus = (activeSub.status === "active" && isExpired) ? "expired" : activeSub.status

      return NextResponse.json({
        isSubscribed: effectiveStatus === "active",
        status: effectiveStatus,
        plan: activeSub.plan,
        planLabel: activeSub.plan_label,
        amount: activeSub.amount,
        paymentMethod: activeSub.payment_method,
        transactionRef: activeSub.transaction_ref,
        startsAt: activeSub.starts_at,
        expiresAt: activeSub.expires_at,
        daysRemaining: effectiveStatus === "active" ? daysRemaining : 0,
        pricing
      })
    }

    return NextResponse.json({
      isSubscribed: false,
      status: "none",
      daysRemaining: 0,
      pricing
    })
  } catch (error: any) {
    console.error("Subscription GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create or Renew a Subscription
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email,
      fullName,
      whatsapp,
      country = "CI",
      plan = "3_months",
      paymentMethod = "wave",
      transactionRef = "",
      receiptUrl = ""
    } = body

    if (!email || !fullName) {
      return NextResponse.json({ error: "Nom complet et adresse email requis." }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const pricing = await loadSubscriptionPricing()

    const selectedPrice = plan === "1_year" ? pricing.price1y : pricing.price3m
    const planLabel = plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)"

    // Vérifier si l'utilisateur possède déjà un abonnement actif pour cumuler/prolonger sans perte de jours
    let baseDate = new Date()
    try {
      const { data: activeRows } = await supabaseServer
        .from("subscriptions")
        .select("expires_at")
        .ilike("email", emailClean)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1)

      const activeExpiry = activeRows?.[0]?.expires_at
      if (activeExpiry && new Date(activeExpiry).getTime() > Date.now()) {
        baseDate = new Date(activeExpiry)
      }
    } catch (_) {}

    const startsAt = new Date().toISOString()
    const expiresAt = calculateSubscriptionExpiry(plan, baseDate).toISOString()
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const isStripe = paymentMethod.toLowerCase().includes("stripe")
    const isAutoActivated = false // Will be activated via Stripe webhook / success verification

    const refCommand = isStripe ? `LGI-STRIPE-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}` : (transactionRef.trim() || `SUB-${Date.now().toString().slice(-6)}`)

    const newSub: SubscriptionItem = {
      id: subId,
      email: emailClean,
      full_name: fullName.trim(),
      whatsapp: whatsapp || null,
      country: country || "CI",
      plan: plan,
      plan_label: planLabel,
      planLabel: planLabel,
      amount: selectedPrice,
      currency: "XOF",
      status: "pending",
      payment_method: isStripe ? "Stripe (Carte Bancaire)" : paymentMethod,
      transaction_ref: refCommand,
      receipt_url: receiptUrl || null,
      starts_at: startsAt,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      notes: {
        registered_via: isStripe ? "stripe_checkout" : "web_checkout",
        plan: plan,
        initiated_at: startsAt
      }
    }

    // 1. Sauvegarder dans 'subscriptions' table
    try {
      await supabaseServer.from("subscriptions").insert({
        id: subId,
        email: emailClean,
        full_name: fullName.trim(),
        whatsapp: whatsapp || null,
        country: country || "CI",
        plan: plan,
        plan_label: planLabel,
        amount: selectedPrice,
        currency: "XOF",
        status: newSub.status,
        payment_method: newSub.payment_method,
        transaction_ref: newSub.transaction_ref,
        receipt_url: receiptUrl || null,
        starts_at: startsAt,
        expires_at: expiresAt,
        created_at: newSub.created_at,
        notes: JSON.stringify(newSub.notes)
      })
    } catch (dbErr) {
      console.warn("subscriptions table insert note:", dbErr)
    }

    // 2. Sauvegarder dans le miroir site_settings.subscriptions
    try {
      const existingSubs = await loadSubscriptionsFromSettings()
      const updated = [newSub, ...existingSubs.filter(s => s.id !== subId)]
      await supabaseServer.from("site_settings").upsert({
        key: "subscriptions",
        value: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      }, { onConflict: "key" })
    } catch (setErr) {
      console.warn("site_settings subscriptions mirror note:", setErr)
    }

    // Subscriptions are stored directly in 'subscriptions' table and 'site_settings' mirror (managed exclusively in Abonnements VIP tab)

    // 4. Si Stripe : Générer la session Stripe Checkout officielle et retourner l'URL de redirection
    if (isStripe) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://leguideai.com")

      if (!stripeSecretKey) {
        console.warn("Stripe Secret Key not configured. Simulating Stripe redirect URL.")
        return NextResponse.json({
          success: true,
          url: `${baseUrl}/checkout/success?ref=${refCommand}&simulated=true&type=subscription`,
          ref: refCommand,
        })
      }

      // Conversion FCFA -> EUR en centimes pour Stripe (min 50 centimes)
      const rawCents = Math.round((selectedPrice / 655.957) * 100)
      const priceInEurCents = Math.max(50, rawCents)

      const params = new URLSearchParams()
      params.append("mode", "payment")
      params.append("success_url", `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${refCommand}&type=subscription`)
      params.append("cancel_url", `${baseUrl}/dashboard?tab=resources`)
      params.append("customer_email", emailClean)
      params.append("client_reference_id", refCommand)

      params.append("line_items[0][price_data][currency]", "eur")
      params.append("line_items[0][price_data][unit_amount]", priceInEurCents.toString())
      params.append("line_items[0][price_data][product_data][name]", `Pass VIP — ${planLabel} (Le Guide IA)`)
      params.append("line_items[0][price_data][product_data][description]", `${selectedPrice.toLocaleString("fr-FR")} FCFA — Accès complet à tous les prompts et replays`)
      params.append("line_items[0][price_data][product_data][tax_code]", "txcd_10000000")
      params.append("line_items[0][quantity]", "1")
      params.append("managed_payments[enabled]", "false")

      params.append("metadata[type]", "subscription")
      params.append("metadata[subscriptionId]", subId)
      params.append("metadata[plan]", plan)
      params.append("metadata[planLabel]", planLabel)
      params.append("metadata[fullName]", fullName.trim())
      params.append("metadata[email]", emailClean)
      params.append("metadata[whatsapp]", whatsapp || "")
      params.append("metadata[country]", country || "")
      params.append("metadata[courseSlug]", "subscription-vip")
      params.append("metadata[courseTitle]", `Pass VIP — ${planLabel}`)
      params.append("metadata[price]", String(selectedPrice))
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
        return NextResponse.json({
          success: true,
          url: stripeData.url,
          ref: refCommand,
          subscription: newSub
        })
      }

      return NextResponse.json({
        error: stripeData.error?.message || "Erreur de communication avec Stripe."
      }, { status: 500 })
    }

    // 4. Notifications emails
    // A. Notification à Alfred Dah
    await sendAdminNewSubscriptionNotification({
      fullName: fullName.trim(),
      email: emailClean,
      whatsapp: whatsapp || undefined,
      country: country || undefined,
      planLabel: planLabel,
      amount: selectedPrice,
      paymentMethod: paymentMethod,
      transactionRef: newSub.transaction_ref,
      receiptUrl: receiptUrl || undefined,
      isAutoActivated
    })

    // B. Email à l'apprenant
    if (isAutoActivated) {
      await sendSubscriptionActivatedEmail(fullName.trim(), emailClean, planLabel, expiresAt)
    } else {
      await sendSubscriptionPendingEmail(fullName.trim(), emailClean, planLabel, selectedPrice, paymentMethod)
    }

    return NextResponse.json({
      success: true,
      subscription: newSub,
      message: isAutoActivated
        ? "🎉 Votre abonnement VIP est activé avec succès !"
        : "⏳ Votre demande d'abonnement a bien été enregistrée. Elle sera validée très rapidement par notre équipe."
    })
  } catch (error: any) {
    console.error("Subscription POST error:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la souscription." }, { status: 500 })
  }
}
