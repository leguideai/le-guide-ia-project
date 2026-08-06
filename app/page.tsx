import { GridBackground } from "@/components/grid-background"
import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { EcosystemHub } from "@/components/ecosystem-hub"
import { Authority } from "@/components/authority"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <SiteNav />
      
      {/* S1: Héro — Prochaine Offre / Événement Majeur (Bootcamp PRO 2) */}
      <Hero />

      {/* S2: L'Écosystème LE GUIDE IA (Les 5 Espaces thématiques) */}
      <EcosystemHub />
            
      {/* S3: Formateur & Crédibilité (Alfred Dah) */}
      <Authority />

      {/* S4: Tarifs & Offre Fondateur */}
      <Pricing />
      
      {/* S5: Témoignages & Avis */}
      <Testimonials />
      
      {/* S7: FAQ */}
      <FAQ />
      
      {/* S8: CTA Final / Footer */}
      <CtaFooter />
      
      {/* Floating Elements */}
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
