"use client"

import { useState } from "react"
import { UdemyHeader } from "@/components/udemy-header"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { Building2, ShieldCheck, Users, Send, CheckCircle2, AlertCircle } from "lucide-react"

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
    // Simulation / Supabase service request endpoint
    setTimeout(() => {
      setStatus("success")
    }, 1000)
  }

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <UdemyHeader />

      {/* Hero B2B */}
      <section className="pt-36 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
          <Building2 className="size-3.5" />
          Solutions Entreprises & Institutions
        </span>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance max-w-4xl mx-auto">
          Accélérez la transformation IA de vos équipes et de vos processus
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-pretty">
          Formations intra-entreprise sur-mesure, audits de maturité IA et gouvernance des systèmes d'information menés par Alfred Dah, auditeur certifié CISA.
        </p>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card/40 p-8 space-y-4 backdrop-blur-md">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Users className="size-6" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">Formations d'Équipe Sur-Mesure</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sessions pratiques de 1 à 3 jours adaptées à votre secteur (Finance, RH, Marketing, Direction). Montez vos cadres en compétences sur les outils IA métiers.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-8 space-y-4 backdrop-blur-md">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">Audit & Gouvernance IA (CISA)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Évaluation des risques, sécurité des données d'entreprise et mise en conformité de l'utilisation de ChatGPT et LLMs dans vos équipes.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-8 space-y-4 backdrop-blur-md">
          <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Building2 className="size-6" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">Accompagnement Stratégique</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Conseil de direction pour intégrer l'IA générative dans vos processus métier, réduire vos coûts opérationnels et booster la productivité.
          </p>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-16 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl font-bold text-foreground">Demander un devis personnalisé</h2>
            <p className="text-xs text-muted-foreground">Notre équipe vous recontacte sous 24h ouvrées.</p>
          </div>

          {status === "success" ? (
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Demande envoyée avec succès !</h3>
              <p className="text-xs text-muted-foreground">Merci. Alfred Dah et l'équipe LE GUIDE IA analyseront votre besoin et vous recontacteront sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="size-4" />
                {status === "loading" ? "Envoi en cours..." : "Envoyer la demande de devis"}
              </button>
            </form>
          )}
        </div>
      </section>

      <CtaFooter />
    </main>
  )
}
