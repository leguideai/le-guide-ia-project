"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Mail, CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/alfreddah/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@leguideai",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1crb38psK1/?mibextid=wwXIfr",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
]

function InlineCountdown() {
  const targetDate = new Date("2026-07-11T00:00:00Z").getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [expired, setExpired] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        setExpired(true)
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft({ days, hours, minutes })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted || expired) return null

  return (
    <span className="text-amber-500 font-bold ml-1">
      · Expire dans {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m
    </span>
  )
}

export function CtaFooter() {
  const { t } = useLanguage()

  return (
    <footer className="relative border-t border-border/60 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        
        {/* Section de Clôture Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#0D1B3E] border border-primary/20 p-8 sm:p-12 shadow-2xl"
        >
          {/* Logo en haut à gauche */}
          <div className="absolute top-6 left-6 flex items-center gap-2.5 z-20">
            <img
              src="/Logo%20avatar.png"
              alt="Logo Le Guide IA"
              className="size-8 rounded-lg object-cover"
            />
            <span className="font-heading text-base font-extrabold tracking-tight text-white">
              LE GUIDE <span className="text-primary">IA</span>
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center relative z-10 pt-8 lg:pt-0">
            {/* Left Content */}
            <div className="lg:col-span-8 text-left">
              <h2 className="font-heading text-2xl font-black leading-tight text-white sm:text-3xl max-w-2xl">
                "{t("ctaFooter.title")}"
              </h2>
              <p className="mt-4 text-sm text-slate-300 max-w-xl">
                {t("ctaFooter.desc")}
              </p>
              
              <div className="mt-8">
                <a
                  href="#tarifs"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none px-8 text-base shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
                  )}
                >
                  {t("ctaFooter.ctaPro")}
                </a>
                
                <div className="mt-4 text-xs text-slate-300 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-white">{t("ctaFooter.founderPrice")}</span>
                  <InlineCountdown />
                </div>

                {/* Checklist Badges */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    {t("pricing.features.5")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Accès immédiat au groupe WhatsApp
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Certificat officiel
                  </span>
                </div>
              </div>
            </div>

            {/* Right Image (Alfred Dah Portrait) */}
            <div className="lg:col-span-4 hidden lg:block relative">
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 glow-blue bg-slate-950/20 max-w-[280px] ml-auto">
                <img
                  src="/profile_alfred.jpg"
                  alt="Alfred Dah, fondateur de Le Guide IA"
                  className="w-full object-cover aspect-[4/5] object-top grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer info links */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-border/60 pt-8 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <a href="#" className="flex items-center gap-2.5">
              <img
                src="/Logo%20avatar.png"
                alt="Logo Le Guide IA"
                className="size-9 rounded-lg object-cover"
              />
              <span className="font-heading text-lg font-extrabold tracking-tight text-white">
                LE GUIDE <span className="text-primary">IA</span>
              </span>
            </a>
            <span className="text-xs text-muted-foreground">Alfred Dah</span>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground sm:items-end">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <a
                href="mailto:alfred@leguideai.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground text-xs"
              >
                <Mail className="size-4 text-primary" />
                alfred@leguideai.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          {t("ctaFooter.rights").replace("{year}", new Date().getFullYear().toString())}
        </p>
      </div>
    </footer>
  )
}
