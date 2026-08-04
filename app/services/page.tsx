import type { Metadata } from "next"
import { GridBackground } from "@/components/grid-background"
import { SiteNav } from "@/components/site-nav"
import { Services } from "@/components/services"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"

export const metadata: Metadata = {
  title: "Services Sur-Mesure | Le Guide IA",
  description:
    "Développement web, coaching recherche d offre d emploi, refonte CV & LinkedIn, création de Business Plans avec l IA. Prestations premium sur-mesure par Le Guide IA.",
  alternates: {
    canonical: "https://leguideai.com/services",
  },
  openGraph: {
    title: "Services Sur-Mesure | Le Guide IA",
    description:
      "Développement web, coaching recherche d offre d emploi, refonte CV & LinkedIn, création de Business Plans avec l IA. Prestations premium sur-mesure par Le Guide IA.",
    url: "https://leguideai.com/services",
  },
}

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-background">
      <GridBackground />
      <SiteNav />
      <div className="pt-20">
        <Services />
      </div>
      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
