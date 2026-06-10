"use client"

import { motion } from "motion/react"
import { Video, MonitorPlay, Dumbbell, Users, FileCheck, Compass, ArrowUpRight } from "lucide-react"

const bonuses = [
  { icon: Video, text: "7 sessions pratiques en direct" },
  { icon: MonitorPlay, text: "Des démonstrations concrètes" },
  { icon: Dumbbell, text: "Des exercices simples à appliquer" },
  { icon: Users, text: "L'accès à la communauté WhatsApp" },
  { icon: FileCheck, text: "Des conseils pour votre CV et LinkedIn" },
  { icon: Compass, text: "Une méthode claire pour mieux utiliser l'IA" },
  { icon: ArrowUpRight, text: "Une orientation vers le Bootcamp PRO pour aller plus loin" },
]

export function Bonus() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">Vos bonus</span>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Ce que vous recevez en rejoignant le challenge
        </h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bonuses.map((b, i) => (
          <motion.div
            key={b.text}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={`flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-primary/40 ${
              i === 6 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <b.icon className="size-5" />
            </span>
            <span className="text-sm font-medium leading-snug">{b.text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
