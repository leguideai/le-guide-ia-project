"use client"

import { motion } from "motion/react"
import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Differentiators() {
  const { t } = useLanguage()
  const items = t("differentiators.items") || []

  return (
    <section className="py-20 bg-background relative overflow-hidden" id="differenciation">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("differentiators.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("differentiators.title")}
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl border border-border bg-card/25 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <CheckCircle className="size-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-heading text-base font-bold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
