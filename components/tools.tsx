"use client"

import { motion } from "motion/react"

const tools = [
  {
    name: "ChatGPT",
    desc: "Pour rédiger, structurer, résumer, réfléchir, préparer vos documents et améliorer votre productivité.",
    logo: "/logos/chatgpt.png",
    bg: "bg-black ring-white/15",
  },
  {
    name: "Claude",
    desc: "Pour analyser des documents, améliorer la qualité des textes, structurer des idées complexes et produire des contenus solides.",
    logo: "/logos/claude.png",
    bg: "bg-white ring-black/10",
  },
  {
    name: "Gemini",
    desc: "Pour rechercher, comparer, travailler avec l'écosystème Google et exploiter les capacités multimodales.",
    logo: "/logos/gemini.png",
    bg: "bg-white ring-black/10",
  },
  {
    name: "Canva IA",
    desc: "Pour créer rapidement des visuels, présentations et supports professionnels.",
    logo: "/logos/canva.png",
    bg: "bg-white ring-black/10",
  },
]

export function Tools() {
  return (
    <section id="outils" className="relative border-y border-border/60 bg-card/20 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Les outils utilisés
          </span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Les outils que nous allons utiliser
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Pas de théorie inutile. Vous apprenez à utiliser concrètement les meilleurs outils du marché, adaptés à
            votre réalité africaine francophone.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:-translate-y-1"
            >
              <span
                className={`flex size-12 items-center justify-center overflow-hidden rounded-xl p-2 ring-1 ${t.bg}`}
              >
                <img
                  src={t.logo || "/placeholder.svg"}
                  alt={`Logo ${t.name}`}
                  className="size-full object-contain"
                />
              </span>
              <h3 className="font-heading text-lg font-bold">{t.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
