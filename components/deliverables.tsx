"use client"

import { motion } from "motion/react"
import { ShieldCheck } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Deliverables() {
  const { t } = useLanguage()
  const items = t("deliverables.items") || []

  return (
    <section className="py-20 bg-card/10 relative overflow-hidden" id="livrables">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("deliverables.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("deliverables.title")}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border/80 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/50"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-4xl font-black text-muted-foreground/30 group-hover:text-primary/30 transition-colors">
                  {item.num}
                </span>
                <ShieldCheck className="size-5 text-primary opacity-45 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
