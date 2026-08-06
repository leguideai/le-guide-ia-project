"use client"

import { useState } from "react"
import { SiteNav } from "@/components/site-nav"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { Cpu, Calculator, Sparkles, HelpCircle, Copy, Check, ArrowRight } from "lucide-react"

export default function OutilsIAPage() {
  const [activeTool, setActiveTool] = useState<"roi" | "prompt" | "quiz">("roi")

  // ROI Calculator State
  const [hoursPerWeek, setHoursPerWeek] = useState(15)
  const [hourlyRate, setHourlyRate] = useState(15000) // FCFA
  const gainPercentage = 0.4 // 40% time saved with AI
  const weeklyHoursSaved = Math.round(hoursPerWeek * gainPercentage)
  const monthlyMoneySaved = Math.round(weeklyHoursSaved * 4 * hourlyRate)

  // Prompt Generator State
  const [role, setRole] = useState("Marketing / Communication")
  const [task, setTask] = useState("Rédiger un plan de lancement de produit")
  const [copied, setCopied] = useState(false)

  const generatedPrompt = `Agis en tant qu'expert en ${role}. Ta mission est de ${task}.

Recommandations à suivre :
1. Adopte un ton professionnel, clair et percutant.
2. Inclus des exemples concrets adaptés au marché d'Afrique francophone.
3. Propose un plan d'action étape par étape avec des métriques mesurables.`

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <SiteNav />

      {/* Hero */}
      <section className="pt-36 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
          <Cpu className="size-3.5" />
          Outils IA Interactifs & Gratuits
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance max-w-4xl mx-auto">
          Mesurez votre potentiel et générez vos prompts en 2 clics
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-pretty">
          Des outils interactifs conçus pour vous aider à estimer votre gain de temps avec l'IA et accélérer votre productivité au quotidien.
        </p>

        {/* Tool Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveTool("roi")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "roi"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card/60 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Calculator className="size-4" />
            Calculateur ROI IA
          </button>

          <button
            onClick={() => setActiveTool("prompt")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === "prompt"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card/60 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Sparkles className="size-4" />
            Générateur de Prompts
          </button>
        </div>
      </section>

      {/* TOOL 1: ROI CALCULATOR */}
      {activeTool === "roi" && (
        <section className="py-8 px-4 md:px-8 max-w-3xl mx-auto">
          <div className="rounded-3xl border border-primary/30 bg-card/60 p-8 md:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
            <div className="space-y-2 text-center">
              <h2 className="font-heading text-xl font-bold text-foreground">Calculateur de Gain de Temps & d'Argent</h2>
              <p className="text-xs text-muted-foreground">Estimez combien d'heures et de FCFA l'IA peut vous faire économiser chaque mois.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Heures consacrées aux tâches répétitives par semaine</span>
                  <span className="text-primary font-mono">{hoursPerWeek}h / semaine</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Valeur de votre heure de travail (FCFA)</span>
                  <span className="text-primary font-mono">{hourlyRate.toLocaleString()} FCFA / h</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={50000}
                  step={2500}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold">Temps économisé</span>
                <p className="font-heading text-2xl md:text-3xl font-extrabold text-emerald-400">~{weeklyHoursSaved * 4}h / mois</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold">Valeur économisée</span>
                <p className="font-heading text-2xl md:text-3xl font-extrabold text-emerald-400">{monthlyMoneySaved.toLocaleString()} FCFA</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="/bootcamp"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold px-6 py-3 text-xs shadow-lg hover:opacity-90 transition-all"
              >
                <span>Concrétiser ce gain dans le Bootcamp PRO</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* TOOL 2: PROMPT GENERATOR */}
      {activeTool === "prompt" && (
        <section className="py-8 px-4 md:px-8 max-w-3xl mx-auto">
          <div className="rounded-3xl border border-primary/30 bg-card/60 p-8 md:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
            <div className="space-y-2 text-center">
              <h2 className="font-heading text-xl font-bold text-foreground">Générateur de Prompt Professionnel</h2>
              <p className="text-xs text-muted-foreground">Sélectionnez votre métier et votre objectif pour obtenir un prompt prêt à coller dans ChatGPT.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Votre Métier / Secteur</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Marketing / Communication">Marketing / Communication</option>
                  <option value="Ressources Humaines">Ressources Humaines</option>
                  <option value="Finance & Comptabilité">Finance & Comptabilité</option>
                  <option value="Entrepreneur / Direction">Entrepreneur / Direction</option>
                  <option value="Développeur / IT">Développeur / IT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Objectif de la tâche</label>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Generated Prompt Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground">Prompt généré :</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                >
                  {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Copié !" : "Copier le prompt"}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/40 p-4 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {generatedPrompt}
              </div>
            </div>
          </div>
        </section>
      )}

      <CtaFooter />
    </main>
  )
}
