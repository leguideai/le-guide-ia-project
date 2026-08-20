import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

const MONTHS_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
]

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "week" // "day" | "week" | "month" | "year"

    const now = new Date()
    let startDate = new Date()
    let prevStartDate = new Date()
    let prevEndDate = new Date()

    if (period === "day") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
      prevEndDate = new Date(startDate.getTime())
    } else if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      prevEndDate = new Date(startDate.getTime())
    } else if (period === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      prevEndDate = new Date(startDate.getTime())
    } else if (period === "year") {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      prevStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
      prevEndDate = new Date(startDate.getTime())
    }

    // 1. Fetch 100% real visits from Supabase `site_visits`
    let visits: any[] = []
    let prevVisitsCount = 0

    try {
      const { data, error } = await supabaseServer
        .from("site_visits")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .not("path", "ilike", "/admin%")
        .order("created_at", { ascending: true })

      if (!error && data) {
        visits = data
      }

      // Comparison with previous period
      const { count } = await supabaseServer
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", prevStartDate.toISOString())
        .lt("created_at", prevEndDate.toISOString())
        .not("path", "ilike", "/admin%")

      prevVisitsCount = count || 0
    } catch (e) {
      console.warn("Notice querying site_visits:", e)
    }

    // 2. Count devices and unique visitors from real records
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 }
    visits.forEach((v) => {
      const dev = v.device_type === "mobile" ? "mobile" : v.device_type === "tablet" ? "tablet" : "desktop"
      deviceCounts[dev]++
    })

    const chartSeries: { label: string; date: string; pageviews: number; visitors: number }[] = []

    // 3. Build time slots strictly with REAL data
    if (period === "day") {
      // 24 hours of today (grouped in 2h intervals)
      for (let h = 0; h < 24; h += 2) {
        const hourLabel = `${h.toString().padStart(2, "0")}h`
        const matching = visits.filter((v) => {
          const d = new Date(v.created_at)
          return d.getHours() >= h && d.getHours() < h + 2
        })
        const uniqueVids = new Set(matching.map((m) => m.visitor_id)).size

        chartSeries.push({
          label: hourLabel,
          date: hourLabel,
          pageviews: matching.length,
          visitors: uniqueVids
        })
      }
    } else if (period === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = d.toISOString().split("T")[0]
        const label = `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`

        const matching = visits.filter((v) => String(v.created_at).startsWith(dateStr))
        const uniqueVids = new Set(matching.map((m) => m.visitor_id)).size

        chartSeries.push({
          label,
          date: dateStr,
          pageviews: matching.length,
          visitors: uniqueVids
        })
      }
    } else if (period === "month") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = d.toISOString().split("T")[0]
        const label = `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`

        const matching = visits.filter((v) => String(v.created_at).startsWith(dateStr))
        const uniqueVids = new Set(matching.map((m) => m.visitor_id)).size

        chartSeries.push({
          label,
          date: dateStr,
          pageviews: matching.length,
          visitors: uniqueVids
        })
      }
    } else if (period === "year") {
      // 12 Months
      for (let m = 11; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
        const label = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
        const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`

        const matching = visits.filter((v) => String(v.created_at).startsWith(yearMonth))
        const uniqueVids = new Set(matching.map((m) => m.visitor_id)).size

        chartSeries.push({
          label,
          date: yearMonth,
          pageviews: matching.length,
          visitors: uniqueVids
        })
      }
    }

    // 4. Exact Real Aggregations
    const totalPageviews = visits.length
    const totalUniqueVisitors = new Set(visits.map((v) => v.visitor_id)).size

    let daysCount = 1
    if (period === "day") daysCount = 1
    else if (period === "week") daysCount = 7
    else if (period === "month") daysCount = 30
    else if (period === "year") daysCount = 365

    const averagePerDay = Math.round(totalPageviews / Math.max(1, daysCount))

    let growthPercentage = "+0%"
    if (prevVisitsCount > 0) {
      const diff = totalPageviews - prevVisitsCount
      const pct = Math.round((diff / prevVisitsCount) * 100)
      growthPercentage = pct >= 0 ? `+${pct}%` : `${pct}%`
    } else if (totalPageviews > 0) {
      growthPercentage = `+100%`
    }

    const totalDevs = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet
    const deviceBreakdown = {
      mobile: totalDevs > 0 ? Math.round((deviceCounts.mobile / totalDevs) * 100) : 0,
      desktop: totalDevs > 0 ? Math.round((deviceCounts.desktop / totalDevs) * 100) : 0,
      tablet: totalDevs > 0 ? Math.round((deviceCounts.tablet / totalDevs) * 100) : 0
    }

    return NextResponse.json({
      success: true,
      period,
      stats: {
        totalPageviews,
        totalUniqueVisitors,
        averagePerDay,
        growthPercentage
      },
      chartSeries,
      deviceBreakdown
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
