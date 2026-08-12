import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Cpu, Briefcase, Sparkles, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function UdemyTrustLogos() {
  const [activePillar, setActivePillar] = useState("all")
  const [dbTools, setDbTools] = useState<any[]>([])

  useEffect(() => {
    async function loadTools() {
      try {
        const { data } = await supabase.from("ai_tools").select("*").order("created_at", { ascending: true })
        if (data && data.length > 0) {
          setDbTools(data)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/tools")
        const data = await res.json()
        if (data?.tools && data.tools.length > 0) {
          setDbTools(data.tools)
        }
      } catch (e) {}
    }
    loadTools()
  }, [])

  const defaultTools = [
    {
      pillar: "models",
      pillarLabel: "Modèles IA & Raisonnement",
      name: "ChatGPT (OpenAI)",
      role: "Génération de texte, Prompt Engineering avancé, Personas & Assistants sur-mesure.",
      icon: "🤖",
      image: "/images/tools/chatgpt.png",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent"
    },
    {
      pillar: "models",
      pillarLabel: "Modèles IA & Raisonnement",
      name: "Claude (Anthropic)",
      role: "Rédaction complexe, analyse fine de documents, logique stratégique & synthèses.",
      icon: "🧠",
      image: "/images/tools/claude.png",
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent"
    },
    {
      pillar: "models",
      pillarLabel: "Modèles IA & Raisonnement",
      name: "Google Gemini",
      role: "Traitement multimodal, analyse d'images & intégration écosystème Workspace.",
      icon: "💎",
      image: "/images/tools/gemini.png",
      gradient: "from-sky-500/10 via-sky-500/5 to-transparent"
    }
  ]

  const pillars = [
    {
      id: "all",
      label: "Tous les Piliers",
      icon: Sparkles,
      count: `${dbTools.length > 0 ? dbTools.length : 6} Outils`
    }
  ]

  const toolArchitecture = dbTools.length > 0 ? dbTools.map((t: any) => ({
    pillar: "models",
    pillarLabel: t.category || "Outil IA",
    name: t.name,
    role: t.role || "Outil officiel certifié Le Guide IA",
    icon: t.icon || "⚡",
    image: t.image || "/images/tools/chatgpt.png",
    gradient: "from-primary/10 via-primary/5 to-transparent"
  })) : defaultTools

  const filteredTools = activePillar === "all" ? toolArchitecture : toolArchitecture.filter(t => t.pillar === activePillar)

  return (
    <section className="py-16 bg-slate-950/80 border-y border-border/60 relative overflow-hidden" id="outils">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8 relative z-10">
        
        {/* Header with Arrow Link (Udemy Style) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              NOS OUTILS IA
            </span>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Une architecture complète structurée pour transformer votre productivité au quotidien.
            </p>
          </div>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
          {pillars.map((p) => {
            const Icon = p.icon
            const isActive = activePillar === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{p.label}</span>
              
              </button>
            )
          })}
        </div>

        {/* Tools Grid — Scrollable on Mobile, Grid on Desktop */}
        <div className="flex overflow-x-auto md:overflow-visible snap-x no-scrollbar pt-3 pb-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0">
          {filteredTools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group relative z-10 hover:z-20 overflow-hidden shrink-0 w-[260px] sm:w-[300px] md:w-auto snap-center"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                
                {/* Official Brand Image Header */}
                <div className="w-full h-36 rounded-xl overflow-hidden border border-border/60 bg-white flex items-center justify-center relative group-hover:border-primary/40 transition-colors p-3 shadow-inner">
                  <img
                    src={tool.image || "/images/bootcamp_pro_thumb.jpg"}
                    alt={tool.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                  />
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold uppercase text-white bg-slate-950/90 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
                    {tool.pillarLabel}
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.role}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
