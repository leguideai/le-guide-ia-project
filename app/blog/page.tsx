"use client"

import { SiteNav } from "@/components/site-nav"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { Newspaper, Calendar, User, ArrowRight, Video, Sparkles } from "lucide-react"

export default function BlogPage() {
  const articles = [
    {
      id: "1",
      title: "Comment les managers africains réduisent de 40% leur charge de travail grâce à ChatGPT",
      category: "Tutoriel & Etude de Cas",
      author: "Alfred Dah",
      date: "04 Août 2026",
      readTime: "5 min de lecture",
      excerpt: "Découvrez les prompts précis et la méthode en 3 étapes appliquée par les cadres et entrepreneurs d'Abidjan, Dakar et Ouagadougou.",
      thumbnail: "/hero_bootcamp.jpg"
    },
    {
      id: "2",
      title: "Guide Complet 2026 : Quelle IA choisir entre ChatGPT Plus, Claude 3.5 Sonnet et Gemini Pro ?",
      category: "Comparatif",
      author: "Alfred Dah",
      date: "01 Août 2026",
      readTime: "8 min de lecture",
      excerpt: "Un comparatif neutre et chiffré des meilleurs assistants IA du moment avec recommandations par métier (rédaction, code, visuels).",
      thumbnail: "/hero_bootcamp.jpg"
    },
    {
      id: "3",
      title: "Sécurité des données d'entreprise et IA : Ce que tout auditeur et DRH doit savoir",
      category: "Sécurité & CISA",
      author: "Alfred Dah",
      date: "28 Juillet 2026",
      readTime: "6 min de lecture",
      excerpt: "Comment utiliser les LLMs en entreprise sans risquer la fuite de documents confidentiels ou de données clients.",
      thumbnail: "/hero_bootcamp.jpg"
    }
  ]

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <SiteNav />

      {/* Hero */}
      <section className="pt-36 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
          <Newspaper className="size-3.5" />
          Le Média & Centre de Connaissances IA
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance max-w-4xl mx-auto">
          Actualités, tutoriels et guides stratégiques sur l'IA
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-pretty">
          Restez à la pointe de l'actualité Intelligence Artificielle en Afrique francophone avec les décryptages d'Alfred Dah.
        </p>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
        {articles.map((art) => (
          <article key={art.id} className="rounded-3xl border border-border bg-card/40 overflow-hidden flex flex-col justify-between backdrop-blur-md group hover:border-primary/40 transition-all">
            <div className="space-y-4 p-6">
              <div className="aspect-video rounded-2xl overflow-hidden border border-border relative">
                <img src={art.thumbnail} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-background/90 px-3 py-1 rounded-full border border-cyan-500/30">
                  {art.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="size-3" /> {art.date}</span>
                <span>·</span>
                <span>{art.readTime}</span>
              </div>

              <h2 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {art.title}
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {art.excerpt}
              </p>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-border/40">
              <button className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Lire l'article complet</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </article>
        ))}
      </section>

      <CtaFooter />
    </main>
  )
}
