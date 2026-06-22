"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Promise() {
  const { t } = useLanguage()
  const benefits = (t("promise.benefits") || []) as string[]

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{t("promise.tag")}</span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {t("promise.title")}
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            <p>{t("promise.para1")}</p>
            <p>{t("promise.para2")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-primary/30 bg-card p-8 glow-blue"
        >
          <h3 className="font-heading text-lg font-bold">{t("promise.listTitle")}</h3>
          <ul className="mt-6 space-y-4">
            {benefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3 text-sm leading-relaxed"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Check className="size-3.5" />
                </span>
                {b}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
