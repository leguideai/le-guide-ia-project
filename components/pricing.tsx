"use client"

import { motion } from "motion/react"
import { Check, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { usePromoStatus } from "@/lib/use-promo"
import { cn } from "@/lib/utils"

function CountdownTimerBoxes({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
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
  const { isExpired, timeLeft, mounted } = usePromoStatus()
  const features = t("pricing.features") || []

  // During SSR or before mount, default to standard non-expired state to avoid hydration mismatch
  const promoActive = mounted ? !isExpired : true

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
          
          {/* CARTE 1 : Offre Promo (99 000 FCFA) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
              "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
              promoActive
                ? "border-2 border-amber-500 bg-card shadow-xl shadow-amber-500/5"
                : "border border-border/50 bg-card/40 opacity-60 grayscale-[30%] select-none"
            )}
          >
            {/* Badge */}
            {promoActive ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-extrabold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow">
                <Sparkles className="size-3.5 fill-slate-950" />
                {t("pricing.founderCard.badge")}
              </div>
            ) : (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-destructive/15 border border-destructive/30 px-4 py-1 text-xs font-extrabold text-destructive uppercase tracking-widest flex items-center gap-1.5 shadow">
                <span className="size-2 rounded-full bg-destructive inline-block" />
                {t("pricing.founderCard.badgeExpired")}
              </div>
            )}

            <div>
              <div className="text-center mt-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    "text-4xl font-black transition-colors",
                    promoActive ? "text-foreground" : "text-muted-foreground/60 line-through"
                  )}>
                    {t("pricing.founderCard.priceFcfa")}
                  </div>
                  <div className={cn(
                    "text-sm rounded-full px-2.5 py-1 border transition-colors",
                    promoActive 
                      ? "text-muted-foreground bg-card/60 border-border/60" 
                      : "text-muted-foreground/40 bg-card/30 border-border/40 line-through"
                  )}>
                    ≈ {t("pricing.founderCard.priceUsd")}
                  </div>
                </div>

                {promoActive ? (
                  <>
                    <div className="mt-2 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                      {t("pricing.founderCard.expireLabel")}
                    </div>
                    {mounted && <CountdownTimerBoxes timeLeft={timeLeft} />}
                  </>
                ) : (
                  <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-center text-xs font-bold text-destructive">
                    {t("pricing.founderCard.expiredNotice")}
                  </div>
                )}
              </div>

              <div className={cn("border-t pt-6", promoActive ? "border-border/80" : "border-border/40")}>
                <ul className="space-y-3.5">
                  {features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className={cn(
                        "size-4.5 shrink-0 mt-0.5",
                        promoActive ? "text-amber-500" : "text-muted-foreground/40"
                      )} />
                      <span className={cn(promoActive ? "text-foreground/95" : "text-muted-foreground/60")}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              {promoActive ? (
                <a
                  href={`https://wa.me/22605050577?text=${encodeURIComponent("Bonjour Alfred, je souhaite profiter du Tarif Promo (99 000 FCFA / environ 174 $  ) pour le Bootcamp IA & Carrière.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex h-12 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 text-sm transition-transform active:scale-95 shadow shadow-amber-500/10"
                >
                  {t("pricing.founderCard.buttonText")}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full flex h-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground/60 font-semibold px-6 text-sm cursor-not-allowed pointer-events-none border border-border/40 select-none shadow-none"
                >
                  {t("pricing.founderCard.buttonExpiredText")}
                </button>
              )}
            </div>
          </motion.div>

          {/* CARTE 2 : Prix Normal (149 000 FCFA) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
              !promoActive
                ? "border-2 border-amber-500 bg-card shadow-xl shadow-amber-500/10"
                : "border border-border bg-card/60 backdrop-blur-sm"
            )}
          >
            {/* Badge */}
            {!promoActive ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-extrabold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow">
                <Sparkles className="size-3.5 fill-slate-950" />
                {t("pricing.standardCard.badgeActive")}
              </div>
            ) : (
              <div className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest text-center mb-2">
                {t("pricing.standardCard.badge")}
              </div>
            )}

            <div>
              <div className={cn("text-center mb-6", !promoActive && "mt-2")}>
                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    "text-4xl font-black transition-colors",
                    !promoActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {t("pricing.standardCard.priceFcfa")}
                  </div>
                  <div className="text-sm text-muted-foreground bg-card/60 border border-border/60 rounded-full px-2.5 py-1">
                    ≈ {t("pricing.standardCard.priceUsd")}
                  </div>
                </div>
                <div className={cn(
                  "mt-2 text-xs font-semibold uppercase tracking-wider",
                  !promoActive ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {!promoActive ? t("pricing.standardCard.activeLabel") : t("pricing.standardCard.dateLabel")}
                </div>
              </div>

              <div className="border-t border-border/60 pt-6">
                <ul className="space-y-3.5">
                  {features.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className={cn(
                        "size-4.5 shrink-0 mt-0.5",
                        !promoActive ? "text-amber-500" : "text-muted-foreground/60"
                      )} />
                      <span className={cn(!promoActive ? "text-foreground/95" : "text-muted-foreground/80")}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={`https://wa.me/22605050577?text=${encodeURIComponent("Bonjour Alfred, je souhaite réserver l'Accès Normal 149 000 FCFA pour le Bootcamp IA & Carrière.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full flex h-12 items-center justify-center rounded-xl font-bold px-6 text-sm transition-all active:scale-95",
                  !promoActive
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow shadow-amber-500/10"
                    : "border border-border/80 hover:bg-card/80 text-foreground"
                )}
              >
                {!promoActive ? t("pricing.standardCard.buttonActiveText") : t("pricing.standardCard.buttonText")}
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
