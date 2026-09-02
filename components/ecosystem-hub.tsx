"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { GraduationCap, BookOpen, Building2, UserCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export function EcosystemHub() {
  const pillars = [
    {
      id: "bootcamp-pro",
      title: "Bootcamp IA Carrière & Pros (99 000 FCFA)",
      subtitle: "15h de formation intensive pour salariés, cadres & professionnels",
      desc: "Boostez votre productivité et propulsez votre carrière avec l'IA. Du Lundi au Vendredi (19h-21h GMT) + Samedi (8h-13h GMT).",
      icon: GraduationCap,
      href: "/bootcamp",
      badge: "1ère Semaine du Mois",
      color: "from-blue-600/20 via-blue-500/5 to-transparent",
      borderColor: "border-blue-500/40",
      highlights: ["Pratique sur cas réels métiers", "Exercices & Ateliers en direct", "Certificat officiel d'accomplissement"]
    },
    {
      id: "bootcamp-business",
      title: "Bootcamp Exclusive Managers (149 000 FCFA)",
      subtitle: "15h pour dirigeants, managers & entrepreneurs",
      desc: "Structurez, automatisez et accélérez votre business avec l'IA. Du Lundi au Vendredi (19h-21h GMT) + Dimanche (16h-21h GMT).",
      icon: UserCheck,
      href: "/bootcamp",
      badge: "3ème Semaine du Mois",
      color: "from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent",
      borderColor: "border-[#D4AF37]/50",
      highlights: ["Automation & Workflows Business", "Modèles d'offres & E-marketing", "Certificat IA Exécutif vérifiable"]
    },
    {
      id: "resources",
      title: "Formations Vidéo & Ressources",
      subtitle: "Accès immédiat 24h/24, à vie",
      desc: "Une sélection de modules pré-enregistrés et une boîte à outils de prompts métiers testés pour automatiser vos tâches quotidiennes.",
      icon: BookOpen,
      href: "/formations",
      badge: "Catalogue Autonome",
      color: "from-slate-800/40 via-slate-900/60 to-transparent",
      borderColor: "border-slate-700/60",
      highlights: ["Vidéos explicatives avec accès à vie", "Prompts métiers prêts à l'emploi", "Mises à jour régulières"]
    },
    {
      id: "b2b",
      title: "Espace Entreprises (B2B)",
      subtitle: "Digitalisation, IA & E-Marketing",
      desc: "Accompagnement sur-mesure pour les entreprises : construction/refonte web, Google Workspace/Gemini, Copilot et visibilité numérique.",
      icon: Building2,
      href: "/entreprises",
      badge: "Offre B2B Sur-Mesure",
      color: "from-blue-900/20 via-slate-900 to-transparent",
      borderColor: "border-blue-500/30",
      highlights: ["Diagnostic de maturité en 2 min", "Formation intra-entreprise sur-mesure", "Devis qualifié personnalisé"]
    }
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="ecosysteme">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="size-3.5" />
            L'Écosystème LE GUIDE IA
          </span>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Des formations et services conçus pour votre montée en puissance
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Découvrez nos 4 piliers d'accompagnement pour particuliers, entrepreneurs et entreprises.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {pillars.map((p, idx) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * idx }}
                className={`rounded-3xl border ${p.borderColor} bg-gradient-to-br ${p.color} bg-card/70 p-8 flex flex-col justify-between space-y-8 backdrop-blur-xl shadow-xl group hover:border-foreground/30 transition-all`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="size-14 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground shadow-sm">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground bg-secondary px-3.5 py-1.5 rounded-full border border-border">
                      {p.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs font-semibold text-primary">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {p.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
                        <CheckCircle2 className={`size-4 shrink-0 ${p.id === "bootcamp-business" ? "text-[#D4AF37]" : "text-primary"}`} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-primary hover:underline group-hover:translate-x-1 transition-transform"
                  >
                    <span>Découvrir cette offre</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
