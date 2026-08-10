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

    // Calculate revenue
    const confirmedPayments = (payments || []).filter(p => p.status === "confirmed" || p.status === "success")
    const totalRevenue = confirmedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const pendingPaymentsCount = (payments || []).filter(p => p.status === "pending_verification" || p.status === "pending").length
    const totalRegistrations = (registrations || []).length
    const proRegistrations = (registrations || []).filter(r => r.source?.includes("pro") || r.status === "paye").length
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
