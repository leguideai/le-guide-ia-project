"use client"

import Link from "next/link"
import { Award, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, QrCode } from "lucide-react"

export function CertificationSection() {
  return (
    <section className="py-20 bg-background relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Left Visual Badge Card */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-8 shadow-2xl backdrop-blur-xl max-w-md w-full space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/Logo%20avatar.png" alt="Logo" className="size-8 rounded-lg object-cover" />
                  <span className="font-heading text-sm font-extrabold text-white">LE GUIDE <span className="text-primary">IA</span></span>
                </div>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold uppercase">
                  Officiel & Vérifiable
                </span>
              </div>

              <div className="text-center space-y-3 py-4">
                <div className="inline-flex size-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner mx-auto">
                  <Award className="size-10" />
                </div>

                <h3 className="font-heading text-xl font-extrabold text-foreground">
                  Certificat d'Accomplissement IA
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Délivré à l'issue de la complétion du Bootcamp IA Pro ou Business sous la supervision d'Alfred Dah.
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <QrCode className="size-5 text-primary" />
                  <span>Vérification par QR Code & URL sécurisée</span>
                </div>
                <ShieldCheck className="size-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Right Explanatory Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="size-3.5 text-amber-400" />
              Valorisez votre Profil Professionnel
            </span>

            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Obtenez une certification reconnue et faites évoluer votre carrière
            </h2>

            <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
              À la fin de votre formation, téléchargez votre certificat numérique certifiant la maîtrise des outils d'IA Générative, du Prompting avancé et de l'automatisation de workflows.
            </p>

            <div className="space-y-3 pt-2 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Certificat individuel avec identifiant de vérification unique</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Ajout direct sur votre profil LinkedIn et votre CV</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Garantie d'expertise signée par Alfred Dah (Auditeur CISA & Expert IA)</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/checkout/bootcamp-ia-pro"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3.5 text-xs md:text-sm shadow-xl transition-all cursor-pointer"
              >
                <span>Obtenir ma certification au Bootcamp IA</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
