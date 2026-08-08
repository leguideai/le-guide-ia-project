"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { UdemyHeader } from "@/components/udemy-header"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"
import { GraduationCap, UserCheck, Gift, ArrowRight, Sparkles, CheckCircle2, Calendar, Globe, Download } from "lucide-react"

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
      poster: "/hero_bootcamp.jpg",
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
      poster: "/images/bootcamp_business_poster.jpg",
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
      poster: "/images/initiation_free_poster.jpg",
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

      {/* Hero Section Adaptée aux 3 Formules de Bootcamp (Alignée Accueil Udemy) */}
      <section className="py-14 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          {/* Header Left-Aligned (Style Accueil Udemy) */}
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              CATALOGUE OFFICIEL DES BOOTCAMPS LE GUIDE IA
            </span>

            <h1 className="font-heading text-2xl md:text-4xl font-black text-foreground tracking-tight">
              Choisissez le Bootcamp adapté à votre profil et vos objectifs
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Sessions intensives en direct avec Alfred Dah (Auditeur CISA & Expert IA). Apprenez à intégrer l'IA dans votre quotidien professionnel.
            </p>
          </div>

          {/* Formula Selector Tabs (Left-Aligned, Horizontal Scroll Mobile) */}
          <div className="flex items-center justify-start gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedFormula("pro")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                selectedFormula === "pro"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              <GraduationCap className="size-4" />
              <span>Bootcamp IA Pro (99 000 FCFA)</span>
            </button>

            <button
              onClick={() => setSelectedFormula("business")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                selectedFormula === "business"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-lg scale-[1.02]"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              <UserCheck className="size-4" />
              <span>Bootcamp Business Exec (199 000 FCFA)</span>
            </button>

            <button
              onClick={() => setSelectedFormula("free")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                selectedFormula === "free"
                  ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg scale-[1.02]"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              <Gift className="size-4" />
              <span>Initiation Offerte (GRATUIT)</span>
            </button>
          </div>

          {/* Dynamic Active Formula Showcase Card with Official 3:4 Poster Image */}
          <motion.div
            key={selectedFormula}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl border-2 ${active.borderColor} bg-card/80 backdrop-blur-2xl p-6 md:p-10 shadow-2xl relative z-10`}
          >
            <div className="grid gap-8 lg:grid-cols-12 items-stretch">
              
              {/* Left Column: Details & Program Features */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                
                {/* Header Row */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
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

                    <div className="text-left sm:text-right shrink-0 bg-primary/5 border border-primary/20 px-4 py-2 rounded-2xl">
                      <div className="font-heading text-2xl md:text-3xl font-black text-primary">{active.price}</div>
                      <div className="text-[11px] text-muted-foreground">{active.approx}</div>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                      <Calendar className="size-3.5 text-primary" />
                      Session : 31 Août 2026
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                      <Globe className="size-3.5 text-emerald-400" />
                      100% En Ligne
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                      <Sparkles className="size-3.5 text-amber-400" />
                      Certificat Officiel
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/80">Ce qui est inclus dans cette formule :</h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs md:text-sm text-foreground/90">
                    {active.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Buttons Row (Spacious & Clean Layout) */}
                <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={active.href}
                    className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-extrabold px-6 py-3.5 text-xs md:text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-95 ${active.btnColor}`}
                  >
                    <span>{active.btnText}</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <a
                    href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                  >
                    <Download className="size-4" />
                    <span>Télécharger le programme (PDF)</span>
                  </a>
                </div>

              </div>

              {/* Right Column: Official 3:4 Poster Image Display */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="rounded-2xl border border-primary/30 bg-slate-950 p-3.5 shadow-2xl backdrop-blur-xl w-full max-w-[360px]">
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/40 shadow-xl bg-slate-900 group">
                    <img
                      src={active.poster}
                      alt={`Affiche Officielle ${active.title}`}
                      className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Grille Tarifs Complète (Uniquement pour les Bootcamps Payants Pro & Business Exec) */}
      {selectedFormula !== "free" && (
        <Pricing selectedFormula={selectedFormula} />
      )}

      {/* Témoignages des alumni */}
      <Testimonials />

      {/* Pied de Page / Footer officiel du site */}
      <CtaFooter hideCta={true} />

      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
