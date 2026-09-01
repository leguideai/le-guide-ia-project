"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  X, Check, Copy, Upload, ArrowRight, ShieldCheck, 
  Lock, Sparkles, CheckCircle2, AlertCircle, CreditCard, 
  Smartphone, Tv, Zap, ExternalLink, Loader2, Mail, Users, 
  MessageCircle, ArrowRightCircle, Radio, Clock, Play
} from "lucide-react"
import { 
  countries, Country, getCountryFlag, PHONE_RULES, 
  formatPhoneNumber, parsePhoneNumber 
} from "@/lib/countries"
import { 
  SubscriptionPlan, 
  DEFAULT_SUBSCRIPTION_PRICING, 
  SubscriptionPricing,
  formatPriceFCFA,
  CERCLE_IA_BENEFITS
} from "@/lib/subscriptions"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  user?: any
  initialPlan?: SubscriptionPlan
  onSuccess?: () => void
  sourceContext?: "masterclass_replay" | "prompt_library" | "dashboard"
}

// Numéro de paiement Mobile Money officiel unique
const OFFICIAL_PAYMENT_NUMBER = "+226 75 75 72 73"
const OFFICIAL_BENEFICIARY = "Sanson Alfred Dah (LE GUIDE IA)"

const MOBILE_MONEY_ACCOUNTS = {
  wave: {
    name: "Wave",
    number: OFFICIAL_PAYMENT_NUMBER,
    beneficiary: OFFICIAL_BENEFICIARY,
    instructions: "Effectuez votre transfert via Wave vers le numéro officiel unique ci-dessous, puis renseignez l'ID de transaction ou joignez votre reçu."
  },
  orange_money: {
    name: "Orange Money",
    number: OFFICIAL_PAYMENT_NUMBER,
    beneficiary: OFFICIAL_BENEFICIARY,
    instructions: "Effectuez le transfert Orange Money vers le numéro officiel unique ci-dessous, puis saisissez le code/référence reçu par SMS."
  },
  mtn: {
    name: "MTN Mobile Money",
    number: OFFICIAL_PAYMENT_NUMBER,
    beneficiary: OFFICIAL_BENEFICIARY,
    instructions: "Effectuez votre paiement MTN MoMo vers le numéro officiel unique ci-dessous et saisissez votre référence de transaction."
  },
  moov: {
    name: "Moov Money",
    number: OFFICIAL_PAYMENT_NUMBER,
    beneficiary: OFFICIAL_BENEFICIARY,
    instructions: "Effectuez votre transfert Moov Money vers le numéro officiel unique ci-dessous et conservez votre SMS de confirmation."
  }
}

