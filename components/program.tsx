"use client"

import { motion } from "motion/react"
import { Lightbulb, FileText, Zap, Palette, Rocket } from "lucide-react"

const days = [
  {
    icon: Lightbulb,
    day: "Jour 1",
    title: "Comprendre l'IA sans jargon",
    desc: "Découvrez ce que l'IA peut vraiment faire pour vous, comment poser de meilleures demandes et comment éviter les erreurs courantes.",
  },
  {
    icon: FileText,
    day: "Jour 2",
    title: "CV & LinkedIn à l'ère de l'IA",
    desc: "Rendez votre CV plus clair et plus professionnel, lisible par les recruteurs comme par les outils modernes. Optimisez votre profil LinkedIn pour devenir plus visible.",
  },
  {
    icon: Zap,
    day: "Jour 3",
    title: "Productivité & automatisation",
    desc: "Utilisez l'IA pour gagner du temps, organiser vos idées, rédiger plus vite, préparer vos documents et automatiser certaines tâches répétitives.",
  },
  {
    icon: Palette,
    day: "Jour 4",
    title: "Création de contenu & visuels pros",
    desc: "Utilisez ChatGPT, Claude et Canva IA pour créer des posts, présentations, visuels, scripts vidéo et contenus professionnels.",
  },
  {
    icon: Rocket,
    day: "Jour 5",
    title: "Passer à l'action",
    desc: "Construisez votre plan IA personnel : comment intégrer l'IA dans votre carrière, vos études, votre activité ou votre entreprise.",
  },
]

export function Program() {
  return (
    <section id="programme" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Le Programme</span>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Le programme du Challenge IA Gratuit
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            5 jours, 5 cas d&apos;usage concrets. Une démonstration en direct et une méthode applicable
            immédiatement, chaque jour.
          </p>
        </motion.div>

        {/* Futuristic ascending timeline */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* vertical track */}
          <div
            className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-t from-primary/5 via-primary/30 to-primary/60 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />
          {/* animated rising glow */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ originY: 1 }}
            className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-t from-primary via-primary to-transparent shadow-[0_0_12px_2px] shadow-primary/50 md:left-1/2 md:-translate-x-1/2"
            aria-hidden="true"
          />

          <ul className="space-y-10">
            {days.map((d, i) => {
              const left = i % 2 === 0
              return (
                <motion.li
                  key={d.day}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative pl-16 md:grid md:grid-cols-2 md:gap-x-12 md:pl-0"
                >
                  {/* node on the track */}
                  <span className="absolute left-6 top-5 z-10 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_20px] shadow-primary/30 md:left-1/2">
                    <span className="absolute inset-0 animate-ping rounded-full border border-primary/30" aria-hidden="true" />
                    <d.icon className="size-5" />
                  </span>

                  {/* card */}
                  <div
                    className={`group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:-translate-y-1 ${
                      left ? "md:col-start-1 md:mr-8 md:text-right" : "md:col-start-2 md:ml-8"
                    }`}
                  >
                    <div
                      className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary/70">
                      {d.day}
                    </span>
                    <h3 className="mt-2 font-heading text-lg font-bold">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.desc}</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>

          {/* summit marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mt-10 flex flex-col items-center text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_28px] shadow-primary/50">
              <Rocket className="size-7" />
            </span>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
              5 jours pour passer de spectateur à acteur de l&apos;IA. À la fin, vous repartez avec un plan
              concret prêt à appliquer.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="#inscription"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 text-base font-semibold text-primary-foreground glow-blue transition-opacity hover:opacity-90"
          >
            Rejoindre le Challenge Gratuit
          </a>
        </motion.div>
      </div>
    </section>
  )
}
