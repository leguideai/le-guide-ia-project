"use client"

import { motion } from "motion/react"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Problem() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <AlertTriangle className="size-4" />
            {t("problem.tag")}
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {t("problem.title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          <p>{t("problem.para1")}</p>
          <p className="border-l-2 border-primary pl-5 text-foreground">
            {t("problem.para2")}
          </p>
          <p>{t("problem.para3")}</p>
          <p className="flex items-center gap-3 font-semibold text-primary">
            <TrendingUp className="size-5 shrink-0" />
            {t("problem.para4")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
