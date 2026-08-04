"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

function CountdownTimer() {
  const { t } = useLanguage()
  // Target date is August 25, 2026 at 23:59:59 GMT
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
      <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center font-heading text-sm font-bold text-destructive">
        L'offre fondateur à 149 000 FCFA / 261,99$ est expirée.
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

  const badges = t("hero.badges") || []

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40" id="accueil">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        {/* Left */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
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

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            <a
              href={`https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Alfred, je souhaite rejoindre le Bootcamp PRO 2 (Offre Fondateur - 149 000 FCFA) et procéder au paiement.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none px-8 text-base shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
              )}
            >
              Je rejoins le Bootcamp PRO 2
            </a>
            <a
              href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-border/80 bg-transparent px-8 text-base hover:bg-card/50 text-foreground"
              )}
            >
              {t("hero.ctaProgram")}
              <ArrowRight className="size-4 ml-1" />
            </a>
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

        {/* Right - image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 glow-blue">
            <img
              src="/hero_bootcamp.jpg"
              alt="Affiche Officielle Le Guide IA - Bootcamp PRO 2"
              className="w-full h-auto rounded-2xl"
            />
          </div>

          {/* floating badge */}
          {/* <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur-md"
          >
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <div className="text-sm font-bold">100% Pratique & Intense</div>
              <div className="text-xs text-muted-foreground">Bootcamp PRO 2 en ligne</div>
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  )
}
