"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

import { usePromoStatus } from "@/lib/use-promo"

function CountdownTimer() {
  const { t } = useLanguage()
  const { isExpired, timeLeft, mounted } = usePromoStatus()

  if (!mounted) return null

  if (isExpired) {
    return (
      <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center font-heading text-sm font-bold text-destructive">
        L'offre promo à 99 000 FCFA / 174 USD est expirée.
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-xl border border-border/80 bg-card/40 p-5 backdrop-blur-sm max-w-md">
      <div className="mb-3 text-sm font-bold text-muted-foreground flex items-center gap-2">
        <Sparkles className="size-4 text-primary animate-pulse" />
        {t("hero.countdownLabel")}
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="font-heading text-3xl font-black text-primary">{timeLeft.days}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Jours</span>
        </div>
        <div className="text-2xl font-bold text-border">:</div>
        <div className="flex flex-col items-center">
          <span className="font-heading text-3xl font-black text-primary">{timeLeft.hours}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Heures</span>
        </div>
        <div className="text-2xl font-bold text-border">:</div>
        <div className="flex flex-col items-center">
          <span className="font-heading text-3xl font-black text-primary">{timeLeft.minutes}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Min</span>
        </div>
        <div className="text-2xl font-bold text-border">:</div>
        <div className="flex flex-col items-center">
          <span className="font-heading text-3xl font-black text-primary">{timeLeft.seconds}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sec</span>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { t } = useLanguage()
  const { isExpired, mounted } = usePromoStatus()
  const promoActive = mounted ? !isExpired : true

  const badges = t("hero.badges") || []

  const waMessage = promoActive
    ? "Bonjour Alfred, je souhaite rejoindre le Bootcamp IA & Carrière (Offre Promo - 99 000 FCFA / environ 174 $  ) et procéder au paiement."
    : "Bonjour Alfred, je souhaite rejoindre le Bootcamp IA & Carrière (149 000 FCFA / environ 262 USD) et procéder au paiement."

  const ctaButtons = (
    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center w-full justify-center">
      <a
        href={`https://wa.me/22605050577?text=${encodeURIComponent(waMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none px-8 text-base shadow-lg shadow-amber-500/10 active:scale-95 transition-transform text-center justify-center"
        )}
      >
        Je rejoins le Bootcamp IA & Carrière
      </a>
      <a
        href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "h-12 border-border/80 bg-transparent px-8 text-base hover:bg-card/50 text-foreground text-center justify-center"
        )}
      >
        {t("hero.ctaProgram")}
        <ArrowRight className="size-4 ml-1" />
      </a>
    </div>
  )

  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-28 md:pb-16" id="accueil">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-2 lg:items-stretch">
        {/* Left (Desktop only text content) */}
        <div className="order-2 lg:order-1 hidden lg:flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary w-fit"
          >
            <Sparkles className="size-3.5" />
            <span>Co-créez votre avenir professionnel</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Badges Informatives */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 grid grid-cols-2 gap-3 max-w-md sm:grid-cols-4"
          >
            {badges.map((b: string, index: number) => (
              <div
                key={index}
                className="flex flex-col justify-center rounded-lg border border-border/80 bg-card/20 p-2.5 text-center backdrop-blur-sm"
              >
                <span className="text-xs font-bold text-foreground leading-tight">{b}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            {ctaButtons}
          </motion.div>

          {/* Countdown timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <CountdownTimer />
          </motion.div>
        </div>

        {/* Right - image & Mobile CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative order-1 lg:order-2 flex flex-col justify-center items-center h-full w-full"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 glow-blue h-full w-full flex items-center justify-center bg-card/20 p-1">
            <img
              src="/hero_bootcamp.jpg"
              alt="Affiche Officielle Le Guide IA - Bootcamp IA & Carrière"
              className="w-auto h-auto max-h-[75vh] lg:max-h-full max-w-full object-contain rounded-2xl"
            />
          </div>

          {/* Mobile CTA Buttons below Poster Image */}
          <div className="mt-6 w-full lg:hidden">
            {ctaButtons}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
