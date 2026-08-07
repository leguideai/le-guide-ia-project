"use client"

import { Sparkles, GraduationCap, UserCheck, Gift, BookOpen, Building2, Zap, Compass } from "lucide-react"

interface SkillsBarProps {
  activeCategory: string
  onSelectCategory: (cat: string) => void
}

export function SkillsBar({ activeCategory, onSelectCategory }: SkillsBarProps) {
  const categories = [
    { id: "all", label: "Toutes nos formations", icon: Compass, count: "4 Formules" },
    { id: "pro", label: "Bootcamp IA Pro (99k)", icon: GraduationCap, count: "Direct Live 15h" },
    { id: "business", label: "Bootcamp IA Business (199k)", icon: UserCheck, count: "Exec & Coaching" },
    { id: "free", label: "Cours Offert (0 FCFA)", icon: Gift, count: "Initiation 100% Free" },
    { id: "resources", label: "Bibliothèque Prompts", icon: BookOpen, count: "40 Ressources" },
    { id: "b2b", label: "Entreprises & B2B", icon: Building2, count: "Sur-mesure" },
  ]

  return (
    <section className="w-full border-y border-border/70 bg-slate-950/60 backdrop-blur-xl sticky top-16 z-30 py-3.5 shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/40 scale-[1.02]"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40 hover:border-border"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  <div className="flex flex-col items-start text-left">
                    <span className="leading-none">{cat.label}</span>
                    <span className={`text-[9px] mt-0.5 font-normal opacity-80 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {cat.count}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-card/40 border border-border/40 px-3.5 py-2 rounded-xl shrink-0">
            <Zap className="size-3.5 text-amber-400 animate-pulse" />
            <span>Accès immédiat dès inscription</span>
          </div>

        </div>
      </div>
    </section>
  )
}
