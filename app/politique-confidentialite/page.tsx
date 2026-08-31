import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Le Guide IA",
  description: "Politique de confidentialité et protection des données personnelles — Le Guide IA.",
  robots: { index: false, follow: false },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-10">
          ← Retour au site
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Politique de Confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-10">Dernière mise à jour : Août 2026</p>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">1. Responsable du traitement</h2>
            <p>Alfred Dah — Le Guide IA — <a href="mailto:alfred@leguideai.com" className="text-primary hover:underline">alfred@leguideai.com</a></p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">2. Données collectées</h2>
            <p>Lors de votre inscription ou paiement, nous collectons : nom, email, numéro WhatsApp, pays et profil professionnel. Des données de navigation anonymisées sont collectées via Google Analytics et Microsoft Clarity.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">3. Finalités</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Gestion des inscriptions au Bootcamp PRO 2</li>
              <li>Confirmation et suivi du paiement</li>
              <li>Accès au groupe WhatsApp et ressources</li>
              <li>Communication formation et suivi</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">4. Partage des données</h2>
            <p>Vos données ne sont pas vendues. Elles peuvent être partagées avec Google (Analytics) et Microsoft (Clarity) uniquement pour les analyses de trafic.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">5. Conservation</h2>
            <p>Vos données sont conservées 3 ans ou jusqu a votre demande de suppression.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">6. Vos droits</h2>
            <p>Accès, rectification, suppression : contactez <a href="mailto:alfred@leguideai.com" className="text-primary hover:underline">alfred@leguideai.com</a>.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">7. Cookies</h2>
            <p>Ce site utilise des cookies techniques et analytiques (Google Analytics, Meta Pixel). Vous pouvez les désactiver dans votre navigateur.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
          <Link href="/conditions-generales" className="hover:text-primary transition-colors">CGV</Link>
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
        </div>
      </div>
    </main>
  )
}