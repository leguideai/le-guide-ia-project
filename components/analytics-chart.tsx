"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  TrendingUp, Users, Eye, Smartphone, 
  RefreshCw, ArrowUpRight, Activity
} from "lucide-react"

export type AnalyticsPeriod = "day" | "week" | "month" | "year"

interface ChartPoint {
  label: string
  date: string
  pageviews: number
  visitors: number
}

interface AnalyticsData {
  stats: {
    totalPageviews: number
    totalUniqueVisitors: number
    averagePerDay: number
    growthPercentage: string
  }
  chartSeries: ChartPoint[]
  topPages: { path: string; title: string; views: number; percentage: number }[]
  deviceBreakdown: { mobile: number; desktop: number; tablet: number }
  referrers: { source: string; percentage: number }[]
}

export function AnalyticsChart() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  async function fetchAnalytics(p: AnalyticsPeriod) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (e) {
      console.error("Error fetching analytics:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(period)
  }, [period])

  const series = data?.chartSeries || []

  // SVG Chart Dimensions & Calculations
  const chartHeight = 240
  const chartWidth = 700
  const padding = { top: 20, right: 20, bottom: 35, left: 45 }

  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const maxVal = useMemo(() => {
    if (!series || series.length === 0) return 10
    const highest = Math.max(...series.map((s) => Math.max(s.pageviews || 0, s.visitors || 0)), 0)
    return Math.max(highest > 0 ? Math.ceil(highest * 1.15) : 10, 10)
  }, [series])

  // Generate SVG path for smooth bezier curve
  const { pathPageviews, pathVisitors, areaPageviews, pointsPageviews, pointsVisitors } = useMemo(() => {
    if (!series || series.length === 0) {
      return { pathPageviews: "", pathVisitors: "", areaPageviews: "", pointsPageviews: [], pointsVisitors: [] }
    }

    const n = series.length
    const getX = (idx: number) => padding.left + (idx / Math.max(1, n - 1)) * innerWidth
    const getY = (val: number) => padding.top + innerHeight - (val / maxVal) * innerHeight

    const ptsPv = series.map((s, i) => ({ x: getX(i), y: getY(s.pageviews), item: s, idx: i }))
    const ptsVis = series.map((s, i) => ({ x: getX(i), y: getY(s.visitors), item: s, idx: i }))

    // Helper to generate cubic bezier curve string
    function makeBezier(points: { x: number; y: number }[]) {
      if (points.length === 0) return ""
      let d = `M ${points[0].x},${points[0].y}`
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i]
        const next = points[i + 1]
        const cpX = (curr.x + next.x) / 2
        d += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`
      }
      return d
    }

    const pathPv = makeBezier(ptsPv)
    const pathVis = makeBezier(ptsVis)

    // Closed Area for gradient fill
    const firstX = ptsPv[0].x
    const lastX = ptsPv[ptsPv.length - 1].x
    const bottomY = padding.top + innerHeight
    const areaPv = `${pathPv} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`

    return {
      pathPageviews: pathPv,
      pathVisitors: pathVis,
      areaPageviews: areaPv,
      pointsPageviews: ptsPv,
      pointsVisitors: ptsVis
    }
  }, [series, maxVal, innerWidth, innerHeight, padding.left, padding.top])

  const activePoint = hoveredIdx !== null && pointsPageviews[hoveredIdx] ? pointsPageviews[hoveredIdx] : null

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6 text-left">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Activity className="size-4" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-800">
              Statistiques &amp; Courbes d'Audience du Site
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Suivi en temps réel des visites, pages consultées et visiteurs uniques.
          </p>
        </div>

        {/* Period Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F4F6F8] border border-slate-200 self-start sm:self-auto">
          {(
            [
              { id: "day", label: "Aujourd'hui" },
              { id: "week", label: "7 Jours" },
              { id: "month", label: "30 Jours" },
              { id: "year", label: "12 Mois" }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === t.id
                  ? "bg-white text-slate-800 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stats Pills */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pages Vues</span>
            <Eye className="size-4 text-primary" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-800">
            {data?.stats?.totalPageviews?.toLocaleString() || "..."}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
            <ArrowUpRight className="size-3" />
            <span>{data?.stats?.growthPercentage || "+18%"} de croissance</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visiteurs Uniques</span>
            <Users className="size-4 text-emerald-600" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-800">
            {data?.stats?.totalUniqueVisitors?.toLocaleString() || "..."}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Audience distincte</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F6F8] border border-slate-200/90 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Moyenne / Jour</span>
            <TrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="font-heading text-2xl font-black text-slate-800">
            {data?.stats?.averagePerDay?.toLocaleString() || "..."}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Visites journalières</div>
        </div>
      </div>

      {/* Main Interactive Curve Chart */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-primary" />
              <span className="font-bold text-slate-700">Pages Vues (Total)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-700">Visiteurs Uniques</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Survolez la courbe pour afficher le détail
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative w-full overflow-x-auto no-scrollbar bg-[#F4F6F8]/60 border border-slate-200/90 rounded-2xl p-2 sm:p-4">
          {loading ? (
            <div className="h-60 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <RefreshCw className="size-4 animate-spin text-primary" />
              <span>Calcul des courbes d'audience...</span>
            </div>
          ) : (
            <div className="relative min-w-[500px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Area Gradient */}
                  <linearGradient id="areaGradientPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradientPv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding.top + innerHeight * (1 - ratio)
                  const labelVal = Math.round(maxVal * ratio)
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3.5}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="sans-serif"
                      >
                        {labelVal}
                      </text>
                    </g>
                  )
                })}

                {/* X-Axis Labels */}
                {series.map((s, idx) => {
                  const x = padding.left + (idx / Math.max(1, series.length - 1)) * innerWidth
                  // Only display alternating labels if list is dense
                  const showLabel = series.length <= 8 || idx % Math.ceil(series.length / 7) === 0 || idx === series.length - 1
                  if (!showLabel) return null

                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 8}
                      fill="#64748b"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {s.label.split(" ")[0]}
                    </text>
                  )
                })}

                {/* Shaded Area Fill */}
                {areaPageviews && (
                  <path d={areaPageviews} fill="url(#areaGradientPv)" />
                )}

                {/* Main Curve 1: Pageviews (Cyan/Primary) */}
                {pathPageviews && (
                  <path
                    d={pathPageviews}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Main Curve 2: Unique Visitors (Emerald) */}
                {pathVisitors && (
                  <path
                    d={pathVisitors}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                  />
                )}

                {/* Data Points on Hover */}
                {pointsPageviews.map((pt, idx) => {
                  const isHovered = hoveredIdx === idx
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3}
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-200"
                      />
                      {/* Invisible hover trigger column */}
                      <rect
                        x={pt.x - 20}
                        y={padding.top}
                        width={40}
                        height={innerHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    </g>
                  )
                })}

                {/* Active Hover Vertical Guide Line */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={padding.top}
                    x2={activePoint.x}
                    y2={padding.top + innerHeight}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
              </svg>

              {/* Dynamic Interactive Tooltip */}
              {hoveredIdx !== null && series[hoveredIdx] && activePoint && (
                <div
                  className="absolute z-20 pointer-events-none bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 transform -translate-x-1/2 -translate-y-full mb-2"
                  style={{
                    left: `${(activePoint.x / chartWidth) * 100}%`,
                    top: `${(activePoint.y / chartHeight) * 100}%`
                  }}
                >
                  <div className="font-bold text-[11px] text-slate-300 border-b border-slate-700 pb-1">
                    📅 {series[hoveredIdx].label}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-primary font-semibold">Pages Vues :</span>
                    <strong className="text-white font-mono">{series[hoveredIdx].pageviews}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-emerald-400 font-semibold">Visiteurs Uniques :</span>
                    <strong className="text-white font-mono">{series[hoveredIdx].visitors}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
