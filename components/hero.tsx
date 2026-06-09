"use client"

import { motion } from "motion/react"
import { Gift, ArrowRight, Calendar, Zap } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pillars = [
  { label: "Apprenez l'IA", sub: "Prenez une longueur d'avance" },
  { label: "Travaillez mieux", sub: "Gagnez en productivité" },
  { label: "Gagnez plus", sub: "Créez de nouvelles opportunités" },
]

const stats = [
  { value: "5 jours", label: "100% gratuit" },
  { value: "4 outils", label: "ChatGPT · Claude · Gemini · Canva" },
  { value: "24–28 juin", label: "2026 · en ligne" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        {/* Left */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-primary" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            CHALLENGE IA GRATUIT · 24–28 JUIN 2026 · AFRIQUE FRANCOPHONE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Sans l&apos;IA, vous{" "}
            <span className="relative text-primary text-glow">prenez du retard.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Apprenez à utiliser l&apos;intelligence artificielle pour améliorer votre CV, optimiser votre profil
            LinkedIn, gagner du temps, créer du contenu, automatiser vos tâches et développer de nouvelles
            opportunités professionnelles.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 max-w-xl text-base leading-relaxed text-foreground/80 text-pretty"
          >
            Le Guide IA vous montre comment passer de la curiosité à la pratique, avec des démonstrations concrètes
            sur ChatGPT, Claude, Gemini et Canva IA.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#inscription"
              className={cn(buttonVariants({ size: "lg" }), "glow-blue h-12 px-7 text-base font-semibold")}
            >
              <Gift className="size-5" />
              Rejoindre le Challenge Gratuit
            </a>
            <a
              href="#programme"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-border bg-transparent px-7 text-base",
              )}
            >
              Voir le programme des 5 jours
              <ArrowRight className="size-4" />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Inscription gratuite · Aucune carte bancaire requise · Places limitées
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-8 border-t border-border/60 pt-6"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-heading text-2xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right - image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 glow-blue">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3eme%20publication%20LinkedIn-NSE5XzIHyhWO6urTB9qHZzI0VR3Psl.png"
              alt="Alfred Dah, fondateur de Le Guide IA"
              className="w-full"
            />
            {/* scan line */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-primary/25 to-transparent" />
            </div>
          </div>

          {/* floating badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur-md"
          >
            <Calendar className="size-5 text-accent" />
            <div>
              <div className="text-sm font-bold">Challenge gratuit</div>
              <div className="text-xs text-muted-foreground">24 – 28 juin 2026</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute -top-4 -right-3 flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/15 px-4 py-3 backdrop-blur-md"
          >
            <Zap className="size-5 text-primary" />
            <span className="text-sm font-semibold text-primary">100% Pratique</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Pillars strip */}
      <div className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <div className="font-heading text-lg font-bold text-primary">{p.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{p.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
