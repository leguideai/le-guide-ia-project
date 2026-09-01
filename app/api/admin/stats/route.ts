import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 1. Fetch all data in parallel
    const [
      { data: payments, error: payErr },
      { data: registrations, error: regErr },
      { data: dbSubs, error: subDbErr },
      { data: settingsData },
      { data: profiles, error: profErr },
      { data: b2bRequests, error: b2bErr },
      { data: submissions, error: subErr },
      { data: courses }
    ] = await Promise.all([
      supabaseServer.from("payments").select("*"),
      supabaseServer.from("registrations").select("*"),
      supabaseServer.from("subscriptions").select("*"),
      supabaseServer.from("site_settings").select("value").eq("key", "subscriptions").maybeSingle(),
      supabaseServer.from("profiles").select("id, role"),
      supabaseServer.from("service_requests").select("id, status"),
      supabaseServer.from("submissions").select("id, status"),
      supabaseServer.from("courses").select("id, slug, title, price")
    ])

    if (payErr) console.warn("Admin stats payments fetch warn:", payErr.message)
    if (regErr) console.warn("Admin stats registrations fetch warn:", regErr.message)
    if (subDbErr) console.warn("Admin stats subscriptions fetch warn:", subDbErr.message)
    if (profErr) console.warn("Admin stats profiles fetch warn:", profErr.message)
    if (b2bErr) console.warn("Admin stats B2B fetch warn:", b2bErr.message)
    if (subErr) console.warn("Admin stats submissions fetch warn:", subErr.message)

    // 2. Fetch courses for price lookup
    const coursePriceMap = new Map<string, number>()
    courses?.forEach(c => {
      const priceNum = parseInt(String(c.price || "99000").replace(/\D/g, "")) || 99000
      if (c.id) coursePriceMap.set(c.id, priceNum)
      if (c.slug) coursePriceMap.set(c.slug, priceNum)
      if (c.title) coursePriceMap.set(c.title.toLowerCase().trim(), priceNum)
    })

    // Track processed transaction refs and registration IDs to prevent any duplicate accounting
    const processedTransactionRefs = new Set<string>()
    const processedRegistrationIds = new Set<string>()

    let bootcampRevenue = 0
    let subscriptionRevenue = 0

    // Helper: is this a subscription payment?
    const isSubscriptionPayment = (p: any) => {
      const ref = String(p.transaction_ref || "").toUpperCase().trim()
      const title = String(p.course_title || "").toLowerCase().trim()
      return (
        ref.includes("STRIPE-SUB") ||
        ref.includes("SUB-") ||
        ref.startsWith("SUB") ||
        title.includes("abonnement") ||
        title.includes("pass vip") ||
        title.includes("ressource") ||
        title.includes("replay") ||
        (!title.includes("bootcamp") && !title.includes("pro") && (p.amount === 10000 || p.amount === 15000 || p.amount === 30000))
      )
    }

    // A. CALCULATE REVENUE FROM VALIDATED BOOTCAMP PAYMENTS (payments table)
    const confirmedPayments = (payments || []).filter(p => {
      const s = String(p.status || "").toLowerCase().trim()
      return s === "confirmed" || s === "success" || s === "paye" || s === "completed" || s === "valide" || s === "validé" || s === "active"
    })

    confirmedPayments.forEach(p => {
      const ref = String(p.transaction_ref || "").toUpperCase().trim()
      const isSub = isSubscriptionPayment(p)

      if (isSub) {
        if (ref && !processedTransactionRefs.has(ref)) {
          processedTransactionRefs.add(ref)
          const amt = Number(p.amount) || (String(p.course_title || "").toLowerCase().includes("1 an") ? 30000 : 10000)
          subscriptionRevenue += amt
        }
      } else {
        if (p.registration_id) processedRegistrationIds.add(p.registration_id)
        if (ref) processedTransactionRefs.add(ref)
        
        let amt = Number(p.amount)
        if (!amt || isNaN(amt) || amt <= 0) {
          amt = (p.course_id && coursePriceMap.get(p.course_id)) || (p.course_title && coursePriceMap.get(p.course_title.toLowerCase().trim())) || 99000
        }
        bootcampRevenue += amt
      }
    })

    // B. CALCULATE REVENUE FROM PAID BOOTCAMP REGISTRATIONS (not already added via payments)
    const isSubscriptionRegistration = (r: any) => {
      const src = String(r.source || "").toLowerCase().trim()
      const slug = String(r.course_slug || "").toLowerCase().trim()
      return src.includes("subscription") || slug.includes("subscription") || slug === "subscription-vip"
    }

    const paidRegistrations = (registrations || []).filter(r => {
      const s = String(r.status || "").toLowerCase().trim()
      const src = String(r.source || "").toLowerCase().trim()
      return !isSubscriptionRegistration(r) && (s === "paye" || s === "paid" || s === "confirmed" || s === "valide" || s === "validé" || s === "active" || src === "admin_manual_enroll")
    })

    paidRegistrations.forEach(r => {
      if (!processedRegistrationIds.has(r.id)) {
        processedRegistrationIds.add(r.id)
        let notesRef = ""
        try {
          if (typeof r.notes === "string" && r.notes.startsWith("{")) {
            const parsed = JSON.parse(r.notes)
            notesRef = (parsed.ref || parsed.transaction_ref || "").toUpperCase().trim()
          }
        } catch (_) {}

        if (!notesRef || !processedTransactionRefs.has(notesRef)) {
          if (notesRef) processedTransactionRefs.add(notesRef)
          const amt = (r.course_id && coursePriceMap.get(r.course_id)) || (r.course_slug && coursePriceMap.get(r.course_slug)) || 99000
          bootcampRevenue += amt
        }
      }
    })

    // C. CALCULATE REVENUE FROM VALIDATED VIP SUBSCRIPTIONS (subscriptions table & site_settings mirror)
    const mirrorSubs: any[] = []
    try {
      if (settingsData?.value) {
        const parsed = typeof settingsData.value === "string" ? JSON.parse(settingsData.value) : settingsData.value
        if (Array.isArray(parsed)) mirrorSubs.push(...parsed)
      }
    } catch (_) {}

    const allSubsMap = new Map<string, any>()
    dbSubs?.forEach((s: any) => {
      allSubsMap.set(s.id, s)
    })

    mirrorSubs.forEach((s: any) => {
      if (!allSubsMap.has(s.id)) {
        allSubsMap.set(s.id, s)
      } else {
        const existing = allSubsMap.get(s.id)!
        if (s.status === "active" && existing.status !== "active") {
          allSubsMap.set(s.id, { ...existing, status: "active" })
        }
      }
    })

    const allValidatedSubs = Array.from(allSubsMap.values()).filter((s: any) => {
      const st = String(s.status || "").toLowerCase().trim()
      return st === "active" || st === "confirmed" || st === "paye" || st === "valide" || st === "validé"
    })

    allValidatedSubs.forEach((s: any) => {
      const ref = String(s.transaction_ref || "").toUpperCase().trim()
      if (!ref || !processedTransactionRefs.has(ref)) {
        if (ref) processedTransactionRefs.add(ref)
        const plan = String(s.plan || "").toLowerCase()
        let amt = Number(s.amount)
        if (!amt || isNaN(amt) || amt <= 0) {
          amt = plan === "1_year" || plan.includes("an") ? 30000 : 10000
        }
        subscriptionRevenue += amt
      }
    })

    // Total Combined Revenue
    const totalRevenue = bootcampRevenue + subscriptionRevenue

    // Bootcamp-only pending payments count
    const bootcampPayments = (payments || []).filter(p => !isSubscriptionPayment(p))
    const pendingPaymentsCount = bootcampPayments.filter(p => {
      const s = String(p.status || "").toLowerCase().trim()
      return s === "pending_verification" || s === "pending" || s === "en_attente"
    }).length

    const bootcampRegistrations = (registrations || []).filter(r => !isSubscriptionRegistration(r))
    const totalRegistrations = bootcampRegistrations.length
    const proRegistrations = paidRegistrations.length
    const totalStudents = (profiles || []).length
    const pendingSubmissions = (submissions || []).filter(s => s.status === "pending" || !s.status).length
    const b2bCount = (b2bRequests || []).length

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        bootcampRevenue,
        subscriptionRevenue,
        totalRegistrations,
        proRegistrations,
        totalSubscriptionsActive: allValidatedSubs.length,
        totalStudents,
        pendingPaymentsCount,
        pendingSubmissions,
        b2bCount
      }
    })
  } catch (error: any) {
    console.error("Admin stats API error:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur." }, { status: 500 })
  }
}
