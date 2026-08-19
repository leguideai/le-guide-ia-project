"use client"

import { motion } from "motion/react"
import { Award, ShieldCheck, CheckCircle2, Sparkles, QrCode } from "lucide-react"

export function CertificationSection() {
  return (
    <section className="py-20 bg-background relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Left Explanatory Content (Animated Entrance) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 order-1 lg:order-1 space-y-6 text-left"
          >
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#ECC86B] bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30">
              <Sparkles className="size-3.5 text-[#D4AF37]" />
              Valorisez votre Profil Professionnel
            </span>

            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Obtenez une certification reconnue et faites évoluer votre carrière
            </h2>

            <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
              À la fin de votre formation, téléchargez votre certificat numérique certifiant la maîtrise des outils d'IA Générative, du Prompting avancé et de l'automatisation de workflows.
            </p>

            <div className="space-y-3 pt-2 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0" />
                <span>Certificat individuel avec identifiant de vérification unique</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0" />
                <span>Ajout direct sur votre profil LinkedIn et votre CV</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0" />
                <span>Garantie d'expertise signée par Alfred Dah (Auditeur CISA & Expert IA)</span>
              </div>
            </div>

          </motion.div>

          {/* Right Illustrative Symbol Card (Masqué sur mobile, affiché uniquement sur desktop lg:flex) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:flex lg:col-span-5 order-2 lg:order-2 justify-center"
          >
            <div className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/15 via-slate-900/90 to-slate-950 p-8 shadow-2xl glow-gold backdrop-blur-2xl max-w-md w-full space-y-6 relative overflow-hidden group hover:border-[#D4AF37]/70 transition-colors">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
                  <span className="font-heading text-sm font-extrabold text-white">LE GUIDE <span className="text-primary">IA</span></span>
                </div>
                <span className="text-[9px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-slate-950 font-black border border-[#F3E5AB] px-2.5 py-1 rounded-full uppercase shadow-md">
                  Officiel & Certifié
                </span>
              </div>

              <div className="text-center space-y-4 py-4 relative z-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="inline-flex size-24 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-[0_0_35px_rgba(212,175,55,0.35)] mx-auto group-hover:scale-110 transition-transform duration-500"
                >
                  <Award className="size-12 text-[#D4AF37]" />
                </motion.div>

                <div className="space-y-1.5">
                  <h3 className="font-heading text-xl font-extrabold text-white">
                    Certificat d'Accomplissement IA
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Attestation numérique certifiée signée par Alfred Dah, délivrée exclusivement dans l'Espace Membre après validation de votre parcours.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
