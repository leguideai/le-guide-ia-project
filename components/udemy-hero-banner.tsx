"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Sparkles } from "lucide-react"

export function UdemyHeroBanner() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-4 md:py-6 lg:py-8">
      
      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6">
        
        {/* Main Banner Frame with Diagonal Glow */}
        <div className="relative rounded-3xl border border-border/80 bg-gradient-to-r from-slate-900 via-[#0d1b3e] to-slate-900 overflow-hidden shadow-2xl p-3 sm:p-5 md:p-7">
          
          <div className="grid gap-6 lg:grid-cols-12 items-stretch relative z-10">
            
            {/* Desktop Left Text Card (Hidden on Mobile) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden lg:flex lg:col-span-6 rounded-3xl border border-primary/30 bg-card/90 p-5 md:p-7 shadow-2xl backdrop-blur-2xl flex-col justify-between space-y-4 lg:space-y-6"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkles className="size-3 text-primary animate-pulse" />
                  <span>Co-créez votre avenir professionnel</span>
                </div>

                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  Maîtrisez l'IA. Transformez votre carrière et votre business.
                </h1>

                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                  Formation intensive en ligne · 100% en français · Cas africains & diaspora. Apprenez à maîtriser ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Make et n8n avec Alfred Dah.
                </p>

                {/* Informative Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-foreground border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">📅 31 Août - 6 Sept 2026</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">🕖 19h00 GMT</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">🌍 100% En ligne</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">🎓 7 Sessions intensives</span>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5 w-full">
                <Link
                  href="/checkout/bootcamp-ia-pro"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs md:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>Rejoindre le Bootcamp</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                >
                  <span>Télécharger le programme</span>
                </a>
              </div>

            </motion.div>

            {/* Poster Graphic & Mobile Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-6 relative flex flex-col justify-center items-center h-full space-y-4"
            >
              <div className="rounded-3xl border border-primary/30 bg-card/90 p-3 sm:p-5 md:p-6 shadow-2xl backdrop-blur-2xl flex items-center justify-center w-full max-w-[440px]">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-slate-900 group">
                  <img
                    src="/hero_bootcamp.jpg"
                    alt="Affiche Officielle Le Guide IA - Bootcamp PRO 2"
                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>
              </div>

              {/* Mobile Action Buttons (Visible only on < lg screens) */}
              <div className="flex flex-col gap-2.5 w-full max-w-[480px] lg:hidden">
                <Link
                  href="/checkout/bootcamp-ia-pro"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Rejoindre le Bootcamp</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <span>Télécharger le programme</span>
                </a>
              </div>
            </motion.div>

          </div>

        </div>

      </div>

    </section>
  )
}
