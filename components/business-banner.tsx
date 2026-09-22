"use client"

import Link from "next/link"
import { CheckCircle2, ArrowRight, Building2, ShieldCheck, Zap } from "lucide-react"

export function BusinessBanner() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-white via-[#F7F9FF] to-[#EEF3FF] p-8 md:p-12 shadow-xs relative overflow-hidden text-[#0E1E3F]">
          
          <div className="grid gap-8 lg:grid-cols-12 items-stretch relative z-10">
            
            {/* Left Media Preview (Masqué sur mobile, affiché uniquement sur desktop lg:flex) */}
            <div className="hidden lg:flex lg:col-span-5 relative justify-center h-full order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 glow-gold shadow-xs w-full h-full min-h-[340px]">
                <img src="/images/b2b_enterprise_thumb.jpg" alt="Transformation IA d'Entreprise Le Guide IA B2B" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>

            {/* Right Info Column (Contenu Texte B2B à droite) */}
            <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
              
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#8A6A1F] bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30">
                <Building2 className="size-3.5 text-[#8A6A1F]" />
                <span>Le Guide IA pour les Entreprises (B2B)</span>
              </div>

              <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-[#0E1E3F] leading-tight">
                Réinventez votre entreprise à l'ère de l'Intelligence Artificielle
              </h2>

              <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-xl">
                Accompagnement sur-mesure pour les PME, dirigeants et grands groupes : intégration Google Workspace, Gemini, Copilot, refonte web et automatisation de processus métiers.
              </p>

              <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#8A6A1F] shrink-0" />
                  <span>Formations intra-entreprise sur mesure adaptées à vos équipes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#8A6A1F] shrink-0" />
                  <span>Diagnostic de maturité digitale en 2 minutes avec devis qualifié</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#8A6A1F] shrink-0" />
                  <span>Accompagnement par Alfred Dah (Auditeur & Expert IA)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/entreprises"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black px-8 py-3.5 text-xs md:text-sm shadow-sm shadow-[#D4AF37]/25 transition-all cursor-pointer"
                >
                  <span>Demander un Diagnostic & Devis B2B</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
