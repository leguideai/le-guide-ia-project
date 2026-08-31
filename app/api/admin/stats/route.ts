import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 1. Fetch payments
    const { data: payments, error: payErr } = await supabaseServer
      .from("payments")
      .select("*")

    if (payErr) console.warn("Admin stats payments fetch warn:", payErr.message)

    // 2. Fetch registrations
    const { data: registrations, error: regErr } = await supabaseServer
      .from("registrations")
      .select("*")

    if (regErr) console.warn("Admin stats registrations fetch warn:", regErr.message)

    // 3. Fetch profiles
    const { data: profiles, error: profErr } = await supabaseServer
      .from("profiles")
      .select("id, role")

    if (profErr) console.warn("Admin stats profiles fetch warn:", profErr.message)

    // 4. Fetch B2B requests
    const { data: b2bRequests, error: b2bErr } = await supabaseServer
      .from("service_requests")
      .select("id, status")

    if (b2bErr) console.warn("Admin stats B2B fetch warn:", b2bErr.message)

    // 5. Fetch submissions
    const { data: submissions, error: subErr } = await supabaseServer
      .from("submissions")
      .select("id, status")

    if (subErr) console.warn("Admin stats submissions fetch warn:", subErr.message)

    // 6. Fetch courses for price lookup
    const { data: courses } = await supabaseServer
      .from("courses")
      .select("id, slug, title, price")

    const coursePriceMap = new Map<string, number>()
    courses?.forEach(c => {
      const priceNum = parseInt(String(c.price || "99000").replace(/\D/g, "")) || 99000
      if (c.id) coursePriceMap.set(c.id, priceNum)
      if (c.slug) coursePriceMap.set(c.slug, priceNum)
    })

    // Calculate revenue from confirmed payments
    const confirmedPayments = (payments || []).filter(p => {
      const s = String(p.status || "").toLowerCase()
      return s === "confirmed" || s === "success" || s === "paye" || s === "completed" || s === "valide" || s === "validé"
    })

    const registeredPaymentIds = new Set<string>()
    let totalRevenue = 0

    confirmedPayments.forEach(p => {
      if (p.registration_id) registeredPaymentIds.add(p.registration_id)
      let amt = Number(p.amount)
      if (!amt || isNaN(amt) || amt <= 0) {
        amt = (p.course_id && coursePriceMap.get(p.course_id)) || (p.course_title && coursePriceMap.get(p.course_title)) || 99000
      }
      totalRevenue += amt
    })

    // Also include paid registrations that don't have a double-counted payment record
    const paidRegistrations = (registrations || []).filter(r => {
      const s = String(r.status || "").toLowerCase()
      return s === "paye" || s === "paid" || s === "confirmed" || r.source === "admin_manual_enroll"
    })

    paidRegistrations.forEach(r => {
      if (!registeredPaymentIds.has(r.id)) {
        const amt = (r.course_id && coursePriceMap.get(r.course_id)) || (r.course_slug && coursePriceMap.get(r.course_slug)) || 99000
        totalRevenue += amt
      }
    })

    const isSubscriptionPayment = (p: any) => {
      const ref = String(p.transaction_ref || "").toUpperCase()
      const title = String(p.course_title || "").toLowerCase()
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

    const bootcampPayments = (payments || []).filter(p => !isSubscriptionPayment(p))

    const pendingPaymentsCount = bootcampPayments.filter(p => {
      const s = String(p.status || "").toLowerCase()
      return s === "pending_verification" || s === "pending" || s === "en_attente"
    }).length

    const isSubscriptionRegistration = (r: any) => {
      const src = String(r.source || "").toLowerCase()
      const slug = String(r.course_slug || "").toLowerCase()
      return src.includes("subscription") || slug.includes("subscription") || slug === "subscription-vip"
    }

    const bootcampRegistrations = (registrations || []).filter(r => !isSubscriptionRegistration(r))
    const totalRegistrations = bootcampRegistrations.length
    const proRegistrations = paidRegistrations.filter(r => !isSubscriptionRegistration(r)).length
    const totalStudents = (profiles || []).length
    const pendingSubmissions = (submissions || []).filter(s => s.status === "pending" || !s.status).length
    const b2bCount = (b2bRequests || []).length

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalRegistrations,
        proRegistrations,
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
