"use client"

import Link from "next/link"
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, LayoutDashboard } from "lucide-react"

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
          <span className="font-heading text-lg font-extrabold tracking-tight">LE GUIDE <span className="text-primary">IA</span></span>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-card/70 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="size-9" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
              Félicitations & Bienvenue !
            </h1>
            <p className="text-xs md:text-sm text-emerald-400 font-semibold">
              Votre inscription au Bootcamp a été validée avec succès.
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Votre compte apprenant et l'accès à votre formation ont été générés automatiquement. Vous allez recevoir un email de confirmation contenant vos identifiants d'accès.
          </p>

          <div className="rounded-2xl bg-secondary/50 p-4 border border-border/60 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Mail className="size-4 text-primary" />
              <span>Prochaines étapes :</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Vérifiez votre boîte de réception email (et le dossier Spams si nécessaire).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Connectez-vous à votre Espace Membre pour consulter le programme et les replays.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Rejoignez le groupe WhatsApp privé via le lien dans votre tableau de bord.</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 text-xs md:text-sm shadow-xl transition-all cursor-pointer"
            >
              <LayoutDashboard className="size-4" />
              <span>Accéder à mon Espace Membre</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/"
              className="inline-block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Retourner à l'accueil
            </Link>
          </div>

          <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Paiement sécurisé & Facture transmise par email</span>
          </div>

        </div>

      </div>
    </main>
  )
}
