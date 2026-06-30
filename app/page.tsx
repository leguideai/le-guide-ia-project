import { GridBackground } from "@/components/grid-background"
import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { WhyBootcamp } from "@/components/why-bootcamp"
import { Deliverables } from "@/components/deliverables"
import { Program } from "@/components/program"
import { Projection } from "@/components/projection"
import { Audience } from "@/components/audience"
import { Differentiators } from "@/components/differentiators"
import { Process } from "@/components/process"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { Authority } from "@/components/authority"
import { Payment } from "@/components/payment"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { LeadCapture } from "@/components/lead-capture"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <SiteNav />
      
      {/* S1: Héro */}
      <Hero />
      
      {/* S2: Pourquoi ce Bootcamp */}
      <WhyBootcamp />
      
      {/* S3: Ce que vous obtenez */}
      <Deliverables />
      
      {/* S4: Programme */}
      <Program />
      
      {/* S5: Découvrez votre futur */}
      <Projection />
      
      {/* S6: Pour qui ? */}
      <Audience />
      
      {/* S7: Pourquoi Le Guide IA */}
      <Differentiators />
      
      {/* S8: Comment ça se passe */}
      <Process />
      
      {/* S9: Tarifs */}
      <Pricing />
      
      {/* S10: Témoignages */}
      <Testimonials />
      
      {/* S11: Alfred Dah */}
      <Authority />
      
      {/* S12: Paiement */}
      <Payment />
      
      {/* S13: FAQ */}
      <FAQ />
      
      {/* S14: CTA Final / Footer */}
      <CtaFooter />
      
      {/* Floating Elements */}
      <ScrollToTop />
      <WhatsAppFloat />
      <LeadCapture />
    </main>
  )
}
