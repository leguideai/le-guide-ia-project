"use client"

import { motion } from "motion/react"
import { Check, Sparkles, UserCheck, GraduationCap, ArrowRight } from "lucide-react"

export function Pricing() {
  const proFeatures = [
    "15h de sessions immersives en direct",
    "Créneaux : Lun-Ven 19h-21h GMT + Samedi 8h-13h GMT",
    "Accès centralisé à l'Espace Membre",
    "Replays vidéo HD & Fiches PDF téléchargeables",
    "Exercices pratiques & Ateliers en direct",
    "Certificat d'accomplissement officiel vérifiable",
    "Facture d'achat automatique"
  ]

  const businessFeatures = [
    "15h de sessions orientées Business & Automation",
    "Créneaux : Lun-Ven 19h-21h GMT + Dimanche 16h-21h GMT",
    "Accès Espace Membre & Bibliothèque Premium",
    "Modèles de Business Plans & Workflows IA",
    "Stratégies d'E-marketing & Offres automatisées",
    "Certificat IA Business vérifiable",
    "Facture d'achat automatique conformes"
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="tarifs">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            Tarifs Officiels V1
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Inscrivez-vous au prochain Bootcamp
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Choisissez la formule adaptée à vos objectifs professionnels ou entrepreneuriaux.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          
          {/* Bootcamp IA Pro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border-2 border-primary/60 bg-gradient-to-b from-primary/10 via-card to-card p-8 shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-extrabold text-primary-foreground uppercase tracking-widest flex items-center gap-1.5 shadow">
              <GraduationCap className="size-3.5" />
              1ère Semaine du Mois
            </div>

            <div>
              <div className="text-center mt-2 mb-6 space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-foreground">Bootcamp IA Pro</h3>
                <p className="text-xs font-semibold text-primary">Pour Salariés & Professionnels</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="text-4xl font-black text-foreground">99 000 FCFA</div>
                  <div className="text-xs text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">≈ 150 € / $165</div>
                </div>
              </div>

              <div className="border-t border-border/80 pt-6">
                <ul className="space-y-3.5">
                  {proFeatures.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-foreground/95">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/checkout/bootcamp-ia-pro"
                className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 text-sm transition-transform active:scale-95 shadow-lg"
              >
                <span>S'inscrire au Bootcamp IA Pro (99 000 FCFA)</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </motion.div>

          {/* Bootcamp IA Business */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-card to-card p-8 shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-extrabold text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow">
              <UserCheck className="size-3.5" />
              3ème Semaine du Mois
            </div>

            <div>
              <div className="text-center mt-2 mb-6 space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-foreground">Bootcamp IA Business</h3>
                <p className="text-xs font-semibold text-amber-400">Pour Entrepreneurs & Indépendants</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="text-4xl font-black text-foreground">199 000 FCFA</div>
                  <div className="text-xs text-muted-foreground bg-card/80 border border-border/60 rounded-full px-2.5 py-1">≈ 300 € / $330</div>
                </div>
              </div>

              <div className="border-t border-border/80 pt-6">
                <ul className="space-y-3.5">
                  {businessFeatures.map((f: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-xs md:text-sm text-foreground/95">
                      <Check className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/checkout/bootcamp-ia-business"
                className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 text-sm transition-transform active:scale-95 shadow-lg"
              >
                <span>S'inscrire au Bootcamp Business (199 000 FCFA)</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
