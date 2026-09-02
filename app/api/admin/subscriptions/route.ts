import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { 
  DEFAULT_SUBSCRIPTION_PRICING, 
  SubscriptionItem, 
  calculateSubscriptionExpiry,
  getDaysRemaining,
  formatPriceFCFA
} from "@/lib/subscriptions"
import { sendSubscriptionActivatedEmail } from "@/lib/email"

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

// Helper: save all subscriptions to site_settings mirror
async function saveSubscriptionsToSettings(subs: SubscriptionItem[]) {
  try {
    await supabaseServer.from("site_settings").upsert({
      key: "subscriptions",
      value: JSON.stringify(subs),
      updated_at: new Date().toISOString()
    }, { onConflict: "key" })
  } catch (err) {
    console.warn("Error syncing subscriptions to site_settings:", err)
  }
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

// GET: List all Subscriptions & Admin Stats
export async function GET() {
  try {
    const pricing = await loadSubscriptionPricing()

    // 1. Lire depuis la table 'subscriptions'
    const { data: dbSubs } = await supabaseServer
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })

    const mirrorSubs = await loadSubscriptionsFromSettings()

    // Fusionner intelligemment par ID ou email
    const subsMap = new Map<string, SubscriptionItem>()

    // Priorité à la base de données
    dbSubs?.forEach((s: any) => {
      const parsedNotes = typeof s.notes === "string" ? (() => { try { return JSON.parse(s.notes) } catch (_) { return {} } })() : (s.notes || {})
      subsMap.set(s.id, {
        id: s.id,
        user_id: s.user_id,
        email: s.email,
        full_name: s.full_name,
        whatsapp: s.whatsapp,
        country: s.country,
        plan: s.plan,
        plan_label: s.plan_label || (s.plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)"),
        amount: s.amount || (s.plan === "1_year" ? pricing.price1y : pricing.price3m),
        currency: s.currency || "XOF",
        status: s.status || "pending",
        payment_method: s.payment_method || "Mobile Money",
        transaction_ref: s.transaction_ref || "-",
        receipt_url: s.receipt_url,
        starts_at: s.starts_at || s.created_at,
        expires_at: s.expires_at || calculateSubscriptionExpiry(s.plan, new Date(s.created_at)).toISOString(),
        created_at: s.created_at,
        notes: parsedNotes
      })
    })

    // Compléter et synchroniser avec le miroir (si le miroir a validé en actif)
    mirrorSubs.forEach((s) => {
      if (!subsMap.has(s.id)) {
        subsMap.set(s.id, s)
      } else {
        const existing = subsMap.get(s.id)!
        if (s.status === "active" && existing.status !== "active") {
          subsMap.set(s.id, {
            ...existing,
            status: "active",
            starts_at: s.starts_at || existing.starts_at,
            expires_at: s.expires_at || existing.expires_at
          })
        }
      }
    })

    const allSubs = Array.from(subsMap.values()).map(s => {
      const days = getDaysRemaining(s.expires_at)
      const isExpired = new Date(s.expires_at).getTime() < Date.now()
      const effectiveStatus = (s.status === "active" && isExpired) ? "expired" : s.status
      return {
        ...s,
        status: effectiveStatus,
        days_remaining: effectiveStatus === "active" ? days : 0
      }
    })

    // Tri chronologique
    allSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calcul des statistiques KPI
    const totalActive = allSubs.filter(s => s.status === "active").length
    const totalPending = allSubs.filter(s => s.status === "pending").length
    const totalExpired = allSubs.filter(s => s.status === "expired").length
    const totalRevenue = allSubs
      .filter(s => s.status === "active")
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0)

    return NextResponse.json({
      success: true,
      subscriptions: allSubs,
      stats: {
        totalActive,
        totalPending,
        totalExpired,
        totalRevenue,
        totalRevenueFormatted: formatPriceFCFA(totalRevenue)
      },
      pricing
    })
  } catch (error: any) {
    console.error("Admin subscriptions GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Admin Actions (Validate, Reject, Prolong, Create Manual, Update Pricing)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    // Action 1: Mettre à jour les prix des abonnements dans site_settings
    if (action === "update_pricing") {
      const { price3m, price1y } = body
      const p3m = parseInt(String(price3m).replace(/\D/g, ""), 10) || DEFAULT_SUBSCRIPTION_PRICING.price3m
      const p1y = parseInt(String(price1y).replace(/\D/g, ""), 10) || DEFAULT_SUBSCRIPTION_PRICING.price1y

      await supabaseServer.from("site_settings").upsert([
        { key: "subscription_price_3m", value: p3m, updated_at: new Date().toISOString() },
        { key: "subscription_price_1y", value: p1y, updated_at: new Date().toISOString() }
      ], { onConflict: "key" })

      return NextResponse.json({
        success: true,
        message: "Prix des abonnements mis à jour avec succès !",
        pricing: {
          price3m: p3m,
          price1y: p1y,
          price3mDisplay: formatPriceFCFA(p3m),
          price1yDisplay: formatPriceFCFA(p1y)
        }
      })
    }

    // Action 2: Valider un abonnement (Mobile Money)
    if (action === "validate_subscription") {
      const { subscriptionId } = body
      if (!subscriptionId) {
        return NextResponse.json({ error: "ID d'abonnement requis." }, { status: 400 })
      }

      const existingSubs = await loadSubscriptionsFromSettings()
      let targetSub = existingSubs.find(s => s.id === subscriptionId)

      // Chercher aussi en DB si non trouvé dans le miroir
      if (!targetSub) {
        const { data: dbItem } = await supabaseServer
          .from("subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .maybeSingle()
        if (dbItem) targetSub = dbItem
      }

      // Si toujours introuvable par ID, chercher par email si possible
      if (!targetSub && body.email) {
        const { data: dbItemByEmail } = await supabaseServer
          .from("subscriptions")
          .select("*")
          .ilike("email", body.email.toLowerCase().trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        if (dbItemByEmail) targetSub = dbItemByEmail
      }

      if (!targetSub) {
        return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 })
      }

      const startsAt = new Date().toISOString()
      const expiresAt = calculateSubscriptionExpiry(targetSub.plan, new Date()).toISOString()
      const cleanEmail = (targetSub.email || "").toLowerCase().trim()

      // 1. Mettre à jour en DB 'subscriptions'
      try {
        await supabaseServer.from("subscriptions").update({
          status: "active",
          starts_at: startsAt,
          expires_at: expiresAt
        }).eq("id", targetSub.id || subscriptionId)

        if (cleanEmail) {
          await supabaseServer.from("subscriptions").update({
            status: "active",
            starts_at: startsAt,
            expires_at: expiresAt
          }).ilike("email", cleanEmail)
        }
      } catch (dbErr) {
        console.warn("subscriptions table update note:", dbErr)
      }

      // 2. Mettre à jour dans le miroir site_settings.subscriptions
      const updatedSub: SubscriptionItem = {
        ...targetSub,
        id: targetSub.id || subscriptionId,
        status: "active",
        starts_at: startsAt,
        expires_at: expiresAt
      }

      let updatedList = existingSubs.map(s => (s.id === subscriptionId || (cleanEmail && s.email.toLowerCase() === cleanEmail)) ? updatedSub : s)
      if (!existingSubs.some(s => s.id === subscriptionId || (cleanEmail && s.email.toLowerCase() === cleanEmail))) {
        updatedList.unshift(updatedSub)
      }
      await saveSubscriptionsToSettings(updatedList)

      // 3. Mettre à jour dans la table 'registrations'
      if (cleanEmail) {
        try {
          await supabaseServer.from("registrations").update({
            status: "paye"
          }).ilike("email", cleanEmail).eq("course_slug", "subscription-vip")
        } catch (_) {}
      }

      // 4. Mettre à jour dans la table 'payments'
      try {
        if (targetSub.transaction_ref) {
          await supabaseServer.from("payments").update({
            status: "confirmed"
          }).eq("transaction_ref", targetSub.transaction_ref)
        }
      } catch (_) {}

      // 5. Envoyer email d'activation à l'apprenant (fail-safe dans try/catch)
      try {
        await sendSubscriptionActivatedEmail(
          targetSub.full_name || "Apprenant VIP",
          targetSub.email,
          targetSub.plan_label || (targetSub.plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)"),
          expiresAt
        )
      } catch (emailErr) {
        console.warn("sendSubscriptionActivatedEmail notice:", emailErr)
      }

      return NextResponse.json({
        success: true,
        message: `Abonnement de ${targetSub.full_name || cleanEmail} validé avec succès !`,
        expiresAt
      })
    }

    // Action 3: Prolonger un abonnement (+X jours)
    if (action === "prolong_subscription") {
      const { subscriptionId, extraDays = 30 } = body
      const existingSubs = await loadSubscriptionsFromSettings()
      let targetSub = existingSubs.find(s => s.id === subscriptionId)

      if (!targetSub) {
        const { data: dbItem } = await supabaseServer
          .from("subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .maybeSingle()
        if (dbItem) targetSub = dbItem
      }

      if (!targetSub) {
        return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 })
      }

      const currentExpiry = new Date(targetSub.expires_at || Date.now())
      const baseDate = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date()
      baseDate.setDate(baseDate.getDate() + Number(extraDays))
      const newExpiresAt = baseDate.toISOString()
      const cleanEmail = (targetSub.email || "").toLowerCase().trim()

      try {
        await supabaseServer.from("subscriptions").update({
          status: "active",
          expires_at: newExpiresAt
        }).eq("id", targetSub.id || subscriptionId)

        if (cleanEmail) {
          await supabaseServer.from("subscriptions").update({
            status: "active",
            expires_at: newExpiresAt
          }).ilike("email", cleanEmail)
        }
      } catch (_) {}

      const updatedSub: SubscriptionItem = {
        ...targetSub,
        id: targetSub.id || subscriptionId,
        status: "active",
        expires_at: newExpiresAt
      }

      let updatedList = existingSubs.map(s => (s.id === subscriptionId || (cleanEmail && s.email.toLowerCase() === cleanEmail)) ? updatedSub : s)
      if (!existingSubs.some(s => s.id === subscriptionId || (cleanEmail && s.email.toLowerCase() === cleanEmail))) {
        updatedList.unshift(updatedSub)
      }
      await saveSubscriptionsToSettings(updatedList)

      return NextResponse.json({
        success: true,
        message: `Abonnement prolongé de ${extraDays} jours (jusqu'au ${new Date(newExpiresAt).toLocaleDateString("fr-FR")}).`,
        expiresAt: newExpiresAt
      })
    }

    // Action 4: Rejeter ou Annuler un abonnement
    if (action === "cancel_subscription" || action === "reject_subscription") {
      const { subscriptionId } = body
      const existingSubs = await loadSubscriptionsFromSettings()
      let targetSub = existingSubs.find(s => s.id === subscriptionId)

      if (!targetSub) {
        const { data: dbItem } = await supabaseServer
          .from("subscriptions")
          .select("*")
          .eq("id", subscriptionId)
          .maybeSingle()
        if (dbItem) targetSub = dbItem
      }

      const cleanEmail = targetSub?.email ? targetSub.email.toLowerCase().trim() : ""

      try {
        await supabaseServer.from("subscriptions").update({
          status: "cancelled"
        }).eq("id", subscriptionId)

        if (cleanEmail) {
          await supabaseServer.from("subscriptions").update({
            status: "cancelled"
          }).ilike("email", cleanEmail)
        }
      } catch (_) {}

      const updatedList = existingSubs.map(s => (s.id === subscriptionId || (cleanEmail && s.email.toLowerCase() === cleanEmail)) ? { ...s, status: "cancelled" as const } : s)
      await saveSubscriptionsToSettings(updatedList)

      return NextResponse.json({
        success: true,
        message: "Abonnement annulé avec succès."
      })
    }

    // Action 5: Créer un abonnement manuel (offert ou encaissé hors plateforme)
    if (action === "create_manual_subscription") {
      const { email, fullName, whatsapp, country, plan = "3_months", customDays } = body
      if (!email || !fullName) {
        return NextResponse.json({ error: "Email et Nom requis." }, { status: 400 })
      }

      const emailClean = email.toLowerCase().trim()
      const pricing = await loadSubscriptionPricing()
      const selectedPrice = plan === "1_year" ? pricing.price1y : pricing.price3m
      const planLabel = plan === "1_year" ? "Pass Annuel (1 An)" : "Pass Trimestriel (3 Mois)"

      const startsAt = new Date().toISOString()
      let expiresAt: string
      if (customDays && Number(customDays) > 0) {
        const exp = new Date()
        exp.setDate(exp.getDate() + Number(customDays))
        expiresAt = exp.toISOString()
      } else {
        expiresAt = calculateSubscriptionExpiry(plan).toISOString()
      }

      const subId = `sub_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const newSub: SubscriptionItem = {
        id: subId,
        email: emailClean,
        full_name: fullName.trim(),
        whatsapp: whatsapp || null,
        country: country || "CI",
        plan,
        plan_label: planLabel,
        amount: selectedPrice,
        currency: "XOF",
        status: "active",
        payment_method: "Admin Manuel (Offert/Espèces)",
        transaction_ref: `ADM-${Date.now().toString().slice(-6)}`,
        starts_at: startsAt,
        expires_at: expiresAt,
        created_at: startsAt
      }

      try {
        await supabaseServer.from("subscriptions").insert(newSub)
      } catch (_) {}

      const existingSubs = await loadSubscriptionsFromSettings()
      await saveSubscriptionsToSettings([newSub, ...existingSubs])

      // Envoyer email d'activation
      await sendSubscriptionActivatedEmail(fullName.trim(), emailClean, planLabel, expiresAt)

      return NextResponse.json({
        success: true,
        message: `Abonnement actif créé avec succès pour ${fullName} !`,
        subscription: newSub
      })
    }

    // Action 6: Supprimer un enregistrement
    if (action === "delete_subscription") {
      const { subscriptionId } = body
      try {
        await supabaseServer.from("subscriptions").delete().eq("id", subscriptionId)
      } catch (_) {}

      const existingSubs = await loadSubscriptionsFromSettings()
      const updatedList = existingSubs.filter(s => s.id !== subscriptionId)
      await saveSubscriptionsToSettings(updatedList)

      return NextResponse.json({
        success: true,
        message: "Enregistrement d'abonnement supprimé."
      })
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
  } catch (error: any) {
    console.error("Admin subscriptions POST error:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur." }, { status: 500 })
  }
}
