import { GridBackground } from "@/components/grid-background"
import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Problem } from "@/components/problem"
import { Promise } from "@/components/promise"
import { Program } from "@/components/program"
import { Audience } from "@/components/audience"
import { Tools } from "@/components/tools"
import { Method } from "@/components/method"
import { Challenge } from "@/components/challenge"
import { Bonus } from "@/components/bonus"
import { Parcours } from "@/components/parcours"
import { Authority } from "@/components/authority"
import { CtaFooter } from "@/components/cta-footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"

export default function Page() {
  return (
    <main className="relative min-h-screen text-foreground">
      <GridBackground />
      <SiteNav />
      <Hero />
      <Stats />
      <Problem />
      <Promise />
      <Program />
      <Audience />
      <Tools />
      <Method />
      <Challenge />
      <Bonus />
      <Parcours />
      <Authority />
      <CtaFooter />
      <WhatsAppFloat />
    </main>
  )
}
