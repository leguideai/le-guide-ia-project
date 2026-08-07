"use client"

import Link from "next/link"
import { Zap, Video, ShieldCheck, Award, Users, ArrowRight, CheckCircle2, Sparkles, PlayCircle } from "lucide-react"

export function UdemyBanner() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-[#0b132b] via-[#0d1b3e] to-[#0f172a] p-8 md:p-14 relative overflow-hidden shadow-2xl">
          
          <div className="grid gap-10 lg:grid-cols-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                <Sparkles className="size-3.5 text-primary" />
                <span>Méthode Pédagogique Exclusives</span>
              </div>

              <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Une méthode 100% pratique conçue pour votre réussite
              </h2>

              <p className="text-xs md:text-base text-slate-300 leading-relaxed max-w-xl">
                Sous la direction d'Alfred Dah (Auditeur CISA & Expert IA), nos Bootcamps et formations sont structurés autour de cas d'usage réels pour vous rendre immédiatement opérationnel.
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Zap className="size-4 text-amber-400" />
                    <span>Pratique Métier Intensives</span>
                  </div>
                  <p className="text-[11px] text-slate-400">7 Sessions de direct live et exercices concrets.</p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Video className="size-4 text-emerald-400" />
                    <span>Replays HD à vie</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Enregistrements accessibles 24h/7j sur votre Espace Membre.</p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Award className="size-4 text-indigo-400" />
                    <span>Certificat Officiel</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Attestation d'accomplissement valorisant votre CV.</p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Users className="size-4 text-sky-400" />
                    <span>Accompagnement VIP</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Groupe privé WhatsApp avec Alfred Dah et la communauté.</p>
                </div>
              </div>

              {/* CTA Group */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/checkout/bootcamp-ia-pro"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-8 py-3.5 text-xs md:text-sm shadow-xl transition-all cursor-pointer"
                >
                  <span>S'inscrire au Bootcamp</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href="/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/40 hover:bg-card text-foreground font-bold px-6 py-3.5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <span>Télécharger le programme</span>
                </a>
              </div>

            </div>

            {/* Right Graphic Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative overflow-hidden rounded-3xl border border-primary/40 glow-blue shadow-2xl max-w-sm">
                <img
                  src="/hero_bootcamp.jpg"
                  alt="Bootcamp IA Le Guide IA"
                  className="w-full h-auto rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-border/60 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Bootcamp PRO 2 — Direct Live</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Du 31 Août au 6 Septembre 2026 avec Alfred Dah</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
