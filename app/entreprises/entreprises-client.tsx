"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  Mail, 
  Award, 
  Check, 
  Globe, 
  Smartphone, 
  MonitorSmartphone, 
  Layers, 
  Zap 
} from "lucide-react"

export function EntreprisesClient() {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    companySize: "1 à 10 personnes",
    serviceType: "Développement de Sites Web & Applications Mobiles",
    message: ""
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contactName || !form.email || !form.phone || !form.companyName) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setStatus("success")
      } else {
        setErrorMsg(data.error || "Erreur lors de l'envoi de la demande.")
        setStatus("error")
      }
    } catch (err) {
      setErrorMsg("Erreur réseau. Veuillez réessayer.")
      setStatus("error")
    }
  }

  const scrollToForm = () => {
    const el = document.getElementById("devis-form")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const selectServiceAndScroll = (service: string) => {
    setForm(prev => ({ ...prev, serviceType: service }))
    scrollToForm()
  }

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <Header />

      {/* 1. Hero Section B2B (Style 2 colonnes aligné à gauche) */}
      <section className="py-14 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#ECC86B] bg-[#D4AF37]/10 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30">
                <Building2 className="size-3.5 text-[#D4AF37]" />
                SOLUTIONS ENTREPRISES &amp; INSTITUTIONS
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white leading-tight">
                Solutions Digitales, Développement Web &amp; Mobile et IA pour{" "}
                <span className="bg-gradient-to-r from-[#D4AF37] via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  Entreprises &amp; Dirigeants
                </span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                Développement sur-mesure de sites web &amp; applications mobiles, formations intra-entreprise, audits de maturité IA et automatisation des processus menés par Alfred Dah et l'équipe LE GUIDE IA.
              </p>

              {/* Key Metrics Pill Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <MonitorSmartphone className="size-3.5 text-emerald-400" />
                  Sites Web &amp; Apps Mobiles
                </span>
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <Sparkles className="size-3.5 text-[#D4AF37]" />
                  +40% de Productivité IA
                </span>
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Audit &amp; Sécurité
                </span>
                <span className="inline-flex items-center gap-1.5 bg-card/60 border border-border/80 rounded-xl px-3.5 py-2 text-foreground/90">
                  <Award className="size-3.5 text-[#D4AF37]" />
                  Accompagnement Clé en Main
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={scrollToForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black px-7 py-3.5 text-xs md:text-sm shadow-xl shadow-[#D4AF37]/25 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>Demander un Devis B2B</span>
                  <ArrowRight className="size-4" />
                </button>

                <a
                  href="https://wa.me/22605050577?text=Bonjour,%20nous%20souhaitons%20un%20devis%20pour%20notre%20entreprise%20(D%C3%A9veloppement%20Web/Mobile%20ou%20Formation%20IA)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/40 hover:bg-card text-foreground font-bold px-6 py-3.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                >
                  <PhoneCall className="size-4 text-[#D4AF37]" />
                  <span>Contacter par WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Media Display */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative rounded-3xl border border-[#D4AF37]/40 bg-slate-950 p-3.5 shadow-2xl glow-gold backdrop-blur-xl w-full max-w-[420px] group">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-slate-900">
                  <img
                    src="/images/b2b_enterprise_thumb.jpg"
                    alt="Transformation IA B2B Le Guide IA"
                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-slate-900/90 border border-[#D4AF37]/40 p-3 shadow-2xl backdrop-blur-md flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Award className="size-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-white">98% de Satisfaction</div>
                    <div className="text-[10px] text-muted-foreground">Apprenants &amp; Entreprises</div>
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
              Choisissez l'accompagnement le plus adapté pour créer vos plateformes numériques et déployer l'Intelligence Artificielle de manière sécurisée et rentable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
            
            {/* Card 1 : Développement Web & Mobile */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-7 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <MonitorSmartphone className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Développement Web &amp; Mobile</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conception sur-mesure de sites vitrines, portails métiers, plateformes SaaS et applications mobiles iOS &amp; Android intégrant l'IA.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Sites web vitrines &amp; plateformes SaaS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Applications mobiles iOS &amp; Android</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-400 shrink-0" />
                    <span>Intégration IA &amp; Mobile Money</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => selectServiceAndScroll("Développement de Sites Web & Applications Mobiles")} 
                className="w-full py-2.5 rounded-xl border border-border hover:border-emerald-500 hover:text-emerald-400 text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                Demander un devis dev →
              </button>
            </div>

            {/* Card 2 : Formations d'Équipe Sur-Mesure */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-7 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                  <Users className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Formations d'Équipe Sur-Mesure</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sessions pratiques de 1 à 3 jours adaptées à votre secteur (Finance, RH, Marketing, Direction). Montez vos cadres en compétences sur les outils IA métiers.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-[#D4AF37] shrink-0" />
                    <span>Programme adapté aux cas d'usage réels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-[#D4AF37] shrink-0" />
                    <span>Prise en main ChatGPT, Claude &amp; Gemini</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-[#D4AF37] shrink-0" />
                    <span>Attestation de formation d'équipe</span>
                  </li>
                </ul>
              </div>
              <button onClick={() => selectServiceAndScroll("Formations d'Équipe Sur-Mesure")} className="w-full py-2.5 rounded-xl border border-border hover:border-[#D4AF37] hover:text-[#ECC86B] text-xs font-bold text-foreground transition-all cursor-pointer">
                Demander cette formation →
              </button>
            </div>

            {/* Card 3 : Audit & Gouvernance IA */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-7 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Audit &amp; Gouvernance IA</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Évaluation des risques, sécurité des données d'entreprise et mise en conformité de l'utilisation de ChatGPT et LLMs dans vos équipes.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>Supervision par Auditeur certifié</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>Charte d'utilisation de l'IA en entreprise</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-primary shrink-0" />
                    <span>Prévention de la fuite de données sensibles</span>
                  </li>
                </ul>
              </div>
              <button onClick={() => selectServiceAndScroll("Audit & Gouvernance IA")} className="w-full py-2.5 rounded-xl border border-border hover:border-primary hover:text-primary text-xs font-bold text-foreground transition-all cursor-pointer">
                Demander un audit →
              </button>
            </div>

            {/* Card 4 : Accompagnement Stratégique & Automatisation */}
            <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-7 space-y-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-blue-500/50 transition-colors">
              <div className="space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Building2 className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Accompagnement Stratégique</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conseil de direction pour intégrer l'IA générative dans vos processus métier, automatiser les tâches répétitives et booster la productivité.
                </p>
                <ul className="space-y-2 pt-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-400 shrink-0" />
                    <span>Workflows d'automatisation Make &amp; n8n</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-400 shrink-0" />
                    <span>Création d'assistants sur-mesure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-400 shrink-0" />
                    <span>Suivi de projet et ROI mesurable</span>
                  </li>
                </ul>
              </div>
              <button onClick={() => selectServiceAndScroll("Accompagnement Stratégique & Automatisation")} className="w-full py-2.5 rounded-xl border border-border hover:border-blue-500 hover:text-blue-400 text-xs font-bold text-foreground transition-all cursor-pointer">
                Planifier un entretien →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 2bis. Pôle Ingénierie & Développement Web & Mobile */}
      <section className="py-20 bg-slate-950/90 border-b border-border/60 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">

          {/* Callout Action Banner */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="font-heading text-lg sm:text-xl font-bold text-white">
                Vous avez un projet de création ou de refonte Web / Mobile ?
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Nos ingénieurs et chefs de projets vous accompagnent du cadrage fonctionnel à la livraison clé en main.
              </p>
            </div>
            <button
              onClick={() => selectServiceAndScroll("Développement de Sites Web & Applications Mobiles")}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 text-xs shadow-xl shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Estimer mon projet Web / Mobile</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. Formulaire de Demande de Devis B2B (2 Colonnes) */}
      <section className="py-16 bg-slate-950/60" id="devis-form">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#ECC86B] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                DEVIS QUALIFIÉ SOUS 24H
              </span>

              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Remplissez ce formulaire court. Notre équipe analysera vos besoins et vous recontactera sous 24 heures ouvrées avec une estimation adaptée.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <Mail className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Contact Direct B2B</div>
                    <div>alfred@leguideai.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-muted-foreground">
                  <PhoneCall className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Ligne WhatsApp Officielle</div>
                    <div>+226 0505 0577</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card Column */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border/80 bg-card/60 p-6 md:p-10 shadow-2xl backdrop-blur-xl space-y-6">
                
                {status === "success" ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="inline-flex size-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
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
                        <label className="text-xs font-bold text-foreground/80">Nom de l'entreprise / Organisation *</label>
                        <input
                          type="text"
                          required
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder="Ex: Ecobank, Orange, ONUDI, Startup..."
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
                        <label className="text-xs font-bold text-foreground/80">Email *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="direction@gmail.com"
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
                          placeholder="+226 0505 0577"
                          className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Service souhaité *</label>
                        <select
                          value={form.serviceType}
                          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                          className="w-full rounded-xl border border-border bg-slate-900 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="Développement de Sites Web & Applications Mobiles">Développement de Sites Web &amp; Applications Mobiles</option>
                          <option value="Formations d'Équipe Sur-Mesure">Formations d'Équipe Sur-Mesure</option>
                          <option value="Audit & Gouvernance IA">Audit &amp; Gouvernance IA</option>
                          <option value="Accompagnement Stratégique & Automatisation">Accompagnement Stratégique &amp; Automatisation</option>
                          <option value="Conférence & Masterclass Privée">Conférence &amp; Masterclass Privée</option>
                          <option value="Autre / Projet Spécifique">Autre / Projet Spécifique</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground/80">Effectif de l'organisation *</label>
                        <select
                          value={form.companySize}
                          onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                          className="w-full rounded-xl border border-border bg-slate-900 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="1 à 10 personnes">1 à 10 personnes</option>
                          <option value="10 à 50 personnes">10 à 50 personnes</option>
                          <option value="50 à 200 personnes">50 à 200 personnes</option>
                          <option value="Plus de 200 personnes">Plus de 200 personnes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/80">Message / Description du besoin</label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Décrivez votre projet (site web, application mobile iOS/Android, formation IA pour votre équipe, intégration de paiements, délais)..."
                        className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black py-3.5 text-xs shadow-xl shadow-[#D4AF37]/25 disabled:opacity-50 transition-all cursor-pointer"
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