export function SubscriptionModal({
  isOpen,
  onClose,
  user,
  initialPlan = "3_months",
  onSuccess,
  sourceContext = "masterclass_replay"
}: SubscriptionModalProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan)
  const [paymentMethod, setPaymentMethod] = useState<"mobile_direct" | "stripe">("mobile_direct")
  const [mobileOperator, setMobileOperator] = useState<"wave" | "orange_money" | "mtn" | "moov">("wave")
  
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [transactionRef, setTransactionRef] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  
  // WhatsApp states
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return countries.find((c) => c.name === "Côte d'Ivoire") || countries[0]
  })
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [copiedNum, setCopiedNum] = useState<string | null>(null)
  
  const [pricing, setPricing] = useState<SubscriptionPricing>(DEFAULT_SUBSCRIPTION_PRICING)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any>(null)
  const [existingSubscription, setExistingSubscription] = useState<any>(null)

  // Hydrater les données utilisateur si connecté
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "")
      if (user.user_metadata?.whatsapp) {
        setWhatsappNumber(user.user_metadata.whatsapp.replace(/\D/g, ""))
      }
    }
  }, [user])

  // Charger les prix dynamiques et le statut actuel depuis l'API
  useEffect(() => {
    if (isOpen) {
      const emailToCheck = user?.email || email
      const url = emailToCheck ? `/api/subscriptions?email=${encodeURIComponent(emailToCheck)}` : "/api/subscriptions"
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.pricing) setPricing(data.pricing)
          if (data.status === "pending" || data.status === "pending_verification") {
            setExistingSubscription(data)
          } else {
            setExistingSubscription(null)
          }
        })
        .catch(() => {})
    }
  }, [isOpen, user?.email])

  if (!isOpen) return null

  const currentPrice = selectedPlan === "1_year" ? pricing.price1y : pricing.price3m
  const currentPriceDisplay = selectedPlan === "1_year" ? pricing.price1yDisplay : pricing.price3mDisplay

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedNum(text)
      setTimeout(() => setCopiedNum(null), 2500)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onload = () => setReceiptPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !fullName) {
      setError("Veuillez renseigner votre nom complet et votre adresse email.")
      return
    }

    if (paymentMethod === "mobile_direct" && !transactionRef.trim() && !receiptFile) {
      setError("Veuillez saisir votre référence de transaction ou joindre une capture d'écran du reçu.")
      return
    }

    setLoading(true)

    try {
      let uploadedReceiptUrl = ""
      if (receiptFile) {
        const formData = new FormData()
        formData.append("file", receiptFile)
        formData.append("bucket", "course-replays")
        formData.append("folder", "subscription_receipts")

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          uploadedReceiptUrl = uploadData.url
        }
      }

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          fullName: fullName.trim(),
          whatsapp: whatsappNumber ? `${selectedCountry.dial}${whatsappNumber}` : null,
          country: selectedCountry.name,
          plan: selectedPlan,
          paymentMethod: paymentMethod === "stripe" ? "stripe" : mobileOperator,
          transactionRef: transactionRef.trim(),
          receiptUrl: uploadedReceiptUrl
        })
      })

      const data = await res.json()
      if (data.success) {
        if (data.url) {
          // Redirection immédiate vers le portail de paiement Stripe Checkout officiel
          window.location.href = data.url
          return
        }
        setSuccessData(data)
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || "Une erreur est survenue lors de l'enregistrement.")
      }
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion au serveur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
      className="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl my-8 overflow-hidden text-left relative flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-slate-800 flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/30">
              <Sparkles className="size-3" />
              <span>Pass VIP Replays &amp; Prompts</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white">
              {sourceContext === "masterclass_replay" ? "Débloquez tous les Replays Masterclasses" : "Accédez à la Bibliothèque Complète de Prompts"}
            </h3>
            <p className="text-xs text-slate-400">
              Choisissez votre formule pour accéder instantanément à tous les contenus premium.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Écran de Succès */}
          {successData ? (
            <div className="py-6 text-center space-y-4 animate-scaleUp">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">Demande d'Abonnement Enregistrée !</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {paymentMethod === "stripe"
                    ? "Votre abonnement VIP est désormais actif ! Vous avez un accès illimité à tous les replays et prompts."
                    : "Votre paiement Mobile Money a bien été soumis. Notre équipe valide votre transaction sous 2h à 4h et vos accès seront automatiquement débloqués."}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 max-w-sm mx-auto">
                Email de confirmation envoyé à : <strong className="text-white">{email}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onSuccess) onSuccess()
                  if (typeof window !== "undefined") {
                    if (!window.location.pathname.includes("/dashboard")) {
                      router.push("/dashboard?tab=resources")
                    }
                  }
                }}
                className="py-3 px-8 rounded-xl bg-primary text-slate-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                Accéder à mes Contenus VIP
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Pending Subscription Alert if already submitted */}
              {existingSubscription && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 text-left animate-fadeIn">
                  <AlertCircle className="size-5 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-amber-200 text-sm block">⏳ Demande d'abonnement en cours de vérification</strong>
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      Votre paiement pour la formule <strong>{existingSubscription.planLabel || "Pass VIP"}</strong> (Réf: <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">{existingSubscription.transactionRef || "Reçu transmis"}</code>) a déjà été enregistré et est en cours de validation par notre équipe sous 2h à 4h.
                    </p>
                    <p className="text-[11px] text-amber-400 font-semibold pt-1">
                      Vos accès seront automatiquement activés. Vous n'avez pas besoin d'effectuer un second paiement.
                    </p>
                    <div className="pt-1.5">
                      <a
                        href={`https://wa.me/22675757273?text=${encodeURIComponent(`Bonjour Le Guide IA, je souhaite vérifier mon abonnement VIP (${existingSubscription.planLabel || "Pass VIP"}, Réf: ${existingSubscription.transactionRef || ""}) pour mon compte ${email || user?.email || ""}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-amber-200 hover:text-white underline underline-offset-2 text-xs"
                      >
                        <span>Demander une activation urgente via WhatsApp</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 1. Sélecteur de Formule */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>1. Choisissez votre Formule d'Abonnement :</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Plan 3 Mois */}
                  <div
                    onClick={() => setSelectedPlan("3_months")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedPlan === "3_months"
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase text-slate-300">Pass 3 Mois</span>
                      {selectedPlan === "3_months" && (
                        <span className="size-4 rounded-full bg-primary flex items-center justify-center text-slate-950">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-white">{pricing.price3mDisplay}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Accès complet pendant 90 jours</p>
                  </div>

                  {/* Plan 1 An */}
                  <div
                    onClick={() => setSelectedPlan("1_year")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedPlan === "1_year"
                        ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-primary text-slate-950 text-[9px] font-black uppercase shadow-xs">
                      Économisez 10 000 F
                    </span>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black uppercase text-amber-400">Pass 1 An (VIP)</span>
                      {selectedPlan === "1_year" && (
                        <span className="size-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-950">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-white">{pricing.price1yDisplay}</div>
                    <p className="text-[11px] text-slate-400 mt-1">365 jours + Mises à jour incluses</p>
                  </div>

                </div>
              </div>

              {/* Ce qui est inclus : Les 6 Avantages Officiels du Cercle IA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#101726] border border-slate-800 space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <div className="size-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Sparkles className="size-3.5" />
                    </div>
                    <span className="text-white font-extrabold">Les Avantages Exclusifs du Cercle IA :</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Max 30 Places
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Mail className="size-3.5 text-primary shrink-0" />
                        <span>Veille IA Hebdo</span>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Chaque Lundi</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Sélection stratégique des actus et outils IA concrets.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Sparkles className="size-3.5 text-purple-400 shrink-0" />
                        <span>Prompts &amp; Plans</span>
                      </div>
                      <span className="text-[9px] font-bold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">Chaque Mois</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Bibliothèque de prompts métiers enrichie mensuellement.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Play className="size-3.5 text-emerald-400 shrink-0" />
                        <span>Replays Privés HD</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">100% Illimité</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Toutes les rediffusions des masterclasses du dimanche.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <Radio className="size-3.5 text-rose-400 shrink-0" />
                        <span>Prolongation Live</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded">1x / Mois (1h)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Dernier dimanche (16h30-17h30) : coaching direct avec Alfred Dah.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                        <ArrowRightCircle className="size-3.5 text-amber-400 shrink-0" />
                        <span>100% Déductible du Bootcamp</span>
                      </div>
                      <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">Garantie 6 Mois</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Si vous rejoignez un Bootcamp dans les 6 mois, vos <strong>{selectedPlan === "1_year" ? pricing.price1yDisplay : pricing.price3mDisplay}</strong> sont intégralement déduits du montant du Bootcamp. L'abonnement ne vous coûte donc rien !
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Coordonnées de l'apprenant */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-300 block">
                  2. Vos Coordonnées pour l'activation :
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Ex: Kouamé Jean"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-primary placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre.email@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-primary placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Numéro WhatsApp (pour support &amp; notifications)</label>
                  <div className="flex gap-2">
                    <div className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white flex items-center gap-1.5 shrink-0">
                      <span>{getCountryFlag(selectedCountry.code)}</span>
                      <span className="font-mono text-slate-400">{selectedCountry.dial}</span>
                    </div>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="Ex: 07 12 34 56 78"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-primary placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Moyen de Paiement */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 block">
                  3. Choisissez votre Moyen de Paiement :
                </label>

                {/* Tabs Mobile Money / Carte */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mobile_direct")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === "mobile_direct"
                        ? "bg-primary text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="size-3.5" />
                    <span>Mobile Money Direct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === "stripe"
                        ? "bg-primary text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="size-3.5" />
                    <span>Carte Bancaire (Stripe)</span>
                  </button>
                </div>

                {/* Mobile Money Operator Details */}
                {paymentMethod === "mobile_direct" && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                    
                    {/* Choix de l'opérateur */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "wave", label: "Wave", color: "border-sky-500 text-sky-400" },
                        { id: "orange_money", label: "Orange", color: "border-orange-500 text-orange-400" },
                        { id: "mtn", label: "MTN", color: "border-yellow-500 text-yellow-400" },
                        { id: "moov", label: "Moov", color: "border-blue-500 text-blue-400" }
                      ].map(op => (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => setMobileOperator(op.id as any)}
                          className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                            mobileOperator === op.id
                              ? `bg-white/10 ${op.color} shadow-sm`
                              : "border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>

                    {/* Instructions du transfert */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                      <div className="text-[11px] text-slate-400">
                        {MOBILE_MONEY_ACCOUNTS[mobileOperator].instructions}
                      </div>
                      
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-mono">Bénéficiaire : {MOBILE_MONEY_ACCOUNTS[mobileOperator].beneficiary}</div>
                          <div className="font-mono text-sm font-bold text-white">{MOBILE_MONEY_ACCOUNTS[mobileOperator].number}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(MOBILE_MONEY_ACCOUNTS[mobileOperator].number)}
                          className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          {copiedNum === MOBILE_MONEY_ACCOUNTS[mobileOperator].number ? (
                            <>
                              <Check className="size-3" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] text-amber-400/90 font-medium">
                        💡 Montant exact à envoyer : <strong>{currentPriceDisplay}</strong>
                      </div>
                    </div>

                    {/* Saisie de la référence / Upload Reçu */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">
                          Référence de transaction / ID SMS reçu :
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={e => setTransactionRef(e.target.value)}
                          placeholder="Ex: CI260831.1405.A12345 ou Réf Wave"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-primary placeholder:text-slate-600 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">
                          Capture d'écran du reçu <span className="text-slate-500">(Optionnel mais accélère la validation)</span> :
                        </label>
                        <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-950 text-xs text-slate-400 hover:text-white transition-all cursor-pointer">
                          <Upload className="size-4 text-primary" />
                          <span>{receiptFile ? receiptFile.name : "Téléverser la capture d'écran du paiement"}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                )}

                {/* Stripe Info */}
                {paymentMethod === "stripe" && (
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Lock className="size-4" />
                      <span>Paiement sécurisé par Carte Bancaire</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Votre abonnement sera activé automatiquement et instantanément dès la validation de votre carte (Visa, Mastercard, etc.).
                    </p>
                  </div>
                )}

              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Bouton de Soumission */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary via-primary to-amber-500 text-slate-950 font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{paymentMethod === "stripe" ? "Redirection vers Stripe Checkout..." : "Traitement de votre abonnement..."}</span>
                    </>
                  ) : paymentMethod === "stripe" ? (
                    <>
                      <CreditCard className="size-4" />
                      <span>Payer par Carte Bancaire via Stripe — {currentPriceDisplay}</span>
                      <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <>
                      <span>Confirmer mon Abonnement — {currentPriceDisplay}</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  🔒 Transaction 100% sécurisée • Facture &amp; Reçu envoyés par email immédiatement.
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  )
}
