"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { GraduationCap, BookOpen, Building2, Cpu, Newspaper, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

export function EcosystemHub() {
  const pillars = [
    {
      id: "bootcamp",
      title: "Bootcamp PRO & Académie",
      subtitle: "Sessions intensives en direct & Certifications",
      desc: "Formations immersives de 7 jours avec Alfred Dah. Cas réels d'entreprises, ateliers pratiques et délivrance de certificats officiels.",
      icon: GraduationCap,
      href: "/bootcamp",
      badge: "Session 2 : 31 Août",
      color: "from-blue-500/20 via-primary/10 to-transparent",
      borderColor: "border-primary/40",
      highlights: ["7 Live sessions interactives", "Support WhatsApp 24/7", "Certificat officiel CISA & IA"]
    },
    {
      id: "resources",
      title: "Bibliothèque Premium",
      subtitle: "100+ Prompts, Templates & Modèles",
      desc: "Un coffre-fort numérique mis à jour chaque mois : templates de business plans, prompts ChatGPT optimisés, modèles de contrats et CV ATS.",
      icon: BookOpen,
      href: "/ressources",
      badge: "100+ Ressources",
      color: "from-purple-500/20 via-purple-500/5 to-transparent",
      borderColor: "border-purple-500/30",
      highlights: ["Prompts métiers prêts à l'emploi", "Templates DOCX & PDF", "Téléchargements illimités"]
    },
    {
      id: "b2b",
      title: "Espace Entreprises (B2B)",
      subtitle: "Formations d'Équipe & Audits IA",
      desc: "Accompagnement sur-mesure pour les entreprises, PME, ONG et universités. Montez vos collaborateurs en compétences et auditez vos workflows.",
      icon: Building2,
      href: "/entreprises",
      badge: "Sur-Mesure",
      color: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/30",
      highlights: ["Programmes intra-entreprise", "Audit de sécurité & CISA", "Devis personnalisé sous 24h"]
    },
    {
      id: "tools",
      title: "Outils IA Interactifs",
      subtitle: "Générateurs & Calculateur ROI",
      desc: "Bénéficiez de 6 outils gratuits en ligne : testez votre niveau IA, calculez votre gain de productivité et générez vos prompts personnalisés en 2 clics.",
      icon: Cpu,
      href: "/outils-ia",
      badge: "Gratuit & En ligne",
      color: "from-amber-500/20 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/30",
      highlights: ["Calculateur ROI Gain de temps", "Quiz de niveau personnalisé", "Générateur de Prompts Métiers"]
    },
    {
      id: "media",
      title: "Centre de Connaissances",
      subtitle: "Blog, Replays & Veille IA",
      desc: "Le média de référence sur l'Intelligence Artificielle en Afrique francophone. Tutoriels pas-à-pas, actualités stratégiques et webinaires mensuels.",
      icon: Newspaper,
      href: "/blog",
      badge: "Actualités & Média",
      color: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      borderColor: "border-cyan-500/30",
      highlights: ["Tutoriels guidés par niveau", "Replays de Webinaires", "Newsletter hebdomadaire"]
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
            Une plateforme complète pour vous former, produire et performer
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Découvrez nos 5 espaces thématiques conçus pour répondre à tous vos besoins en Intelligence Artificielle.
          </p>
        </div>

        {/* 5 Pillars Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          
          {/* Main Hero Card: Bootcamp PRO (Spans 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card/80 to-card p-8 md:p-10 flex flex-col justify-between space-y-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-primary/60 transition-all"
          >
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="size-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shadow-inner">
                  <GraduationCap className="size-7" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                  {pillars[0].badge}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {pillars[0].title}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-primary/90">
                  {pillars[0].subtitle}
                </p>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {pillars[0].desc}
              </p>

              <ul className="space-y-2 pt-2">
                {pillars[0].highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 relative z-10">
              <Link
                href={pillars[0].href}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-3 text-xs md:text-sm shadow-lg active:scale-95 transition-all"
              >
                <span>Découvrir le Bootcamp PRO</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Side Card: Bibliothèque Premium (Spans 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-card/80 to-card p-8 flex flex-col justify-between space-y-6 backdrop-blur-xl shadow-xl group hover:border-purple-500/50 transition-all"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="size-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <BookOpen className="size-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {pillars[1].badge}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  {pillars[1].title}
                </h3>
                <p className="text-xs font-semibold text-purple-300">
                  {pillars[1].subtitle}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {pillars[1].desc}
              </p>

              <ul className="space-y-2 pt-1">
                {pillars[1].highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
                    <CheckCircle2 className="size-3.5 text-purple-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={pillars[1].href}
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors group-hover:translate-x-1 transition-transform"
            >
              <span>Accéder à la Bibliothèque</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>

          {/* Bottom 3 Cards (4 cols each) */}
          {pillars.slice(2).map((p, idx) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (idx + 2) }}
                className={`lg:col-span-4 rounded-3xl border ${p.borderColor} bg-gradient-to-br ${p.color} bg-card/60 p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl shadow-lg group hover:border-foreground/30 transition-all`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-11 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
                      {p.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <Link
                  href={p.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline group-hover:translate-x-1 transition-transform pt-2 border-t border-border/40"
                >
                  <span>Explorer cet espace</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            )
          })}

        </div>

      </div>
    </section>
  )
}
