"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Clock, ArrowRight, CheckCircle2, User, Sparkles } from "lucide-react"

export function UdemyTabbedCourses() {
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "Tous les cours" },
    { id: "bootcamps", label: "Bootcamps Live 15h" },
    { id: "free", label: "Cours Offerts (0 FCFA)" },
    { id: "prompts", label: "Bibliothèque Prompts" },
  ]

  const courses = [
    {
      id: "bootcamp-ia-pro",
      type: "bootcamps",
      title: "Bootcamp IA Pro — Direct Live 15h & Replays HD",
      subtitle: "ChatGPT Pro, Claude 3.5, Midjourney v6, Canva IA & Automatisation Make.",
      instructor: "Alfred Dah",
      role: "Auditeur CISA & Expert IA",
      rating: "4,9",
      reviews: "248 avis",
      students: "480+ apprenants",
      badge: "Best-seller",
      hours: "15 heures Live",
      oldPrice: "150 000 FCFA",
      price: "99 000 FCFA",
      image: "/images/bootcamp_pro_thumb.jpg",
      href: "/checkout/bootcamp-ia-pro",
      isFree: false
    },
    {
      id: "bootcamp-ia-business",
      type: "bootcamps",
      title: "Bootcamp IA Business & Dirigeants",
      subtitle: "Automatisation d'entreprise, agents IA métiers, gouvernance & coaching 1h.",
      instructor: "Alfred Dah",
      role: "Auditeur CISA & Fondateur",
      rating: "5,0",
      reviews: "94 avis",
      students: "120+ dirigeants",
      badge: "Formule Exec",
      hours: "15h + 1h Coaching",
      oldPrice: "280 000 FCFA",
      price: "199 000 FCFA",
      image: "/images/bootcamp_business_thumb.jpg",
      href: "/checkout/bootcamp-ia-business",
      isFree: false
    },
    {
      id: "initiation-ia-gratuit",
      type: "free",
      title: "Initiation Pratique à l'IA & ChatGPT",
      subtitle: "Les 5 règles d'or du Prompting pour doubler votre vitesse d'exécution.",
      instructor: "Alfred Dah",
      role: "Expert IA",
      rating: "4,8",
      reviews: "520+ avis",
      students: "1 250+ membres",
      badge: "100% Offert",
      hours: "1h 30m Vidéo HD",
      oldPrice: "25 000 FCFA",
      price: "0 FCFA (GRATUIT)",
      image: "/images/initiation_free_thumb.jpg",
      href: "/register-account",
      isFree: true
    },
    {
      id: "bibliotheque-prompts",
      type: "prompts",
      title: "Bibliothèque de Prompts & Modèles Métiers",
      subtitle: "30 à 40 fiches de prompts optimisées et guides PDF téléchargeables.",
      instructor: "Équipe Le Guide IA",
      role: "Support Technique",
      rating: "4,9",
      reviews: "310 avis",
      students: "Tous les membres",
      badge: "Coffre-fort PDF",
      hours: "Mises à jour 24h/7j",
      oldPrice: "45 000 FCFA",
      price: "Inclus Espace Membre",
      image: "/hero_bootcamp.jpg",
      href: "/ressources",
      isFree: true
    }
  ]

  const filtered = activeTab === "all" ? courses : courses.filter(c => c.type === activeTab)

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        <div className="space-y-3">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Des compétences pour révolutionner votre carrière et votre vie
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Explorez notre sélection de cours et bootcamps dispensés par Alfred Dah.
          </p>
        </div>

        {/* Category Tabs Bar (Udemy Style) */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Cards Slider/Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border/80 bg-card/50 overflow-hidden flex flex-col justify-between hover:border-primary/60 transition-all shadow-xl group">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                  {c.badge}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{c.instructor} — {c.role}</p>

                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold pt-1">
                    <span>{c.rating}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal">({c.reviews})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-muted-foreground line-through block">{c.oldPrice}</span>
                    <span className="font-heading text-sm font-black text-primary">{c.price}</span>
                  </div>
                  <Link href={c.href} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <span>Voir</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
