"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { Users, CalendarDays, Cpu, Target } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Stats() {
  const { t, language } = useLanguage()
  const [inscritsNum, setInscritsNum] = useState<number | null>(null)
  const [countriesNum, setCountriesNum] = useState<number | null>(null)

  const goals = [
    { icon: Users, value: "...", label: t("stats.registered") },
    { icon: CalendarDays, value: language === "fr" ? "5 jours" : "5 days", label: t("stats.registeredLabel") },
    { icon: Cpu, value: "...", label: t("stats.representedLabel") },
    { icon: Target, value: "1 000", label: t("stats.targetLabel") },
  ]

  useEffect(() => {
    let cancelled = false
    fetch("/api/kpi/inscrits")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d?.count != null) {
          // Minimum 450 inscrits
          const count = Math.max(450, Number(d.count))
          setInscritsNum(count)
        }
        if (d?.countriesCount != null) {
          const countries = Number(d.countriesCount)
          if (!Number.isNaN(countries)) {
            setCountriesNum(countries)
          }
        }
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <g.icon className="size-6" />
              </span>
              <div className="font-heading text-3xl font-extrabold text-glow text-foreground">
                {i === 0 && inscritsNum != null ? (
                  <AnimatedNumber value={inscritsNum} duration={1500} lang={language} />
                ) : i === 2 && countriesNum != null ? (
                  <AnimatedNumber value={countriesNum} duration={1500} suffix={t("stats.countriesSuffix")} lang={language} />
                ) : (
                  g.value
                )}
              </div>
              <div className="text-sm text-muted-foreground">{g.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedNumber({ value, duration = 1000, suffix = "", lang = "fr" }: { value: number; duration?: number; suffix?: string; lang?: string }) {
  const [display, setDisplay] = useState<number>(0)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef<number>(0)

  useEffect(() => {
    let raf = 0
    startRef.current = null
    fromRef.current = 0
    setDisplay(0)

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(1, elapsed / duration)
      const next = Math.round(fromRef.current + (value - fromRef.current) * easeOutCubic(progress))
      setDisplay(next)
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      {new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(display)}{suffix}
    </motion.span>
  )
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
