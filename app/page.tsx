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
import { Services } from "@/components/services"
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

      {/* S9: Tarifs */}
      <Pricing />
            
      {/* S12: Alfred Dah — remonté pour établir la crédibilité avant les témoignages */}
      <Authority />
      
      {/* S12: Paiement */}
      <Payment />
      
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
      
      {/* S10: Témoignages */}
      <Testimonials />
      
      {/* S11: Lien discret vers les Services Sur-Mesure */}
      <section className="py-12 border-y border-border/40 bg-card/10 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Prestations Sur-Mesure
          </span>
          <h3 className="mt-3 font-heading text-lg font-bold text-foreground sm:text-xl">
            Besoin d'un accompagnement individuel ou de services spécifiques ?
          </h3>
          <p className="mt-2 text-xs text-muted-foreground max-w-2xl mx-auto">
            Développement web, coaching recherche d'emploi, refonte CV &amp; LinkedIn, ou création de Business Plans.
          </p>
          <a
            href="/services"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline group"
          >
            <span>Découvrir nos services sur-mesure</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </section>

      
      {/* S13: FAQ */}
      <FAQ />
      
      {/* S14: CTA Final / Footer */}
      <CtaFooter />
      
      {/* Floating Elements */}
      <ScrollToTop />
      <WhatsAppFloat />
      {/* <LeadCapture /> */}
    </main>
  )
}
