"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, Mail, ShieldCheck, LayoutDashboard, Clock, MessageCircle, Sparkles } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const method = searchParams.get("method") || ""
  const ref = searchParams.get("ref") || ""
  const sessionId = searchParams.get("session_id") || ""
  const type = searchParams.get("type") || ""

  const isStripe = !!sessionId || method === "stripe" || ref.startsWith("LGI-STRIPE")
  const isSubscription = type === "subscription" || ref.includes("STRIPE-SUB")
  const isMobileDirect = !isStripe

  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (sessionId || (ref && ref.startsWith("LGI-STRIPE"))) {
      fetch("/api/payment/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ref })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVerified(true)
        }
      })
      .catch(err => console.warn("Could not auto-verify Stripe session:", err))
    }
  }, [sessionId, ref])

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
          <span className="font-heading text-lg font-extrabold tracking-tight">LE GUIDE <span className="text-primary">IA</span></span>
        </div>

        <div className="rounded-3xl border border-primary/30 bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          
          {isMobileDirect ? (
            /* MOBILE MONEY DIRECT : VERIFICATION SOUS 24H */
            <>
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner">
                <Clock className="size-9 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-black uppercase text-amber-400">
                  <Clock className="size-3" />
                  <span>Vérification administrative sous 24h</span>
                </div>
                <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                  Demande d'Inscription Reçue !
                </h1>
                <p className="text-xs md:text-sm text-amber-400 font-semibold">
                  Votre transfert Mobile Money a bien été soumis à notre équipe.
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                Nous avons bien enregistré votre déclaration et votre justificatif de paiement. Un email de confirmation récapitulatif vous a été envoyé. Notre équipe procède actuellement à la vérification de la transaction pour <strong className="text-foreground">valider vos accès sous moins de 24h</strong>.
              </p>

              {ref && (
                <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 text-xs font-mono text-foreground flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">Référence déclarée :</span>
                  <strong className="text-primary font-bold">{ref}</strong>
                </div>
              )}

              <div className="rounded-2xl bg-secondary/50 p-4 border border-border/60 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Mail className="size-4 text-primary" />
                  <span>Prochaines étapes :</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Un <strong>email récapitulatif</strong> de votre demande vous a été transmis (vérifiez aussi vos spams).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Nous vérifions la réception de votre virement Mobile Money sous <strong>moins de 24h ouvrées</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Dès validation par l'administrateur, vous recevrez un <strong>email de confirmation activant votre accès complet</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Votre formation apparaît avec le badge <em>« En cours de vérification »</em> dans votre Espace Membre.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 text-xs md:text-sm shadow-xl transition-all cursor-pointer"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Suivre sur mon Espace Membre</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href={`https://wa.me/22605050577?text=${encodeURIComponent(`Bonjour Alfred, je viens d'effectuer mon inscription Mobile Money avec la référence ${ref || "soumise"}. Pouvez-vous vérifier ma transaction ? Merci !`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-2.5 text-xs transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="size-4" />
                  <span>Accélérer la validation sur WhatsApp</span>
                </a>
              </div>
            </>
          ) : (
            /* STRIPE / CARTE : ACCÈS IMMÉDIAT */
            <>
              <div className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="size-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black uppercase text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  <span>{isSubscription ? "Pass VIP Activé" : "Accès Débloqué"}</span>
                </div>
                <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                  {isSubscription ? "Félicitations & Bienvenue VIP !" : "Félicitations & Bienvenue !"}
                </h1>
                <p className="text-xs md:text-sm text-emerald-400 font-semibold">
                  Votre paiement par carte via Stripe a été validé avec succès.
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                {isSubscription 
                  ? "Votre Pass VIP a été activé immédiatement. Vous disposez désormais d'un accès complet et illimité à tous les prompts métiers et aux replays des Masterclasses."
                  : "Votre inscription et l'accès à votre formation ont été activés avec succès. Un email officiel de confirmation vous a été envoyé."
                }
              </p>

              <div className="rounded-2xl bg-secondary/50 p-4 border border-border/60 text-left space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Mail className="size-4 text-primary" />
                  <span>Prochaines étapes :</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Vérifiez votre boîte de réception email pour votre reçu officiel d'abonnement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Accédez instantanément à la bibliothèque de ressources et copiez tous les prompts souhaités.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Retrouvez votre historique de facturation et reçus PDF dans votre espace membre.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href={isSubscription ? "/dashboard?tab=resources" : "/dashboard"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 text-xs md:text-sm shadow-xl transition-all cursor-pointer"
                >
                  <LayoutDashboard className="size-4" />
                  <span>{isSubscription ? "Découvrir mes Ressources VIP" : "Accéder à mon Espace Membre"}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Paiement sécurisé · Suivi des inscriptions Le Guide IA</span>
          </div>

        </div>

      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="size-4 animate-spin text-primary" />
          <span>Chargement de la confirmation...</span>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
