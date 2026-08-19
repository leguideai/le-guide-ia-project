"use client"

import { motion } from "motion/react"
import { X, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function WhyBootcamp() {
  const { t } = useLanguage()
  const items = t("whyBootcamp.items") || []

  return (
    <section className="py-20 bg-background relative overflow-hidden" id="pour-quoi">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("whyBootcamp.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("whyBootcamp.title")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-10">
          
          {/* Sans le Bootcamp */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-6 md:p-8"
          >
            <h3 className="font-heading text-xl font-extrabold text-rose-500 flex items-center gap-2 mb-6">
              <span className="flex size-7 items-center justify-center rounded-full bg-rose-500/10">
                <X className="size-4" />
              </span>
              {t("whyBootcamp.sansLabel")}
            </h3>
            
            <ul className="space-y-4">
              {items.map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/80">
                  <X className="size-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item.sans}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Avec le Bootcamp */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-6 md:p-8 relative glow-blue shadow-xl"
          >
            <div className="absolute -top-3.5 right-6 rounded-full bg-primary px-3.5 py-1 text-[10px] font-extrabold text-primary-foreground uppercase tracking-wider shadow-md">
              Recommandé
            </div>
            
            <h3 className="font-heading text-xl font-extrabold text-primary flex items-center gap-2 mb-6">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/20">
                <Check className="size-4 text-primary" />
              </span>
              {t("whyBootcamp.avecLabel")}
            </h3>
            
            <ul className="space-y-4">
              {items.map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/90 font-medium">
                  <Check className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{item.avec}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
