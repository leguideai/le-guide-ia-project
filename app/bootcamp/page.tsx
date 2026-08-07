"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { UdemyHeader } from "@/components/udemy-header"
import { Program } from "@/components/program"
import { Pricing } from "@/components/pricing"
import { Deliverables } from "@/components/deliverables"
import { Projection } from "@/components/projection"
import { Authority } from "@/components/authority"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"
import { GraduationCap, UserCheck, Gift, ArrowRight, Sparkles, CheckCircle2, Calendar, Globe } from "lucide-react"

export default function BootcampPage() {
  const [selectedFormula, setSelectedFormula] = useState<"pro" | "business" | "free">("pro")

  const formulas = {
    pro: {
      title: "Bootcamp IA Pro",
      subtitle: "Pour Salariés, Cadres & Professionnels",
      price: "99 000 FCFA",
      approx: "≈ 150 € / $165",
      badge: "Formule Pro · 1ère Semaine du Mois",
      icon: GraduationCap,
      href: "/checkout/bootcamp-ia-pro",
      btnText: "Réserver le Bootcamp IA Pro (99 000 FCFA)",
      btnColor: "bg-primary text-primary-foreground hover:opacity-90",
      borderColor: "border-primary/50",
      features: [
        "7 Sessions intensives en direct live avec Alfred Dah",
        "Créneaux : Lun-Ven 19h-21h GMT + Samedi 8h-13h GMT",
        "Accès à l'Espace Membre & Replays vidéo HD",
        "Maîtrise de ChatGPT, Claude, Gemini, Perplexity & NotebookLM",
        "Introduction à l'automatisation Make & workflows de travail",
        "Certificat d'accomplissement officiel individuel avec identifiant unique",
        "Facture d'achat automatique conformes pour entreprise"
      ]
    },
    business: {
      title: "Bootcamp IA Business Exec",
      subtitle: "Pour Dirigeants, Consultants & Entrepreneurs",
      price: "199 000 FCFA",
      approx: "≈ 300 € / $330",
      badge: "Formule Exec · 3ème Semaine du Mois",
      icon: UserCheck,
      href: "/checkout/bootcamp-ia-business",
      btnText: "Réserver le Bootcamp Business (199 000 FCFA)",
      btnColor: "bg-amber-500 hover:bg-amber-400 text-slate-950",
      borderColor: "border-amber-500/50",
      features: [
        "15h de sessions orientées Business Model, Offres & Sales IA",
        "Inclus l'intégralité du programme Bootcamp IA Pro",
        "Session de Coaching Stratégique VIP 1h individuelle avec Alfred Dah",
        "Modèles de Business Plans & Workflows d'Agents IA Autonomes",
        "Intégration d'assistants virtuels Make & n8n pour le service client",
        "Certificat d'accomplissement Exec & attestation de compétence",
        "Facture d'achat d'entreprise conforme & déductible"
      ]
    },
    free: {
      title: "Initiation IA & ChatGPT",
      subtitle: "Pour Découvrir les Règles du Prompting",
      price: "GRATUIT",
      approx: "Libre accès",
      badge: "Cours Offert · 100% Gratuit",
      icon: Gift,
      href: "/register-account",
      btnText: "Créer mon compte & Accéder gratuitement",
      btnColor: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
      borderColor: "border-emerald-500/50",
      features: [
        "Cours d'introduction pratique en accès immédiat dans l'Espace Membre",
        "Découverte des fondamentaux du Prompt Engineering",
        "Guide des 10 meilleurs cas d'usage de ChatGPT en entreprise",
        "Accès aux fiches PDF d'initiation téléchargeables",
        "Communauté ouverte WhatsApp des apprenants"
      ]
    }
  }

  const active = formulas[selectedFormula]

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <UdemyHeader />

      {/* Hero Section Adaptée aux 3 Formules de Bootcamp */}
      <section className="pt-8 pb-16 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              Catalogue Officiel des Bootcamps LE GUIDE IA
            </span>

            <h1 className="font-heading text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              Choisissez le Bootcamp adapté à votre profil et vos objectifs
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Sessions intensives en direct avec Alfred Dah (Auditeur CISA & Expert IA). Apprenez à intégrer l'IA dans votre quotidien professionnel.
            </p>
          </div>

          {/* Formula Selector Tabs */}
          <div className="flex justify-center border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-card/60 border border-border backdrop-blur-xl">
              <button
                onClick={() => setSelectedFormula("pro")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFormula === "pro"
                    ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <GraduationCap className="size-4" />
                <span>Bootcamp IA Pro (99 000 FCFA)</span>
              </button>

              <button
                onClick={() => setSelectedFormula("business")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFormula === "business"
                    ? "bg-amber-500 text-slate-950 shadow-lg scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <UserCheck className="size-4" />
                <span>Bootcamp Business Exec (199 000 FCFA)</span>
              </button>

              <button
                onClick={() => setSelectedFormula("free")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFormula === "free"
                    ? "bg-emerald-500 text-slate-950 shadow-lg scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Gift className="size-4" />
                <span>Initiation Offerte (GRATUIT)</span>
              </button>
            </div>
          </div>

          {/* Dynamic Active Formula Showcase Card */}
          <motion.div
            key={selectedFormula}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl border-2 ${active.borderColor} bg-card/80 backdrop-blur-2xl p-6 md:p-10 shadow-2xl max-w-4xl mx-auto space-y-6`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {active.badge}
                </span>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-foreground pt-1">
                  {active.title}
                </h2>
                <p className="text-xs text-muted-foreground font-semibold">
                  {active.subtitle}
                </p>
              </div>

              <div className="text-left md:text-right shrink-0">
                <div className="font-heading text-3xl font-black text-primary">{active.price}</div>
                <div className="text-xs text-muted-foreground">{active.approx}</div>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/80">Ce qui est inclus dans cette formule :</h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs md:text-sm text-foreground/90">
                {active.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" />
                  <span>Prochaine session : 31 Août 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="size-4 text-emerald-400" />
                  <span>100% En Ligne</span>
                </div>
              </div>

              <Link
                href={active.href}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl font-extrabold px-8 py-3.5 text-xs md:text-sm shadow-xl transition-all ${active.btnColor}`}
              >
                <span>{active.btnText}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Programme détaillé des 7 modules */}
      <Program />

      {/* Ce que vous obtenez & Certifications */}
      <Deliverables />

      {/* Projections de carrière */}
      <Projection />

      {/* Formateur : Alfred Dah */}
      <Authority />

      {/* Grille Tarifs Complète */}
      <Pricing />

      {/* Témoignages des alumni */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
