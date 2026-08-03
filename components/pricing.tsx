"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Check, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

function PricingCountdown() {
  const targetDate = new Date("2026-08-25T23:59:59Z").getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [expired, setExpired] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        setExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) return null

  if (expired) {
    return (
      <div className="text-xs font-bold text-rose-500 uppercase tracking-wider text-center mt-2">
        Offre expirée
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg bg-slate-900/60 p-3 border border-border flex justify-center gap-3">
      <div className="flex flex-col items-center">
        <span className="font-heading text-lg font-black text-amber-500">{timeLeft.days}</span>
        <span className="text-[8px] text-muted-foreground uppercase">J</span>
      </div>
      <div className="text-sm font-bold text-border/60 mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="font-heading text-lg font-black text-amber-500">{timeLeft.hours}</span>
        <span className="text-[8px] text-muted-foreground uppercase">H</span>
      </div>
      <div className="text-sm font-bold text-border/60 mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="font-heading text-lg font-black text-amber-500">{timeLeft.minutes}</span>
        <span className="text-[8px] text-muted-foreground uppercase">M</span>
      </div>
      <div className="text-sm font-bold text-border/60 mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="font-heading text-lg font-black text-amber-500">{timeLeft.seconds}</span>
        <span className="text-[8px] text-muted-foreground uppercase">S</span>
      </div>
    </div>
  )
}

export function Pricing() {
  const { t } = useLanguage()
  const features = t("pricing.features") || []

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("pricing.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("pricing.title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
          
          {/* Offre Fondateur */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border-2 border-amber-500 bg-card p-8 shadow-xl shadow-amber-500/5 flex flex-col justify-between"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-extrabold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow">
              <Sparkles className="size-3.5 fill-slate-950" />
              {t("pricing.founderCard.badge")}
            </div>

            <div>
              <div className="text-center mt-2 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-4xl font-black text-foreground">{t("pricing.founderCard.priceFcfa")}</div>
                  <div className="text-xl text-muted-foreground">/ {t("pricing.founderCard.priceUsd")}</div>
                </div>
                <div className="mt-2 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                  {t("pricing.founderCard.expireLabel")}
                </div>
                <PricingCountdown />
              </div>

              <div className="border-t border-border/80 pt-6">
                <ul className="space-y-3.5">
                  {features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-foreground/95">
                      <Check className="size-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={`https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Alfred, je souhaite profiter du Tarif Fondateur (149 000 FCFA / 262$) pour le Bootcamp PRO 2.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex h-12 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 text-sm transition-transform active:scale-95 shadow shadow-amber-500/10"
              >
                Profiter du Tarif Fondateur
              </a>
            </div>
          </motion.div>

          {/* Prix Standard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card/60 p-8 flex flex-col justify-between backdrop-blur-sm"
          >
            <div>
              <div className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest text-center mb-2">
                {t("pricing.standardCard.badge")}
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-4xl font-black text-muted-foreground">{t("pricing.standardCard.priceFcfa")}</div>
                  <div className="text-xl text-muted-foreground">/ {t("pricing.standardCard.priceUsd")}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t("pricing.standardCard.dateLabel")}
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <ul className="space-y-3.5">
                  {features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground/80">
                      <Check className="size-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={`https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Alfred, je souhaite réserver l'Accès Standard (249 000 FCFA / 438$) pour le Bootcamp PRO 2.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex h-12 items-center justify-center rounded-xl border border-border/80 hover:bg-card/80 text-foreground font-semibold px-6 text-sm transition-colors"
              >
                Choisir l'accès standard
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
