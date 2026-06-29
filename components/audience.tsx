"use client"

import { motion } from "motion/react"
import { Briefcase, Rocket, Building2, Search } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const icons = [Briefcase, Rocket, Building2, Search]

export function Audience() {
  const { t } = useLanguage()
  const translatedProfiles = (t("audience.profiles") || []) as Array<{ title: string; desc: string }>
  const profiles = translatedProfiles.map((p, i) => ({
    ...p,
    icon: icons[i] || Briefcase,
  }))

  return (
    <section id="audience" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{t("audience.tag")}</span>
        <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("audience.title")}
        </h2>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:-translate-y-1.5"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <p.icon className="size-6" />
            </span>
            <h3 className="font-heading text-lg font-bold">{p.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
