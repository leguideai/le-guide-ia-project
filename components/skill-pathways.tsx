"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { GraduationCap, UserCheck, Gift, ArrowRight, Calendar, CheckCircle2, Sparkles, Download, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic } from "@/lib/courses-visibility"
import { Select } from "@base-ui/react"

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

function formatDateSafe(d: Date | string | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]}`
}



function getOfferEndTimestamp(rawDate?: string | null): number | null {
  if (!rawDate || String(rawDate).trim() === "") return null
  const clean = String(rawDate).trim()
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  if (clean.includes("T00:00:00")) {
    const datePart = clean.split("T")[0]
    const [y, m, d] = datePart.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  const parsed = new Date(clean).getTime()
  return isNaN(parsed) ? null : parsed
}

function getOfferDetails(c: any) {
  const badgeText = c.offer_badge_text || "Offre Promo"
  const rawStart = c.offer_start_date
  const rawEnd = c.offer_end_date

  if (rawEnd) {
    try {
      const targetTime = getOfferEndTimestamp(rawEnd)
      if (targetTime && targetTime < Date.now()) {
        return null
      }

      const endFormatted = formatDateSafe(rawEnd) || ""
      const startFormatted = rawStart ? formatDateSafe(rawStart) : null

      const periodLabel = startFormatted
        ? `${endFormatted}`
        : `Jusqu'au ${endFormatted}`

      return {
        badgeText,
        periodLabel,
        endFormatted
      }
    } catch {
      return null
    }
  }

  return null
}

