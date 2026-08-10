"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Check, Sparkles, ArrowRight, Clock } from "lucide-react"

interface PricingProps {
  selectedFormula?: "pro" | "business" | "free"
}

export function Pricing({ selectedFormula = "pro" }: PricingProps) {
  const content = {
    pro: {
      title: "Bootcamp IA Pro",
      subtitle: "Pour Salariés, Cadres & Professionnels",
      founderPrice: "149 000 FCFA",
      founderApprox: "≈ 150 € / $165",
      standardPrice: "250 000 FCFA",
      standardApprox: "≈ 228 € / $250",
      expireText: "OFFRE EXPIRE LE 20 AOÛT 2026 À MINUIT GMT",
      targetDateIso: "2026-08-20T23:59:59Z",
      standardDateText: "À partir du 21 Août 2026",
      checkoutHref: "/checkout/bootcamp-ia-pro",
      features: [
        "7 sessions premium en direct live avec Alfred Dah",
        "Créneaux : Lun-Ven 19h-21h GMT + Samedi 8h-13h GMT",
        "Replays vidéo HD téléchargeables sous 12h",
        "Exercices pratiques & Ateliers en direct",
        "Groupe WhatsApp privé d'entraide",
        "Certificat officiel Le Guide IA individuel et vérifiable",
        "Garantie satisfait ou remboursé (sous conditions)"
      ]
    },
    business: {
      title: "Bootcamp IA Business Exec",
      subtitle: "Pour Dirigeants, Consultants & Entrepreneurs",
      founderPrice: "199 000 FCFA",
      founderApprox: "≈ 300 € / $330",
      standardPrice: "299 000 FCFA",
      standardApprox: "≈ 380 € / $420",
      expireText: "OFFRE EXPIRE LE 10 SEPTEMBRE 2026 À MINUIT GMT",
      targetDateIso: "2026-09-10T23:59:59Z",
      standardDateText: "À partir du 11 Septembre 2026",
      checkoutHref: "/checkout/bootcamp-ia-business",
      features: [
        "15h de sessions orientées Business & Automation",
        "Créneaux : Lun-Ven 19h-21h GMT + Dimanche 16h-21h GMT",
        "Inclus tout le programme Pro + Coaching 1h individuel",
        "Modèles de Business Plans & Workflows d'Agents IA",
        "Accès Espace Membre & Bibliothèque Premium de Prompts",
        "Certificat IA Business vérifiable + Facture d'entreprise",
        "Garantie satisfait ou remboursé (sous conditions)"
      ]
    },
    free: {
      title: "Initiation IA & ChatGPT",
      subtitle: "Pour Découvrir les Règles du Prompting",
      founderPrice: "GRATUIT",
      founderApprox: "Libre accès",
      standardPrice: "0 FCFA",
      standardApprox: "Libre accès",
      expireText: "",
      targetDateIso: "",
      standardDateText: "Accès Libre & permanent 24h/7j",
      checkoutHref: "/register-account",
      features: [
        "Cours d'introduction pratique en accès immédiat dans l'Espace Membre",
        "Découverte des fondamentaux du Prompt Engineering",
        "Guide des 10 meilleurs cas d'usage de ChatGPT en entreprise",
        "Accès aux fiches PDF d'initiation téléchargeables",
        "Communauté ouverte WhatsApp des apprenants"
      ]
    }
  }

  const activeKey = selectedFormula === "free" ? "free" : selectedFormula === "business" ? "business" : "pro"
  const current = content[activeKey]

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
  }, [activeKey, current.targetDateIso])

  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/50" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Left-Aligned Header (Matching Homepage Udemy Aesthetic) */}
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
            key={`founder-${activeKey}`}
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
                  <span className="text-xs font-bold text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">
                    {current.founderApprox}
                  </span>
                </div>

                {activeKey !== "free" && (
                  <>
                    <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center justify-center gap-1.5 pt-1">
                      <Clock className="size-3.5 animate-pulse" />
                      <span>{current.expireText}</span>
                    </div>

                    {/* Live Countdown Timer Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-3 max-w-xs mx-auto">
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2 text-center">
                        <div className="text-lg font-black text-amber-400">{timeLeft.days}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">J</div>
                      </div>
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2 text-center">
                        <div className="text-lg font-black text-amber-400">{timeLeft.hours}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">H</div>
                      </div>
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2 text-center">
                        <div className="text-lg font-black text-amber-400">{timeLeft.minutes}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">M</div>
                      </div>
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-2 text-center">
                        <div className="text-lg font-black text-amber-400">{timeLeft.seconds}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">S</div>
                      </div>
                    </div>
                  </>
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
            key={`standard-${activeKey}`}
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
                  <span className="text-xs text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">
                    {current.standardApprox}
                  </span>
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
                <span>{activeKey === "free" ? "S'inscrire gratuitement" : `Choisir l'accès standard (${current.standardPrice})`}</span>
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
