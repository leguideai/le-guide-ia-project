"use client"

import { motion } from "motion/react"
import { Users, CalendarDays, Cpu, Target } from "lucide-react"

const goals = [
  { icon: Users, value: "420", label: "Inscrits actuellement" },
  { icon: CalendarDays, value: "5 jours", label: "De formation pratique gratuite" },
  { icon: Cpu, value: "21 pays", label: "Déjà représentés parmi les inscrits" },
  { icon: Target, value: "1 000", label: "Objectif total de participants" },
]

export function Stats() {
  return (
    <section className="relative border-y border-border/60 bg-card/20 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <g.icon className="size-6" />
              </span>
              <div className="font-heading text-3xl font-extrabold text-glow text-foreground">{g.value}</div>
              <div className="text-sm text-muted-foreground">{g.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
