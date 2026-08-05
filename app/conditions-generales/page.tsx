import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Le Guide IA",
  description: "CGV du Bootcamp PRO 2 Le Guide IA — tarifs, paiement, garantie remboursement.",
  robots: { index: false, follow: false },
}

export default function ConditionsGeneralesPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-24 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mb-10">
          ← Retour au site
        </Link>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-muted-foreground mb-10">Dernière mise à jour : Août 2026 — Applicables au Bootcamp PRO 2</p>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">1. Objet</h2>
            <p>Les présentes CGV régissent l achat du <strong className="text-foreground">Bootcamp LE GUIDE IA PRO 2</strong>, proposé par Alfred Dah (Le Guide IA). Toute commande vaut acceptation de ces CGV.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">2. Description de la formation</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong className="text-foreground">Format :</strong> 7 sessions en direct</li>
              <li><strong className="text-foreground">Dates :</strong> 31 Août – 6 Septembre 2026</li>
              <li><strong className="text-foreground">Horaire :</strong> 19h00 GMT (heure de Ouagadougou)</li>
              <li><strong className="text-foreground">Durée :</strong> 2h par session</li>
              <li><strong className="text-foreground">Modalité :</strong> 100% en ligne</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">3. Tarifs</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Offre Fondateur :</strong> 149 900 FCFA (environ 264 $  ) — jusqu au 25 août 2026</li>
              <li><strong className="text-foreground">Prix Standard :</strong> 250 000 FCFA (environ 440 USD) — à partir du 26 août 2026</li>
            </ul>
            <p className="mt-3">Les prix sont en Francs CFA (XOF). Le montant USD est indicatif et peut varier selon le taux de change.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">4. Modalités de paiement</h2>
            <ul className="space-y-1 list-disc list-inside mt-2">
              <li><strong className="text-foreground">Orange Money / Wave :</strong> +226 75 75 72 73 (Sanson Alfred Tanguy Dah)</li>
              <li><strong className="text-foreground">Zelle :</strong> +1 917 903 5628 (Sanson Alfred Tanguy Dah)</li>
            </ul>
            <p className="mt-3">L inscription est confirmée après validation manuelle du paiement sous 24h.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">5. Garantie satisfait ou remboursé</h2>
            <p>Remboursement possible sous conditions :</p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Avoir assisté aux 3 premières sessions en direct</li>
              <li>Avoir soumis les 3 premiers exercices</li>
              <li>Demande effectuée dans les <strong className="text-foreground">5 premiers jours</strong> du Bootcamp</li>
            </ul>
            <p className="mt-3">Demandes à adresser à <a href="mailto:alfred@leguideai.com" className="text-primary hover:underline">alfred@leguideai.com</a>.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">6. Accès et replays</h2>
            <p>Replays disponibles sous 12h après chaque live. Accès au groupe WhatsApp maintenu après le Bootcamp.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">7. Propriété intellectuelle</h2>
            <p>Tous les contenus pédagogiques sont la propriété de Le Guide IA. Toute diffusion sans autorisation est interdite.</p>
          </section>
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">8. Contact</h2>
            <p><a href="mailto:alfred@leguideai.com" className="text-primary hover:underline">alfred@leguideai.com</a> — WhatsApp : +226 05 05 05 77</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
          <Link href="/politique-confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
        </div>
      </div>
    </main>
  )
}