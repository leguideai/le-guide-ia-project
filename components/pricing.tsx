"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Check, Sparkles, ArrowRight, Clock, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic } from "@/lib/courses-visibility"
import { useUserEnrollments } from "@/lib/user-enrollments"

interface PricingProps {
  selectedCourseId?: string
  courses?: any[]
  activeCourse?: any
  onSelectCourse?: (id: string) => void
}

function getOfferEndTimestamp(rawDate?: string | null): number | null {
  if (!rawDate || String(rawDate).trim() === "") return null
  const clean = String(rawDate).trim()
  
  // Format YYYY-MM-DD (ex: "2026-08-20") -> épuise toute la journée jusqu'à 23:59:59.999
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  // Format avec heure 00:00:00 -> Repousser à la fin de cette même journée
  if (clean.includes("T00:00:00")) {
    const datePart = clean.split("T")[0]
    const [y, m, d] = datePart.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  const parsed = new Date(clean).getTime()
  return isNaN(parsed) ? null : parsed
}

export function Pricing({ selectedCourseId, courses, activeCourse: propActiveCourse, onSelectCourse }: PricingProps) {
  const { isEnrolledInCourse, isPendingInCourse } = useUserEnrollments()
  const [dbCourses, setDbCourses] = useState<any[]>(courses || [])
  const [activeId, setActiveId] = useState<string>(selectedCourseId || "")

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isOfferExpired, setIsOfferExpired] = useState(false)
  const [hasOfferEndDate, setHasOfferEndDate] = useState(false)

  useEffect(() => {
    if (courses && courses.length > 0) {
      setDbCourses(courses)
    }
  }, [courses])

  useEffect(() => {
    async function loadCourses() {
      if (courses && courses.length > 0) return

      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          const publicOnly = data.courses.filter(isCourseOpenForPublic)
          setDbCourses(publicOnly.length > 0 ? publicOnly : data.courses)
          if (!activeId) setActiveId(publicOnly[0]?.id || data.courses[0]?.id)
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
          const publicCourses = data.filter(isCourseOpenForPublic)
          setDbCourses(publicCourses.length > 0 ? publicCourses : data)
          if (!activeId) setActiveId(publicCourses[0]?.id || data[0]?.id)
        }
      } catch (e) {}
    }
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      setActiveId(selectedCourseId)
    }
  }, [selectedCourseId])

  const allCourses = (courses && courses.length > 0) ? courses : dbCourses
  const publicCourses = allCourses.filter(isCourseOpenForPublic)
  const displayCourses = publicCourses.length > 0 ? publicCourses : allCourses

  const activeCourse = propActiveCourse || displayCourses.find(c => 
    c.id === activeId || 
    c.slug === activeId || 
    c.id === selectedCourseId || 
    c.slug === selectedCourseId ||
    (selectedCourseId && String(c.slug || "").toLowerCase().includes(String(selectedCourseId).toLowerCase())) ||
    (selectedCourseId && String(selectedCourseId).toLowerCase().includes(String(c.slug || "").toLowerCase())) ||
    (activeId && String(c.slug || "").toLowerCase().includes(String(activeId).toLowerCase()))
  ) || displayCourses[0]

  // Dynamic Live Countdown Engine based on activeCourse.offer_end_date (with full last day exhausted)
  useEffect(() => {
    const targetTime = getOfferEndTimestamp(activeCourse?.offer_end_date)
    if (!targetTime) {
      setHasOfferEndDate(false)
      setIsOfferExpired(false)
      return
    }

    setHasOfferEndDate(true)

    const calculateCountdown = () => {
      const now = new Date().getTime()
      const diff = targetTime - now

      if (diff <= 0) {
        setIsOfferExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setIsOfferExpired(false)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [activeCourse?.offer_end_date])

  function formatPrice(val: any, currency = "FCFA") {
    if (val === undefined || val === null || val === "") return ""
    if (typeof val === "number") {
      return val === 0 ? "GRATUIT" : `${val.toLocaleString("fr-FR")} ${currency}`
    }
    const str = String(val).trim()
    if (str === "0" || str.toLowerCase() === "gratuit") return "GRATUIT"
    return str.includes("FCFA") || str.includes("EUR") || str.includes("$") ? str : `${str} ${currency}`
  }

  function formatStandardPrice(val: any, orig: any, currency = "FCFA") {
    if (orig && String(orig).trim() !== "") {
      return formatPrice(orig, currency)
    }
    return formatPrice(val, currency)
  }

  const isBusiness = Number(activeCourse?.price) >= 140000 || 
    String(activeCourse?.slug || "").includes("business") || 
    String(activeCourse?.slug || "").includes("exec") || 
    String(activeCourse?.title || "").toLowerCase().includes("business") ||
    String(activeCourse?.badge || "").toLowerCase().includes("vip") ||
    String(activeCourse?.badge || "").toLowerCase().includes("manager")

  const activeFeatures = (activeCourse?.features && Array.isArray(activeCourse.features))
    ? activeCourse.features
    : []

  const current = {
    title: activeCourse?.title || "",
    subtitle: activeCourse?.description || activeCourse?.subtitle || "",
    founderPrice: formatPrice(activeCourse?.price || 0, activeCourse?.currency),
    standardPrice: formatStandardPrice(activeCourse?.price || 0, activeCourse?.original_price || "", activeCourse?.currency),
    offerBadge: activeCourse?.offer_badge_text || (isBusiness ? "OFFRE EXCLUSIVE VIP" : "OFFRE SPÉCIALE FONDATEUR"),
    standardDateText: activeCourse?.dates ? `Session : ${activeCourse.dates}` : "",
    offerCheckoutHref: (activeCourse?.price === 0 || activeCourse?.price === "0" || activeCourse?.price === "GRATUIT")
      ? "/register-account" 
      : `/checkout/${activeCourse?.slug || activeCourse?.id || ""}?tier=offer`,
    standardCheckoutHref: (activeCourse?.price === 0 || activeCourse?.price === "0" || activeCourse?.price === "GRATUIT")
      ? "/register-account" 
      : `/checkout/${activeCourse?.slug || activeCourse?.id || ""}?tier=standard`,
    features: activeFeatures
  }

  const theme = isBusiness
    ? {
        border: "border-2 border-[#D4AF37] glow-gold bg-slate-950",
        badge: "bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-slate-950 border border-[#F3E5AB]",
        priceColor: "text-white",
        expireColor: "text-[#ECC86B]",
        expireIcon: "text-[#D4AF37]",
        checkColor: "text-[#D4AF37]",
        btn: "bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black shadow-xl shadow-[#D4AF37]/25",
      }
    : {
        border: "border-2 border-primary glow-blue bg-slate-950",
        badge: "bg-primary text-slate-950 border border-amber-300 font-black",
        priceColor: "text-white",
        expireColor: "text-amber-300",
        expireIcon: "text-primary",
        checkColor: "text-primary",
        btn: "bg-primary hover:bg-primary/90 text-slate-950 font-black shadow-xl shadow-primary/25",
      }

  const isEnrolled = isEnrolledInCourse(activeCourse)
  const isPending = isPendingInCourse(activeCourse)

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/50" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Left-Aligned Header */}
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${isBusiness ? "text-[#ECC86B] bg-[#D4AF37]/10 border-[#D4AF37]/30" : "text-primary bg-primary/10 border-primary/20"}`}>
              TARIFS OFFICIELS · {current.title.toUpperCase()}
            </span>
          </div>
      
          <p className="text-xs md:text-sm text-muted-foreground">
            Profitez de votre place officielle avec accès complet aux sessions en direct, aux replays HD à vie et au certificat d'accomplissement.
          </p>
        </div>

        {/* 2 Cards Grid: Offre Spéciale vs Prix Standard */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch pt-6 md:pt-8">
          
          {/* Card 1: Offre Spéciale / Fondateur (Avec décompteur) */}
          <motion.div
            key={`founder-${activeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between z-10 transition-all ${
              isOfferExpired 
                ? "border border-border/60 bg-card/20 opacity-75 grayscale-[0.4]" 
                : isEnrolled
                  ? "border-2 border-emerald-500/60 bg-slate-950 shadow-emerald-500/10 shadow-2xl"
                  : isPending
                    ? "border-2 border-amber-500/60 bg-slate-950 shadow-amber-500/10 shadow-2xl"
                    : theme.border
            }`}
          >
            {/* Top Badge */}
            <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl z-20 ${
              isEnrolled
                ? "bg-emerald-600 text-white border border-emerald-400 font-bold"
                : isPending
                  ? "bg-amber-500 text-slate-950 border border-amber-300 font-black"
                  : isOfferExpired 
                    ? "bg-slate-800 text-slate-400 border border-slate-700" 
                    : theme.badge
            }`}>
              {isEnrolled ? <CheckCircle2 className="size-3.5" /> : isPending ? <Clock className="size-3.5 animate-pulse" /> : <Sparkles className="size-3.5" />}
              {isEnrolled ? "VOUS ÊTES INSCRIT" : isPending ? "EN COURS DE VALIDATION" : isOfferExpired ? "OFFRE TERMINÉE" : current.offerBadge}
            </div>

            <div>
              <div className="text-center mt-4 mb-6 space-y-3">
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className={`font-heading text-4xl md:text-5xl font-black ${isOfferExpired ? "text-slate-500 line-through" : theme.priceColor}`}>
                    {current.founderPrice}
                  </span>
                </div>

                {/* Enrolled Status Notice */}
                {isEnrolled && (
                  <div className="py-2 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Votre inscription à ce Bootcamp est confirmée</span>
                  </div>
                )}

                {/* Pending Status Notice */}
                {isPending && (
                  <div className="py-2 px-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                    <Clock className="size-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>Votre paiement est en cours de vérification sous 24h</span>
                  </div>
                )}

                {/* Dynamic Live Countdown Timer or Expiry Alert (only if not already enrolled/pending) */}
                {!isEnrolled && !isPending && hasOfferEndDate && !isOfferExpired && (
                  <div className={`py-2 px-3 rounded-2xl border text-xs font-mono font-bold flex items-center justify-center gap-2 ${
                    isBusiness ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#F3E5AB]" : "bg-primary/15 border-primary/30 text-amber-300"
                  }`}>
                    <Clock className="size-4 animate-pulse shrink-0 text-primary" />
                    <span>
                      Fin de l'offre : <strong className="text-white">{timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong>
                    </span>
                  </div>
                )}

                {!isEnrolled && !isPending && hasOfferEndDate && isOfferExpired && (
                  <div className="py-2 px-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2">
                    <AlertCircle className="size-4 text-rose-400 shrink-0" />
                    <span>Cette offre promotionnelle a expiré</span>
                  </div>
                )}

                {current.standardDateText && (
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    {current.standardDateText}
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 pt-6">
                <ul className="space-y-3.5">
                  {current.features.map((f: string, index: number) => (
                    <li key={index} className={`flex items-start gap-3 text-xs md:text-sm ${isOfferExpired ? "text-muted-foreground" : "text-foreground/95"}`}>
                      <Check className={`size-4 shrink-0 mt-0.5 ${isEnrolled ? "text-emerald-400" : isPending ? "text-amber-400" : isOfferExpired ? "text-slate-600" : theme.checkColor}`} />
                      <span>{String(f).replace(/VIP/gi, "Exclusifs")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              {isEnrolled ? (
                <Link
                  href="/dashboard"
                  className="w-full flex h-13 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Vous êtes déjà inscrit(e) · Espace Membre</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : isPending ? (
                <Link
                  href="/dashboard"
                  className="w-full flex h-13 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Clock className="size-4 animate-pulse" />
                  <span>⏳ Inscription en cours de traitement · Suivre mon statut</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : !isOfferExpired ? (
                <Link
                  href={current.offerCheckoutHref}
                  className={`w-full flex h-13 items-center justify-center gap-2 rounded-xl text-sm transition-all shadow-xl active:scale-95 cursor-pointer ${theme.btn}`}
                >
                  <span>Profiter de l'Offre ({current.founderPrice})</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full flex h-13 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm bg-slate-800/80 text-slate-500 font-bold border border-slate-700/60 cursor-not-allowed select-none"
                >
                  <span>Offre Expirée · Tarif Standard Uniquement</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Card 2: Prix Standard */}
          <motion.div
            key={`standard-${activeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`relative rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between transition-all ${
              isOfferExpired && !isEnrolled && !isPending
                ? "border-2 border-primary glow-gold bg-slate-950 shadow-2xl z-20" 
                : "border border-border/80 bg-card/40 backdrop-blur-xl"
            }`}
          >
            {/* Standard Badge on Card 2 */}
            <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl z-20 ${
              isOfferExpired && !isEnrolled && !isPending
                ? "bg-primary text-slate-950 border border-amber-300 font-black" 
                : "bg-secondary text-secondary-foreground border border-border"
            }`}>
              <ShieldCheck className="size-3.5" />
              {isOfferExpired && !isEnrolled && !isPending ? "TARIF OFFICIEL ACTIF" : "PRIX STANDARD"}
            </div>

            <div>
              <div className="text-center mt-4 mb-6 space-y-3">
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className={`font-heading text-4xl md:text-5xl font-black ${isOfferExpired ? "text-white" : "text-foreground"}`}>
                    {current.standardPrice}
                  </span>
                </div>

                {isOfferExpired && !isEnrolled && !isPending && (
                  <div className="py-2 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span>Inscriptions ouvertes au tarif standard</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground font-semibold pt-1">
                  {current.standardDateText}
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <ul className="space-y-3.5">
                  {current.features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-muted-foreground">
                      <Check className={`size-4 shrink-0 mt-0.5 ${isOfferExpired ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              {isEnrolled ? (
                <Link
                  href="/dashboard"
                  className="w-full flex h-13 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>✅ Accès Déjà Actif · Voir mes Formations</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : isPending ? (
                <Link
                  href="/dashboard"
                  className="w-full flex h-13 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Clock className="size-4 animate-pulse text-amber-400" />
                  <span>⏳ Inscription en cours de validation · Suivre mon statut</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href={current.standardCheckoutHref}
                  className={`w-full flex h-13 items-center justify-center gap-2 rounded-xl font-bold text-xs md:text-sm transition-all active:scale-95 cursor-pointer shadow-xl ${
                    isOfferExpired 
                      ? "bg-primary hover:bg-primary/90 text-slate-950 font-black shadow-primary/25" 
                      : "bg-secondary/80 hover:bg-secondary text-foreground border border-border"
                  }`}
                >
                  <span>Rejoindre au Tarif Standard ({current.standardPrice})</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}

