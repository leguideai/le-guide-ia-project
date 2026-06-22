"use client"

import { motion } from "motion/react"
import { Quote } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Authority() {
  const { t } = useLanguage()

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative order-1 mx-auto w-full max-w-md lg:order-1"
        >
          <div className="relative overflow-hidden p-6 rounded-2xl border border-primary/30 glow-blue bg-black/5">
            <img
              src="/profile_alfred.jpg"
              alt="Alfred Dah, fondateur de Le Guide IA, consultant IA & Transformation Digitale"
              className="w-full object-cover rounded-full bg-white border border-primary"
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-primary/25 to-transparent" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="order-2"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{t("authority.tag")}</span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Alfred Dah
          </h2>
          <div className="mt-2 space-y-1 text-base font-semibold text-primary">
            <p>{t("authority.founderTitle")}</p>
            <p>{t("authority.consultantTitle")}</p>
          </div>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            <p>{t("authority.desc1")}</p>
            <p>{t("authority.desc2")}</p>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <Quote className="size-6 shrink-0 text-primary" />
            <p className="font-heading text-lg font-bold text-foreground">
              {t("authority.quote")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
