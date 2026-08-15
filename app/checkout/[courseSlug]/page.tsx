"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { UdemyHeader } from "@/components/udemy-header"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle2, AlertCircle, GraduationCap, UserCheck, Copy, Check } from "lucide-react"

interface PageProps {
  params: Promise<{ courseSlug: string }>
}

// Mettre à true pour réactiver PayTech quand vous aurez les documents NINEA / RC
const ENABLE_PAYTECH = false

export default function CheckoutPage({ params }: PageProps) {
  const { courseSlug } = use(params)

  const isBusiness = courseSlug === "bootcamp-ia-business"
  const courseTitle = isBusiness ? "Bootcamp IA Business" : "Bootcamp IA Pro"
  const coursePriceFcfa = isBusiness ? "199 000 FCFA" : "99 000 FCFA"
  const coursePriceUsd = isBusiness ? "300 € / $330" : "150 € / $165"
  const courseSchedule = isBusiness 
    ? "Lun-Ven 19h-21h GMT + Dimanche 16h-21h GMT" 
    : "Lun-Ven 19h-21h GMT + Samedi 8h-13h GMT"

  const [paymentMethod, setPaymentMethod] = useState<"mobile_direct" | "stripe" | "paytech">("mobile_direct")
  const [mobileOperator, setMobileOperator] = useState<"wave" | "orange_money" | "moov" | "mtn">("wave")
  const [transactionRef, setTransactionRef] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [country, setCountry] = useState("Côte d'Ivoire")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedNum, setCopiedNum] = useState<string | null>(null)

  const price = isBusiness ? 199000 : 99000

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setIsLoggedIn(true)
          if (data.user.email) setEmail(data.user.email)
          const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name
          if (name) setFullName(name)
          if (data.user.user_metadata?.whatsapp) setWhatsapp(data.user.user_metadata.whatsapp)
        } else {
          const savedEmail = localStorage.getItem("user_email")
          const savedName = localStorage.getItem("user_name")
          if (savedEmail) {
            setEmail(savedEmail)
            setIsLoggedIn(true)
          }
          if (savedName) setFullName(savedName)
        }
      } catch (err) {
        console.warn("Could not auto-fetch user:", err)
      }
    }
    loadUserData()
  }, [])

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNum(num)
    setTimeout(() => setCopiedNum(null), 2000)
  }

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, courseTitle, price, email, fullName, whatsapp, country }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.message || data.error || "Une erreur est survenue lors de l'initialisation du paiement Stripe.")
        setLoading(false)
      }
    } catch (err: any) {
      setError("Erreur réseau. Veuillez réessayer.")
      setLoading(false)
    }
  }

  const handleDirectMobileCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!transactionRef.trim()) {
      setError("Veuillez saisir la référence ou le N° de dépôt Mobile Money.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/payment/direct-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, courseTitle, price, email, fullName, whatsapp, country, transactionRef, mobileOperator }),
      })
      const data = await res.json()

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError(data.message || "Erreur lors de la validation du paiement Mobile Money.")
        setLoading(false)
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur.")
      setLoading(false)
    }
  }

  // Conservé pour réactivation immédiate PayTech dès obtention des papiers d'entreprise
  const handlePayTechCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/payment/paytech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, courseTitle, price, email, fullName, whatsapp, country }),
      })
      const data = await res.json()

      const targetUrl = data.redirectUrl || data.redirect_url
      if (targetUrl) {
        window.location.href = targetUrl
      } else {
        setError(data.message || data.error || "Paiement PayTech indisponible.")
        setLoading(false)
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur PayTech.")
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (paymentMethod === "mobile_direct") {
      handleDirectMobileCheckout(e)
    } else if (paymentMethod === "stripe") {
      handleStripeCheckout(e)
    } else if (paymentMethod === "paytech") {
      handlePayTechCheckout(e)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <UdemyHeader />
      <div className="py-12 px-4 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/bootcamp" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span>Changer de formule</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
            <span className="font-heading text-base font-extrabold tracking-tight">LE GUIDE <span className="text-primary">IA</span></span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-8 md:grid-cols-12 items-start">
          
          {/* Order Form (7 Cols) */}
          <div className="md:col-span-7 rounded-3xl border border-border bg-card/70 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                Commande Sécurisée
              </span>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground mt-2">
                Informations & Règlement
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Remplissez vos coordonnées pour accéder à ce bootcamp.
              </p>
            </div>

            {isLoggedIn && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-xs text-emerald-300 shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                <div>
                  <span className="font-extrabold block text-foreground">Compte connecté : {fullName || email}</span>
                  <span className="text-[11px] text-muted-foreground">Vos coordonnées sont automatiquement récupérées. Vous n'avez rien à ressaisir !</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3 text-xs text-rose-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80">Adresse Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+226 75 75 72 73"
                    className="w-full rounded-xl border border-border bg-input/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/80">Pays de résidence</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Mali">Mali</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Niger">Niger</option>
                  <option value="Cameroun">Cameroun</option>
                  <option value="France">France / Europe</option>
                  <option value="Canada">Canada / USA</option>
                  <option value="Autre">Autre pays</option>
                </select>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-foreground/80">Mode de paiement</label>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mobile_direct")}
                    className={`flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === "mobile_direct"
                        ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                        : "border-border bg-card/50 hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Smartphone className="size-4" />
                      </div>
                      {paymentMethod === "mobile_direct" && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Mobile Money Direct</div>
                      <div className="text-[10px] text-muted-foreground">Wave, Orange Money, Moov, MTN</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === "stripe"
                        ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                        : "border-border bg-card/50 hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="size-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <CreditCard className="size-4" />
                      </div>
                      {paymentMethod === "stripe" && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Carte Internationale</div>
                      <div className="text-[10px] text-muted-foreground">Visa, MasterCard, Amex</div>
                    </div>
                  </button>

                  {ENABLE_PAYTECH && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paytech")}
                      className={`flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all ${
                        paymentMethod === "paytech"
                          ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                          : "border-border bg-card/50 hover:bg-secondary/60"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="size-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Smartphone className="size-4" />
                        </div>
                        {paymentMethod === "paytech" && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">PayTech Guichet</div>
                        <div className="text-[10px] text-muted-foreground">Paiement automatisé</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Money Direct Info Box & Ref Field */}
              {paymentMethod === "mobile_direct" && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Smartphone className="size-4" />
                      <span>Instructions de dépôt Mobile Money</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Effectuez le transfert de <strong className="text-foreground font-extrabold">{coursePriceFcfa}</strong> sur le numéro officiel unique ci-dessous (Wave, Orange Money, Moov, MTN) :
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-emerald-500/30 shadow-md">
                    <div>
                      <div className="font-mono text-base text-emerald-400 font-extrabold tracking-wider mt-0.5">+226 75 75 72 73</div>
                      <div className="text-[11px] text-muted-foreground font-medium">Nom du destinataire : Sanson Alfred Dah</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("+22675757273")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer border border-emerald-500/30"
                      title="Copier le numéro"
                    >
                      {copiedNum === "+22675757273" ? (
                        <>
                          <Check className="size-4" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-foreground/90">
                      ID de Transaction / N° du dépôt Mobile Money *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: REF-WAVE-8921 ou N° de téléphone expéditeur"
                      className="w-full rounded-xl border border-emerald-500/40 bg-input/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 text-xs md:text-sm shadow-xl disabled:opacity-50 transition-all cursor-pointer mt-4"
              >
                <Lock className="size-4" />
                <span>
                  {loading 
                    ? "Traitement de votre inscription..." 
                    : paymentMethod === "mobile_direct"
                    ? "Valider mon paiement Mobile Money"
                    : "Payer par Carte Internationale"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground text-center pt-2">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>Cryptage SSL 256-bit — Accès et confirmation immédiats</span>
              </div>
            </form>
          </div>

          {/* Summary Card (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur-xl space-y-6">
            <div className="space-y-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                {isBusiness ? (
                  <UserCheck className="size-5 text-amber-400" />
                ) : (
                  <GraduationCap className="size-5 text-primary" />
                )}
                <h3 className="font-heading text-lg font-bold text-foreground">{courseTitle}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                15h de formation intensive en direct avec Alfred Dah.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Formule</span>
                <span className="font-bold text-foreground">{courseTitle}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Créneaux Live</span>
                <span className="font-semibold text-foreground text-right">{courseSchedule}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-border/60 pt-3">
                <span className="font-bold text-foreground">Total à régler</span>
                <div className="text-right">
                  <div className="text-lg font-black text-primary">{coursePriceFcfa}</div>
                  <div className="text-[10px] text-muted-foreground">≈ {coursePriceUsd}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </main>
)
}
