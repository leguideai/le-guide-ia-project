"use client"

import { motion } from "motion/react"
import { Check, ArrowRight } from "lucide-react"

const features = [
  "10 sessions premium",
  "Accompagnement plus structuré",
  "Cas pratiques",
  "Automatisation",
  "Stratégie IA appliquée",
  "Certificat de fin de parcours",
  "Accès à la communauté PRO",
]

export function Parcours() {
  return (
    <section id="parcours" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">Aller plus loin</span>
        <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Après le challenge : passez au niveau supérieur
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
          Le challenge gratuit vous donne les bases. Pour ceux qui veulent aller plus loin, Le Guide IA proposera un
          Bootcamp PRO premium pour transformer vos connaissances en résultats concrets et durables.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/40 bg-primary/5 glow-blue"
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="relative grid gap-8 p-8 sm:p-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              Bootcamp PRO
            </span>
            <h3 className="mt-4 font-heading text-2xl font-bold">Transformez vos connaissances en résultats.</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
            <div className="text-sm font-medium text-muted-foreground">Prix fondateur</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-4xl font-extrabold text-glow text-foreground">79 000</span>
              <span className="text-lg font-semibold">FCFA</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Prix standard&nbsp;:{" "}
              <span className="font-medium text-foreground/80 line-through">149 000 FCFA</span>
            </div>
            <a
              href="#inscription"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Je veux être informé
              <ArrowRight className="size-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Commencez par le challenge gratuit. L&apos;accès PRO est proposé ensuite.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
