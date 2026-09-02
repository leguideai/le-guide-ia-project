import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "Mentions Légales | Le Guide IA",
  description: "Mentions légales du site leguideai.com — Le Guide IA, formation intelligence artificielle.",
  robots: { index: false, follow: false },
}

export default function MentionsLegalesPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-10">
          ← Retour au site
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Mentions Légales</h1>
        <p className="text-sm text-muted-foreground mb-10">Dernière mise à jour : Août 2026</p>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">1. Éditeur du site</h2>
            <p>Le site <strong className="text-foreground">leguideai.com</strong> est édité par :</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li><strong className="text-foreground">Responsable de publication :</strong> Alfred Dah</li>
              <li><strong className="text-foreground">Dénomination :</strong> Le Guide IA</li>
              <li><strong className="text-foreground">Email :</strong> <a href="mailto:alfred@leguideai.com" className="text-primary hover:underline">alfred@leguideai.com</a></li>
              <li><strong className="text-foreground">WhatsApp :</strong> +226 05 05 05 77</li>
              <li><strong className="text-foreground">Pays établissement :</strong> Burkina Faso</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">2. Propriété intellectuelle</h2>
            <p>Tous les contenus (textes, images, logos, vidéos, programmes) sont la propriété exclusive de Le Guide IA / Alfred Dah. Toute reproduction sans autorisation écrite est interdite.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">3. Limitation de responsabilité</h2>
            <p>Le Guide IA met tout en oeuvre pour assurer l exactitude des informations publiées. Les tarifs peuvent être mis à jour sans préavis.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">4. Données personnelles</h2>
            <p>Ce site utilise des cookies analytiques (Google Analytics, Microsoft Clarity). Aucune donnée n est vendue à des tiers. Voir notre <Link href="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</Link>.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">5. Droit applicable</h2>
            <p>Le site est soumis au droit du Burkina Faso. En cas de litige, les parties rechercheront une solution amiable.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Link href="/politique-confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          {/* <Link href="/conditions-generales" className="hover:text-primary transition-colors">CGV</Link> */}
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
        </div>
      </div>
    </main>
  )
}