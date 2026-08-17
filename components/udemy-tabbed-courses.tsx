"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Sparkles, Clock, BookOpen, Star, ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, ShieldCheck } from "lucide-react"
import { FormationItem, FormationCategory, DEFAULT_FORMATIONS, DEFAULT_FORMATION_CATEGORIES } from "@/lib/formations-data"

function getBadgeClasses(badge: string | undefined) {
  const b = badge?.toLowerCase() || ""
  if (b.includes("demande")) return "bg-rose-500/20 text-rose-300 border-rose-500/40"
  if (b.includes("seller") || b.includes("vente") || b.includes("populaire")) return "bg-amber-500/20 text-amber-300 border-amber-500/40"
  if (b.includes("nouveau")) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
  if (b.includes("prospect")) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
  return "bg-primary/20 text-primary border-primary/40"
}

function formatPriceNum(num: number): string {
  if (!num || num <= 0) return "GRATUIT"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA"
}

export function UdemyTabbedCourses() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [formations, setFormations] = useState<FormationItem[]>(DEFAULT_FORMATIONS)
  const [categories, setCategories] = useState<FormationCategory[]>(DEFAULT_FORMATION_CATEGORIES)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/formations")
        const data = await res.json()
        if (data?.formations && Array.isArray(data.formations) && data.formations.length > 0) {
          setFormations(data.formations)
        }
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
        }
      } catch (e) {
        console.warn("Failed to load formations for homepage:", e)
      }
    }
    loadData()
  }, [])

  const tabs = [
    { id: "all", label: "Toutes les Formations" },
    ...categories.map(c => ({ id: c.slug, label: c.label }))
  ]

  const filteredFormations = activeTab === "all" 
    ? formations 
    : formations.filter(f => 
        (f.category_slug && f.category_slug.toLowerCase() === activeTab.toLowerCase()) || 
        f.tool_icon?.toLowerCase() === activeTab.toLowerCase() || 
        f.slug?.includes(activeTab.toLowerCase())
      )

  const displayedFormations = filteredFormations.length > 0 ? filteredFormations : formations

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-12 md:py-16 bg-slate-950/70 border-t border-border/50 relative overflow-hidden" id="formations-videos">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8 relative z-10">
        
        {/* Header with Arrow Link & Carousel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-amber-400" />
             NOS FORMATIONS
            </span>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              Des formations vidéo autonomes avec accès immédiat 24h/24, à vie, et des prompts prêts à l'emploi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">

            <Link
              href="/formations"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2.5 rounded-xl transition-all group"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Tabbar Navigation Dynamique */}
        <div className="flex items-center gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-slate-950 border-primary font-black shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-card/40 border-border/60 text-slate-400 hover:bg-card/80 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Courses Marketplace Layout (Spacious Cards with 16/9 Thumbnail Covers) */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 pt-1 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible"
        >
          {displayedFormations.map((f) => (
            <Link
              key={f.id || f.slug}
              href={`/formations?buy=${f.slug}`}
              className="w-[300px] sm:w-[320px] md:w-auto shrink-0 snap-start rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-xl backdrop-blur-xl group cursor-pointer"
            >
              <div>
                {/* 1. Miniature / Poster 16/9 */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                  <img
                    src={f.thumbnail || "/images/formation_claude_thumb.jpg"}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                  {/* Badge de statut incrusté */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${getBadgeClasses(f.badge)}`}>
                      {f.badge || "Formation IA"}
                    </span>
                  </div>

                  {/* Durée incrustée */}
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-md px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                    <Clock className="size-3 text-primary" />
                    <span>{f.duration}</span>
                  </div>
                </div>

                {/* 2. Détails & Typographie Style Udemy */}
                <div className="p-4 sm:p-5 pb-0 mb-0 space-y-3">
                  {/* Titre */}
                  <h3 className="font-heading text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {f.title}
                  </h3>

                  {/* Formateur */}
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {f.instructor || "Alfred Dah · Expert IA & Productivité"}
                  </p>

                  {/* Note & Avis */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-black text-amber-400">4.9</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({f.reviews_count || "200+ avis"})
                    </span>
                  </div>

                  {/* Badges de Contenu */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {f.modules_count}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {f.prompts_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Bloc Prix & Action */}
              <div className="p-4 sm:p-5 sm:pt-0 pt-0 border-t border-slate-800/60 mt-0">
                <div className="flex items-baseline justify-between pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-lg sm:text-xl font-black text-white">
                      {formatPriceNum(f.price)}
                    </span>
                    {f.original_price && (
                      <span className="text-xs text-slate-500 line-through font-semibold">
                        {f.original_price}
                      </span>
                    )}
                  </div>
                </div>
                  <span className="text-xs font-bold text-primary flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Découvrir</span>
                    <ArrowRight className="size-3.5" />
                  </span>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
