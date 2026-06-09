"use client"

import { motion } from "motion/react"
import { AlertTriangle, TrendingUp } from "lucide-react"

export function Problem() {
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
            Le constat
          </span>
          <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Aujourd&apos;hui, l&apos;IA n&apos;est plus une option.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          <p>
            Pendant que certains utilisent encore l&apos;IA comme un simple gadget, d&apos;autres s&apos;en servent
            déjà pour rédiger plus vite, mieux présenter leur profil, préparer leurs candidatures, créer du contenu,
            automatiser des tâches et développer leur activité.
          </p>
          <p className="border-l-2 border-primary pl-5 text-foreground">
            Le vrai problème n&apos;est pas l&apos;intelligence artificielle. Le vrai problème, c&apos;est de ne pas
            savoir l&apos;utiliser correctement.
          </p>
          <p>
            Vous avez peut-être déjà essayé ChatGPT ou Gemini. Mais si vos résultats sont moyens, ce n&apos;est pas
            forcément parce que l&apos;outil est limité. C&apos;est souvent parce que la méthode n&apos;est pas bonne.
          </p>
          <p className="flex items-center gap-3 font-semibold text-primary">
            <TrendingUp className="size-5 shrink-0" />
            Le Guide IA est là pour corriger cela.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
