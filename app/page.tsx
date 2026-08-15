"use client"

import { GridBackground } from "@/components/grid-background"
import { UdemyHeader } from "@/components/udemy-header"
import { VslHeroVideo } from "@/components/vsl-hero-video"
import { UdemyTrustLogos } from "@/components/udemy-trust-logos"
import { UdemySkillPathways } from "@/components/udemy-skill-pathways"
import { UdemyTabbedCourses } from "@/components/udemy-tabbed-courses"
import { UdemyBusinessBanner } from "@/components/udemy-business-banner"
import { CertificationSection } from "@/components/certification-section"
import { Authority } from "@/components/authority"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-[#090d16]">
      <GridBackground />
      
      {/* 1. Header Style Udemy (Top bar, Barre de recherche, Catégories & Auth) */}
      <UdemyHeader />

      {/* 2. Vidéo VSL Haute Conversion (Style Révolution IA / VIP) */}
      <VslHeroVideo />

      {/* 4. Les 3 Parcours d'Apprentissage (Cartes 3D HD) */}
      <UdemySkillPathways />

      {/* 6. Banner Le Guide IA Business (Réplique Udemy Business Box) */}
      <UdemyBusinessBanner />

      {/* 8. Expertise & Autorité (Alfred Dah) */}
      <Authority />

      {/* 9. Avis & Témoignages Apprenants */}
      <Testimonials />

      {/* 5. Section Parcours d'Apprentissage & Formations (Onglets & Cartes Vidéos) */}
      <UdemyTabbedCourses />

      {/* 5. Bandeau Écosystème & Stack Technologique Officielle */}
      <UdemyTrustLogos />

      {/* 10. FAQ */}
      <FAQ />

      {/* 11. Pied de Page Riche Dark */}
      <CtaFooter />

      {/* Éléments Flottants */}
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}



