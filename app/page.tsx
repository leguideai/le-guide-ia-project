"use client"

import { GridBackground } from "@/components/grid-background"
import { UdemyHeader } from "@/components/udemy-header"
import { MasterclassTicker } from "@/components/masterclass-ticker"
import { VslHeroVideo } from "@/components/vsl-hero-video"
import { UdemyTrustLogos } from "@/components/udemy-trust-logos"
import { UdemySkillPathways } from "@/components/udemy-skill-pathways"
import { UdemyBusinessBanner } from "@/components/udemy-business-banner"
import { Authority } from "@/components/authority"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-[#090d16]">
      <GridBackground />
      
      {/* 1. Header Global Udemy Style */}
      <UdemyHeader />

      {/* Bandeau Défilant Masterclass Live (Actif uniquement si session programmée) */}
      <MasterclassTicker />

      {/* 2. Vidéo VSL Haute Conversion */}
      <VslHeroVideo />

      {/* 3. Les 3 Parcours d'Apprentissage */}
      <UdemySkillPathways />

      {/* 5. Banner Le Guide IA Business (B2B) */}
      <UdemyBusinessBanner />

      {/* 6. Expertise & Autorité (Alfred Dah) */}
      <Authority />

      {/* 7. Avis & Témoignages Apprenants */}
      <Testimonials />

      {/* 8. Bandeau Écosystème & Stack Technologique Officielle */}
      <UdemyTrustLogos />

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
