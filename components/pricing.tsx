"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Check, Sparkles, ArrowRight, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic } from "@/lib/courses-visibility"

interface PricingProps {
  selectedCourseId?: string
  courses?: any[]
  activeCourse?: any
  onSelectCourse?: (id: string) => void
}

export function Pricing({ selectedCourseId, courses, activeCourse: propActiveCourse, onSelectCourse }: PricingProps) {
  const [dbCourses, setDbCourses] = useState<any[]>(courses || [])
  const [activeId, setActiveId] = useState<string>(selectedCourseId || "")

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
    if (typeof val === "number") {
      return val === 0 ? "0 FCFA" : `${Math.round(val * 1.5).toLocaleString("fr-FR")} ${currency}`
    }
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ""))
    if (!isNaN(num) && num > 0) {
      return `${Math.round(num * 1.5).toLocaleString("fr-FR")} ${currency}`
    }
    return String(val || "")
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
    founderApprox: "",
    standardPrice: formatStandardPrice(activeCourse?.price || 0, activeCourse?.original_price || "", activeCourse?.currency),
    standardApprox: "",
    expireText: activeCourse?.badge || "",
    targetDateIso: "",
    standardDateText: activeCourse?.dates ? `Session : ${activeCourse.dates}` : "",
    checkoutHref: (activeCourse?.price === 0 || activeCourse?.price === "0" || activeCourse?.price === "GRATUIT") ? "/register-account" : `/checkout/${activeCourse?.slug || activeCourse?.id || ""}`,
    features: activeFeatures
  }

  const badgeText = isBusiness 
    ? "EXCLUSIVE MANAGERS" 
    : (activeCourse?.badge && !activeCourse.badge.toLowerCase().includes("vip") && !activeCourse.badge.toLowerCase().includes("executif"))
      ? activeCourse.badge
      : "PARCOURS CARRIÈRE & PROS"

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
        border: "border-2 border-blue-500/80 glow-blue bg-slate-950",
        badge: "bg-blue-600 text-white border border-blue-400 font-black",
        priceColor: "text-white",
        expireColor: "text-blue-300",
        expireIcon: "text-blue-400",
        checkColor: "text-blue-400",
        btn: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-500/25",
      }

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/50" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Left-Aligned Header */}
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${isBusiness ? "text-[#ECC86B] bg-[#D4AF37]/10 border-[#D4AF37]/30" : "text-primary bg-primary/10 border-primary/20"}`}>
              TARIFS OFFICIELS · {current.title.toUpperCase()}
            </span>

            {/* Formula switcher buttons if multiple courses exist */}
            {displayCourses.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {displayCourses.map(c => {
                  const isCurActive = (activeCourse?.id === c.id || activeCourse?.slug === c.slug)
                  const isCurBusiness = Number(c.price) >= 140000 || String(c.slug || "").includes("business") || String(c.title || "").toLowerCase().includes("business")
                  return (
                    <button
                      key={c.id || c.slug}
                      onClick={() => {
                        const targetId = c.id || c.slug
                        setActiveId(targetId)
                        if (onSelectCourse) onSelectCourse(targetId)
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer border shrink-0 ${
                        isCurActive
                          ? isCurBusiness
                            ? "bg-[#D4AF37] text-slate-950 border-[#F3E5AB] font-black shadow-lg shadow-[#D4AF37]/30 scale-[1.02]"
                            : "bg-blue-600 text-white border-blue-400 font-bold shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "bg-card/60 border-border/70 text-muted-foreground hover:text-foreground hover:bg-card font-semibold"
                      }`}
                    >
                      <span>{c.title}</span>
                      <span className="opacity-80">({c.price > 0 ? `${Number(c.price).toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT"})</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
      
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Profitez du tarif officiel garanti avec accès complet aux sessions en direct, aux replays HD et au certificat d'accomplissement.
          </p>
        </div>

        {/* 2 Cards Grid: Offre Fondateur vs Prix Standard */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch pt-6 md:pt-8">
          
          {/* Card 1: Offre Actuelle (Highlight) */}
          <motion.div
            key={`founder-${activeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between z-10 ${theme.border}`}
          >
            {/* Top Badge */}
            <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl z-20 ${theme.badge}`}>
              <Sparkles className="size-3.5" />
              {badgeText}
            </div>

            <div>
              <div className="text-center mt-4 mb-6 space-y-2">
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className={`font-heading text-4xl md:text-5xl font-black ${theme.priceColor}`}>{current.founderPrice}</span>
                  {current.founderApprox && (
                    <span className="text-xs font-bold text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">
                      {current.founderApprox}
                    </span>
                  )}
                </div>

                {current.standardDateText && (
                  <div className={`text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 pt-1 ${theme.expireColor}`}>
                    <Clock className={`size-3.5 animate-pulse ${theme.expireIcon}`} />
                    <span>{current.standardDateText}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 pt-6">
                <ul className="space-y-3.5">
                  {current.features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-foreground/95">
                      <Check className={`size-4 shrink-0 mt-0.5 ${theme.checkColor}`} />
                      <span>{String(f).replace(/VIP/gi, "Exclusifs")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href={current.checkoutHref}
                className={`w-full flex h-13 items-center justify-center gap-2 rounded-xl text-sm transition-all shadow-xl active:scale-95 cursor-pointer ${theme.btn}`}
              >
                <span>Rejoindre le Bootcamp ({current.founderPrice})</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Prix Standard */}
          <motion.div
            key={`standard-${activeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative rounded-3xl border border-border/80 bg-card/40 backdrop-blur-xl p-6 md:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="text-center mt-4 mb-6 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  PRIX STANDARD
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="font-heading text-3xl md:text-4xl font-black text-foreground">{current.standardPrice}</span>
                </div>
                <div className="text-xs text-muted-foreground font-semibold pt-1">
                  {current.standardDateText}
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <ul className="space-y-3.5">
                  {current.features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-muted-foreground">
                      <Check className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href={current.checkoutHref}
                className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs md:text-sm border border-border transition-all active:scale-95 cursor-pointer"
              >
                <span>Choisir l'accès ({current.standardPrice})</span>
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
