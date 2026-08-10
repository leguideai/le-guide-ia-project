"use client"

import { useState } from "react"
import { UdemyHeader } from "@/components/udemy-header"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { Building2, ShieldCheck, Users, Send, CheckCircle2, AlertCircle, Sparkles, ArrowRight, PhoneCall, Mail, Award, Check } from "lucide-react"

export default function EntreprisesPage() {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    companySize: "10-50",
    serviceType: "formation",
    message: ""
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contactName || !form.email || !form.phone) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorMsg("")
    // Simulation submission
    setTimeout(() => {
      setStatus("success")
    }, 1000)
  }

  const scrollToForm = () => {
    const el = document.getElementById("devis-form")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <UdemyHeader />

      {/* 1. Hero Section B2B (Style Udemy 2 colonnes aligné à gauche) */}
      <section className="py-14 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                <Building2 className="size-3.5 text-emerald-400" />
                SOLUTIONS ENTREPRISES & INSTITUTIONS
              </span>

              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Formations intra-entreprise sur-mesure, audits de maturité IA et gouvernance des systèmes d'information menés par Alfred Dah, auditeur certifié CISA.
              </p>

              {/* Key Metrics Pill Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <Sparkles className="size-3.5 text-emerald-400" />
                  +40% de Productivité Équipe
                </span>
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Audit & Sécurité CISA
                </span>
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <Award className="size-3.5 text-amber-400" />
                  Accompagnement Sur-Mesure
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={scrollToForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 text-xs md:text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>Demander un Devis B2B</span>
                  <ArrowRight className="size-4" />
                </button>

                <a
                  href="https://wa.me/22675757273?text=Bonjour,%20nous%20souhaitons%20un%20devis%20de%20formation%20IA%20pour%20notre%20entreprise."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/40 hover:bg-card text-foreground font-bold px-6 py-3.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                >
                  <PhoneCall className="size-4 text-emerald-400" />
                  <span>Contacter par WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Media Display */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative rounded-3xl border border-emerald-500/30 bg-slate-950 p-3.5 shadow-2xl backdrop-blur-xl w-full max-w-[420px] group">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-slate-900">
                  <img
                    src="/images/b2b_enterprise_thumb.jpg"
                    alt="Transformation IA B2B Le Guide IA"
                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-3 shadow-2xl backdrop-blur-md flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white">98% de Satisfaction</div>
                    <div className="text-[10px] text-muted-foreground">Apprenants & Entreprises</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Piliers d'Intervention Services Grid */}
      <section className="py-16 bg-background border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10">
          
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              NOS PILIERS D'INTERVENTION B2B
            </span>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Choisissez l'accompagnement le plus adapté pour déployer l'Intelligence Artificielle de manière sécurisée et rentable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            
            {/* Card 1 */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Users className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Formations d'Équipe Sur-Mesure</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sessions pratiques de 1 à 3 jours adaptées à votre secteur (Finance, RH, Marketing, Direction). Montez vos cadres en compétences sur les outils IA métiers.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Programme adapté aux cas d'usage réels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Prise en main ChatGPT, Claude & Gemini</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Attestation de formation d'équipe</span>
                  </li>
                </ul>
              </div>
              <button onClick={scrollToForm} className="w-full py-2.5 rounded-xl border border-border hover:border-emerald-500 text-xs font-bold text-foreground transition-all cursor-pointer">
                Demander cette formation →
              </button>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Audit & Gouvernance IA (CISA)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Évaluation des risques, sécurité des données d'entreprise et mise en conformité de l'utilisation de ChatGPT et LLMs dans vos équipes.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Supervision par Auditeur certifié CISA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Charte d'utilisation de l'IA en entreprise</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary" />
                    <span>Prévention de la fuite de données sensibles</span>
                  </li>
                </ul>
              </div>
              <button onClick={scrollToForm} className="w-full py-2.5 rounded-xl border border-border hover:border-primary text-xs font-bold text-foreground transition-all cursor-pointer">
                Demander un audit →
              </button>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-8 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Building2 className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Accompagnement Stratégique</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conseil de direction pour intégrer l'IA générative dans vos processus métier, réduire vos coûts opérationnels et booster la productivité.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-purple-400" />
                    <span>Workflows d'automatisation Make & n8n</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-purple-400" />
                    <span>Création d'assistants sur-mesure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-purple-400" />
                    <span>Suivi de projet et ROI mesurable</span>
                  </li>
                </ul>
              </div>
              <button onClick={scrollToForm} className="w-full py-2.5 rounded-xl border border-border hover:border-purple-500 text-xs font-bold text-foreground transition-all cursor-pointer">
                Planifier un entretien →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Formulaire de Demande de Devis B2B (2 Colonnes) */}
      <section className="py-16 bg-slate-950/60" id="devis-form">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                DEVIS GRATUIT & RECTIFICATIF SOUS 24H
              </span>

              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Remplissez ce formulaire court. Notre équipe analyseront vos besoins et vous recontacteront sous 24 heures ouvrées.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <Mail className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Contact Direct B2B</div>
                    <div>alfred@leguideai.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <PhoneCall className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Ligne WhatsApp Officielle</div>
                    <div>+226 75 75 72 73</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card Column */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 md:p-10 shadow-2xl backdrop-blur-xl space-y-6">
                
                {status === "success" ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Demande envoyée avec succès !</h3>
                    <p className="text-xs text-muted-foreground">Merci. Alfred Dah et l'équipe LE GUIDE IA analyseront votre besoin et vous recontacteront sous 24h.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {status === "error" && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center gap-2.5 text-xs text-rose-400">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Nom de l'entreprise / Organisation</label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder="Ex: Ecobank, Orange, ONUDI..."
                          className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Nom du responsable *</label>
                        <input
                          type="text"
                          required
                          value={form.contactName}
                          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                          placeholder="Nom & Prénom"
                          className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Email professionnel *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="direction@entreprise.com"
                          className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Numéro Téléphone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+225 07 00 00 00"
                          className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/80">Message / Besoins spécifiques</label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Décrivez votre projet de formation ou vos objectifs..."
                        className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 text-xs shadow-xl disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send className="size-4" />
                      {status === "loading" ? "Envoi en cours..." : "Envoyer la demande de devis B2B"}
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Pied de page officiel sans bloc CTA doublon */}
      <CtaFooter hideCta={true} />
    </main>
  )
}
