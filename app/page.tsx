"use client"

import { GridBackground } from "@/components/grid-background"
import { Header } from "@/components/header"
import { MasterclassTicker } from "@/components/masterclass-ticker"
import { VslHeroVideo } from "@/components/vsl-hero-video"
import { TrustLogos } from "@/components/trust-logos"
import { SkillPathways } from "@/components/skill-pathways"
import { BusinessBanner } from "@/components/business-banner"
import { Authority } from "@/components/authority"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-[#090d16]">
      <GridBackground />
      
      {/* 1. Header Global  Style */}
      <Header />

      {/* Bandeau Défilant Masterclass Live (Actif uniquement si session programmée) */}
      <MasterclassTicker />

      {/* 2. Vidéo VSL Haute Conversion */}
      <VslHeroVideo />

      {/* 3. Les 3 Parcours d'Apprentissage */}
      <SkillPathways />

      {/* 5. Banner Le Guide IA Business (B2B) */}
      <BusinessBanner />

      {/* 6. Expertise & Autorité (Alfred Dah) */}
      <Authority />

      {/* 7. Avis & Témoignages Apprenants */}
      <Testimonials />

      {/* 8. Bandeau Écosystème & Stack Technologique Officielle */}
      <TrustLogos />

      {/* 9. FAQ */}
      <FAQ />

      {/* 10. Pied de Page Riche Dark */}
      <CtaFooter />

      {/* Éléments Flottants */}
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