function parseCourseSkills(c: any): string[] {
  let list: string[] = []

  if (Array.isArray(c.skills) && c.skills.length > 0) {
    list = c.skills
  } else if (typeof c.skills === "string" && c.skills.trim()) {
    try {
      const parsed = JSON.parse(c.skills)
      if (Array.isArray(parsed)) list = parsed
    } catch {
      list = c.skills.split("\n").map((s: string) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
    }
  }

  const isOperational = (s: string) => {
    const low = s.toLowerCase()
    return low.includes("replays") || low.includes("whatsapp") || low.includes("facture") || low.includes("sessions en direct live")
  }

  const validSkills = list.map(s => String(s).replace(/^[-•*]\s*/, "").trim()).filter(s => s.length > 0 && !isOperational(s))

  if (validSkills.length >= 3) {
    return validSkills
  }

  const isCarriere = c.title?.toLowerCase().includes("carrière") || c.slug?.includes("carriere") || c.slug?.includes("pro")
  const isBusiness = c.title?.toLowerCase().includes("business") || c.slug?.includes("business")
  if (isCarriere) {
    return []
  }
  if (isBusiness) {
    return []
  }

  return validSkills
}

function formatPriceStr(val: any): string {
  if (val === null || val === undefined || val === "") return ""
  if (typeof val === "number") {
    return val > 0 ? `${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA` : "GRATUIT"
  }
  const str = String(val).trim()
  if (str.toLowerCase() === "gratuit" || str === "0") return "GRATUIT"
  const num = parseInt(str.replace(/[^\d]/g, ""), 10)
  if (!isNaN(num) && num > 0) {
    return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`
  }
  return str
}

export function SkillPathways() {
  const [dbCourses, setDbCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          setDbCourses(data.courses)
          setLoading(false)
          return
        }
      } catch (e) {}

      try {
        let { data, error } = await supabase.from("courses").select("*").order("sequence_order", { ascending: true }).order("created_at", { ascending: true })
        if (error || !data || data.length === 0) {
          const res = await supabase.from("courses").select("*").order("created_at", { ascending: true })
          data = res.data
        }
        if (data && data.length > 0) {
          setDbCourses(data)
          setLoading(false)
          return
        }
      } catch (e) {} finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  const pathways = dbCourses.filter(isCourseOpenForPublic).map(c => {
    const datesText = c.dates
      ? c.dates
      : (c.start_date && c.end_date)
      ? `Du ${formatDateSafe(c.start_date)} au ${formatDateSafe(c.end_date)}`
      : c.slug?.includes("business") || c.title?.toLowerCase().includes("business")
      ? ""
      : c.price === 0
      ? ""
      : ""

    const skills = parseCourseSkills(c)

    // Vérification de l'expiration de l'offre
    const targetTimestamp = getOfferEndTimestamp(c.offer_end_date)
    const isOfferExpired = targetTimestamp ? targetTimestamp < Date.now() : false

    const offer = (c.price === 0 || isOfferExpired) ? null : getOfferDetails(c)

    // Si l'offre est expirée : afficher UNIQUEMENT le prix standard, sans prix barré ni date de validité
    const displayPrice = isOfferExpired
      ? (c.original_price || c.price || "")
      : (c.price || "")

    const displayOriginalPrice = isOfferExpired
      ? ""
      : (c.original_price || "")

    const isBusiness = Number(c.price) >= 140000 || String(c.slug).includes("business") || String(c.slug).includes("executif") || String(c.badge || "").toLowerCase().includes("vip") || String(c.badge || "").toLowerCase().includes("manager")

    const badgeLabel = isBusiness 
      ? "EXCLUSIVE MANAGERS" 
      : (c.badge && !c.badge.toLowerCase().includes("vip") && !c.badge.toLowerCase().includes("executif"))
        ? c.badge
        : "PARCOURS CARRIÈRE & PROS"

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      desc: c.description || c.subtitle,
      price: formatPriceStr(displayPrice),
      originalPrice: formatPriceStr(displayOriginalPrice),
      badge: badgeLabel,
      format: c.format || "",
      certificate: c.certificate || "",
      dates: datesText,
      skills: skills,
      offer: offer,
      isOfferExpired: isOfferExpired,
      pdfUrl: c.pdf_url || "",
      icon: isBusiness ? UserCheck : GraduationCap,
      href: `/bootcamp?course=${c.slug || c.id}`,
      image: c.thumbnail || c.poster || "",
      isFree: c.price === 0,
      isExclusiveManager: isBusiness,
      accentColor: isBusiness ? "gold" : "blue",
    }
  })

  const getAccent = (color: string) => {
    if (color === "gold" || color === "amber") {
      return {
        accentColor: "gold",
        border: "border-[#D4AF37]/50 hover:border-[#D4AF37]",
        badge: "bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-slate-950 border border-[#F3E5AB]/80 font-black shadow-lg shadow-[#D4AF37]/30",
        btn: "bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black shadow-lg shadow-[#D4AF37]/25",
        glow: "shadow-[#D4AF37]/15",
        price: "text-[#ECC86B]",
        tag: "text-[#ECC86B] bg-[#D4AF37]/15 border border-[#D4AF37]/35",
        iconColor: "text-[#D4AF37]"
      }
    }
    return {
      accentColor: "blue",
      border: "border-blue-500/50 hover:border-blue-400/80",
      badge: "bg-blue-600 text-white border border-blue-400/60 font-black shadow-lg shadow-blue-500/30",
      btn: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-blue-500/20",
      glow: "shadow-blue-500/10",
      price: "text-blue-400",
      tag: "text-blue-300 bg-blue-500/15 border-blue-500/30",
      iconColor: "text-blue-400"
    }
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              BOOTCAMP PRO IA
            </span>
            <p className="text-xs sm:text-sm text-muted-foreground">Choisissez la formule adaptée à vos objectifs</p>
          </div>
        </div>

        {/* Full-width Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
          {loading ? (
            /* Skeleton Loading for Bootcamps */
            [1, 2].map((i) => (
              <div
                key={i}
                className="relative rounded-3xl border border-border/80 bg-card/50 overflow-hidden flex flex-col backdrop-blur-xl animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="relative w-full aspect-video bg-slate-900 flex items-center justify-center">
                  <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <GraduationCap className="size-6 text-white/20" />
                  </div>
                  <div className="absolute top-3.5 left-3.5 h-6 w-36 rounded-xl bg-white/10" />
                </div>

                {/* Body Placeholder */}
                <div className="p-4 sm:p-6 flex flex-col gap-5 flex-1 justify-between">
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                    </div>

                    {/* Price box */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="h-6 w-36 bg-white/10 rounded-lg" />
                      <div className="h-4 w-48 bg-white/5 rounded" />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="h-12 w-full bg-white/15 rounded-xl mt-4" />
                </div>
              </div>
            ))
          ) : (
            pathways.map((item, idx) => {
            const Icon = item.icon
            const accent = getAccent(item.accentColor)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-3xl border ${accent.border} bg-card/70 overflow-hidden flex flex-col group backdrop-blur-xl shadow-2xl ${accent.glow} transition-all duration-300 hover:shadow-lg`}
              >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge top-left (High Contrast Vibrant Pill) */}
                  <div className={`absolute top-3.5 left-3.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${accent.badge}`}>
                    {item.badge}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 flex-1 justify-between">
                  <div className="space-y-4">
                    {/* Header with Title & Price */}
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-5 shrink-0 ${accent.price}`} />
                        <h3 className="font-heading text-lg font-bold text-foreground leading-snug">{item.title}</h3>
                      </div>

                      {/* Dynamic Price & Founder Offer Validity Box */}
                      <div className="bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
                        {/* Top Row: Price + Offer Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={`text-xl sm:text-2xl font-black tracking-tight ${accent.price}`}>{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through font-semibold">{item.originalPrice}</span>
                            )}
                          </div>
                      
                        </div>

                        {/* Date de début et fin de l'offre */}
                        {item.offer && item.offer.periodLabel && (
                          <div className="flex flex-wrap items-center  gap-1 text-[11px] pt-2 border-t border-border/40 text-slate-300">
                            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                              <Clock className="size-3.5 text-[#D4AF37] shrink-0" />
                              <span>Offre valable jusqu'au </span>
                            </span>
                            <span className="font-bold text-[#ECC86B]">
                              {item.offer.periodLabel} 2026
                            </span>
                          </div>
                        )}
                      </div>

                      {item.desc && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.desc}</p>
                      )}
                    </div>

                    {/* 1. Dates & Format Badge */}
                    {item.dates && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm ${accent.tag}`}>
                          <Calendar className={`size-4 shrink-0 ${accent.iconColor}`} />
                          <span>Session : <strong>{item.dates}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200 bg-slate-900 border border-slate-700 px-3 py-1.5 sm:py-2 rounded-xl">
                          <span className={`size-2 rounded-full ${accent.accentColor === "gold" ? "bg-[#D4AF37]" : "bg-blue-400"} animate-pulse`} />
                          <span>{item.format}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      href={item.href}
                      className={`w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer ${accent.btn}`}
                    >
                      <span>Découvrir la formule</span>
                      <ArrowRight className="size-4" />
                    </Link>
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold px-3.5 py-3 text-xs transition-all shrink-0 hover:text-white"
                        title="Télécharger le programme officiel (PDF)"
                      >
                        <span className="hidden sm:inline">Voir Programme</span>
                        <span className="sm:hidden">Voir Programme</span>
                        <ArrowRight className="size-3.5 text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          }))}
        </div>

      </div>
    </section>
  )
}
