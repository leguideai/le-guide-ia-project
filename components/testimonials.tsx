"use client"

import { Quote, Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sanson Alfred Dah",
      role: "Auditeur CISA & Expert IA",
      country: "Burkina Faso",
      text: "Le Bootcamp m'a permis d'automatiser 60% des tâches répétitives de mon cabinet. Un gain de temps inestimable pour mes audits.",
    },
    {
      name: "Khadija Sy",
      role: "Directrice E-Marketing",
      country: "Sénégal",
      text: "Grâce aux fiches de prompts et à la maîtrise de ChatGPT & Midjourney, nous avons multiplié notre création de contenu par 4 en 1 mois.",
    },
    {
      name: "Marc-Aurèle Kouassi",
      role: "Consultant & Formateur",
      country: "Côte d'Ivoire",
      text: "Une formation 100% pratique ! Les replays et l'accès à l'Espace Membre me permettent de réviser chaque atelier à mon rythme.",
    },
    {
      name: "Amadou Sow",
      role: "Entrepreneur Tech",
      country: "Mali",
      text: "L'intégration des agents IA métiers avec Make m'a aidé à structurer l'assistance client de ma startup en moins de 48 heures.",
    }
  ]

  return (
    <section className="py-20 bg-slate-950/60 relative overflow-hidden border-t border-border/50" id="temoignages">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10 relative z-10">
        
        {/* Left-Aligned Section Header (Udemy Style) */}
        <div className="space-y-3 text-left">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            Témoignages & Retour d'Expérience
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Ce que disent nos apprenants et professionnels formés
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Découvrez comment nos Bootcamps et ressources impactent quotidiennement la carrière de nos membres.
          </p>
        </div>

        {/* 4 Cards on 1 Line (Udemy Style Grid) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between space-y-6 relative group"
            >
              <Quote className="size-8 text-primary/20 absolute top-5 right-5 group-hover:text-primary/40 transition-colors" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-normal italic">
                  "{item.text}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60 relative z-10">
                <div className="size-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center border border-primary/30 text-xs shrink-0 uppercase">
                  {item.name.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold truncate">
                    {item.role} · <span className="text-primary">{item.country}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

