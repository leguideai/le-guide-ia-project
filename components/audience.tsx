"use client"

import { motion } from "motion/react"
import { GraduationCap, Search, Briefcase, Rocket, Building2 } from "lucide-react"

const audiences = [
  {
    icon: GraduationCap,
    title: "Étudiant",
    desc: "Vous voulez mieux apprendre, mieux rédiger, mieux préparer votre avenir et développer des compétences recherchées.",
  },
  {
    icon: Search,
    title: "Chercheur d'emploi",
    desc: "Vous voulez améliorer votre CV, votre profil LinkedIn et votre visibilité professionnelle.",
  },
  {
    icon: Briefcase,
    title: "Professionnel",
    desc: "Vous voulez gagner du temps, devenir plus productif et rester compétitif dans un monde qui change vite.",
  },
  {
    icon: Rocket,
    title: "Entrepreneur",
    desc: "Vous voulez utiliser l'IA pour créer du contenu, mieux communiquer, mieux vendre et structurer votre activité.",
  },
  {
    icon: Building2,
    title: "Dirigeant ou manager",
    desc: "Vous voulez comprendre comment l'IA peut devenir un levier stratégique pour votre organisation.",
  },
]

export function Audience() {
  return (
    <section id="audience" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">Pour qui ?</span>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Ce challenge est fait pour vous si vous êtes :
        </h2>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:-translate-y-1.5 ${
              i === 4 ? "lg:col-span-1 sm:col-span-2" : ""
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <a.icon className="size-7" />
            </span>
            <h3 className="font-heading text-xl font-bold">{a.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
