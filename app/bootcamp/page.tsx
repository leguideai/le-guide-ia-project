import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { Program } from "@/components/program"
import { Pricing } from "@/components/pricing"
import { Deliverables } from "@/components/deliverables"
import { Projection } from "@/components/projection"
import { Authority } from "@/components/authority"
import { Testimonials } from "@/components/testimonials"
import { Payment } from "@/components/payment"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"

export const metadata = {
  title: "Bootcamp PRO 2 — Formation IA Pratique & Certifiante | Le Guide IA",
  description: "7 Sessions intensives en direct du 31 Août au 6 Septembre 2026 avec Alfred Dah. Maîtrisez ChatGPT, Claude, Gemini et l'automatisation IA.",
}

export default function BootcampPage() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <SiteNav />

      {/* Hero dédié au prochain Bootcamp PRO 2 */}
      <Hero />

      {/* Programme détaillé des 7 modules */}
      <Program />

      {/* Ce que vous obtenez & Certifications */}
      <Deliverables />

      {/* Projections de carrière */}
      <Projection />

      {/* Formateur : Alfred Dah */}
      <Authority />

      {/* Tarifs & Inscription */}
      <Pricing />

      {/* Formulaire de paiement direct */}
      <Payment />

      {/* Témoignages des alumni */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
