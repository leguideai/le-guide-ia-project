"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Check, Sparkles, ArrowRight, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PricingProps {
  selectedCourseId?: string
}

export function Pricing({ selectedCourseId }: PricingProps) {
  const [dbCourses, setDbCourses] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string>(selectedCourseId || "")

  useEffect(() => {
    async function loadCourses() {
      let { data, error } = await supabase.from("courses").select("*").order("sequence_order", { ascending: true }).order("created_at", { ascending: true })
      if (error || !data || data.length === 0) {
        const res = await supabase.from("courses").select("*").order("created_at", { ascending: true })
        data = res.data
      }
      if (data && data.length > 0) {
        setDbCourses(data)
        if (!activeId) setActiveId(data[0].id)
      }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) setActiveId(selectedCourseId)
  }, [selectedCourseId])

  const activeCourse = dbCourses.find(c => c.id === activeId || c.slug === activeId) || dbCourses[0]

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

  const current = {
    title: activeCourse?.title || "BOOTCAMP IA",
    subtitle: activeCourse?.description || activeCourse?.subtitle || "",
    founderPrice: formatPrice(activeCourse?.price, activeCourse?.currency),
    founderApprox: "",
    standardPrice: formatStandardPrice(activeCourse?.price, activeCourse?.original_price, activeCourse?.currency),
    standardApprox: "",
    expireText: activeCourse?.badge || "",
    targetDateIso: "",
    standardDateText: activeCourse?.dates ? `Session : ${activeCourse.dates}` : "",
    checkoutHref: (activeCourse?.price === 0 || activeCourse?.price === "0" || activeCourse?.price === "GRATUIT") ? "/register-account" : `/checkout/${activeCourse?.slug || activeCourse?.id}`,
    features: (activeCourse?.features && Array.isArray(activeCourse.features)) ? activeCourse.features : []
  }

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!current.targetDateIso) return

    const updateTimer = () => {
      const targetDate = new Date(current.targetDateIso).getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [activeId, current.targetDateIso])

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/50" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Left-Aligned Header */}
        <div className="space-y-3 text-left">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            TARIFS OFFICIELS · {current.title.toUpperCase()}
          </span>
      
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Profitez du Tarif Fondateur avantageux avant l'expiration du décompte et le passage au tarif standard.
          </p>
        </div>

        {/* 2 Cards Grid: Offre Fondateur vs Prix Standard */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch pt-6 md:pt-8">
          
          {/* Card 1: Offre Fondateur (Highlight) */}
          <motion.div
            key={`founder-${activeId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl border-2 border-amber-500 bg-slate-950 p-6 md:p-8 shadow-2xl flex flex-col justify-between z-10"
          >
            {/* Top Founder Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-5 py-1 text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow-xl z-20">
              <Sparkles className="size-3.5 fill-slate-950" />
              OFFRE FONDATEUR
            </div>

            <div>
              <div className="text-center mt-4 mb-6 space-y-2">
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="font-heading text-4xl md:text-5xl font-black text-white">{current.founderPrice}</span>
                  {current.founderApprox && (
                    <span className="text-xs font-bold text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">
                      {current.founderApprox}
                    </span>
                  )}
                </div>

                {current.expireText && (
                  <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="size-3.5 animate-pulse" />
                    <span>{current.expireText}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 pt-6">
                <ul className="space-y-3.5">
                  {current.features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-foreground/95">
                      <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href={current.checkoutHref}
                className="w-full flex h-13 items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <span>Profiter du Tarif Fondateur ({current.founderPrice})</span>
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
