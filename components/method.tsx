"use client"

import { motion } from "motion/react"
import { Brain, Play, Settings2, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const stepIcons = [Brain, Play, Settings2, TrendingUp]

export function Method() {
  const { t } = useLanguage()

  const translatedSteps = (t("method.steps") || []) as Array<{ title: string; desc: string }>
  const steps = translatedSteps.map((s, i) => ({
    ...s,
    icon: stepIcons[i] || Brain,
  }))

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">{t("method.tag")}</span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {t("method.title")}
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            {t("method.desc")}
          </p>
        </motion.div>

        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <s.icon className="size-6" />
                </span>
                <span className="font-heading text-3xl font-extrabold text-primary/20">{i + 1}</span>
              </div>
              <h3 className="font-heading text-lg font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
