"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Projection() {
  const { t } = useLanguage()
  const profiles = t("projection.profiles") || []

  return (
    <section className="py-20 bg-background relative overflow-hidden" id="projection">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("projection.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("projection.title")}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.map((p: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card/45 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                {p.icon}
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-3 flex items-center gap-1.5">
                {p.profile}
                <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
