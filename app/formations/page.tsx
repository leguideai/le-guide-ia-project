"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { supabase } from "@/lib/supabase"
import { FormationItem, FormationCategory, DEFAULT_FORMATIONS, DEFAULT_FORMATION_CATEGORIES } from "@/lib/formations-data"
import { Header } from "@/components/header"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Zap, 
  Star, 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  MessageSquare, 
  ArrowRight, 
  Play, 
  Lock, 
  Layers, 
  Bot, 
  FileText, 
  Check, 
  ShoppingBag,
  CreditCard,
  Smartphone,
  Copy,
  X,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Phone,
  User as UserIcon,
  Mail
} from "lucide-react"

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

function getBadgeClasses(badge: string | undefined) {
  const b = badge?.toLowerCase() || ""
  if (b.includes("demande")) return "bg-rose-500/20 text-rose-300 border-rose-500/40"
  if (b.includes("seller") || b.includes("vente") || b.includes("populaire")) return "bg-[#D4AF37]/20 text-[#ECC86B] border border-[#D4AF37]/40"
  if (b.includes("nouveau")) return "bg-blue-500/20 text-blue-300 border-blue-500/40"
  if (b.includes("prospect")) return "bg-[#D4AF37]/20 text-[#ECC86B] border border-[#D4AF37]/40"
  return "bg-primary/20 text-primary border-primary/40"
}

function getToolTheme(tool: string) {
  switch (tool) {
    case "claude":
      return {
        bg: "from-[#d97757]/10 via-[#d97757]/5 to-transparent",
        badge: "bg-[#d97757]/20 text-[#f5a88e] border-[#d97757]/40",
        border: "hover:border-[#d97757]/60",
        text: "text-[#d97757]",
        icon: <Bot className="size-5 text-[#d97757]" />
      }
    case "chatgpt":
      return {
        bg: "from-[#10a37f]/10 via-[#10a37f]/5 to-transparent",
        badge: "bg-[#10a37f]/20 text-[#6ee7b7] border-[#10a37f]/40",
        border: "hover:border-[#10a37f]/60",
        text: "text-[#10a37f]",
        icon: <Sparkles className="size-5 text-[#10a37f]" />
      }
    case "notebook":
      return {
        bg: "from-[#4285f4]/10 via-[#4285f4]/5 to-transparent",
        badge: "bg-[#4285f4]/20 text-[#93c5fd] border-[#4285f4]/40",
        border: "hover:border-[#4285f4]/60",
        text: "text-[#4285f4]",
        icon: <FileText className="size-5 text-[#4285f4]" />
      }
    case "linkedin":
      return {
        bg: "from-[#0a66c2]/10 via-[#0a66c2]/5 to-transparent",
        badge: "bg-[#0a66c2]/20 text-[#7dd3fc] border-[#0a66c2]/40",
        border: "hover:border-[#0a66c2]/60",
        text: "text-[#0a66c2]",
        icon: <LinkedinIcon className="size-5 text-[#0a66c2]" />
      }
    default:
      return {
        bg: "from-primary/10 via-primary/5 to-transparent",
        badge: "bg-primary/20 text-primary border-primary/40",
        border: "hover:border-primary/60",
        text: "text-primary",
        icon: <Zap className="size-5 text-primary" />
      }
  }
}

function formatPriceNum(num: number): string {
  if (!num || num <= 0) return "GRATUIT"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA"
}

function FormationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formations, setFormations] = useState<FormationItem[]>([])
  const [categories, setCategories] = useState<FormationCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userEnrollments, setUserEnrollments] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Checkout Modal State
  const [selectedFormation, setSelectedFormation] = useState<FormationItem | null>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "mtn_momo" | "stripe">("wave")
  const [transactionRef, setTransactionRef] = useState("")
  const [copiedNum, setCopiedNum] = useState<string | null>(null)
  const [buyerForm, setBuyerForm] = useState({
    fullName: "",
    email: "",
    whatsapp: ""
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Fetch Formations & Auth state
  useEffect(() => {
    async function loadData() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (authData?.user) {
          setUser(authData.user)
          setBuyerForm(prev => ({
            ...prev,
            email: authData.user.email || "",
            fullName: authData.user.user_metadata?.full_name || ""
          }))
          // Fetch enrolled courses
          const { data: ucData } = await supabase
            .from("user_courses")
            .select("course_slug")
            .eq("user_email", authData.user.email?.toLowerCase().trim())
            .eq("status", "active")

          if (ucData) {
            setUserEnrollments(ucData.map((u: any) => u.course_slug))
          }
        }

        const res = await fetch("/api/formations")
        const data = await res.json()
        if (data?.formations && Array.isArray(data.formations) && data.formations.length > 0) {
          setFormations(data.formations)
        }
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
        }
      } catch (err) {
        console.error("Error loading formations:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Auto-trigger checkout or tab filter if query parameter ?buy=slug or ?category=... is present
  useEffect(() => {
    const buySlug = searchParams.get("buy")
    if (buySlug && formations.length > 0) {
      const match = formations.find(f => f.slug === buySlug)
      if (match) {
        setSelectedFormation(match)
        setCheckoutModalOpen(true)
      }
    }

    const catParam = searchParams.get("category")
    if (catParam) {
      setActiveTab(catParam)
    }
  }, [searchParams, formations])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedNum(text)
    setTimeout(() => setCopiedNum(null), 2500)
  }

  const handleBuyClick = (formation: FormationItem) => {
    setSelectedFormation(formation)
    setErrorMessage("")
    setPaymentSuccess(false)
    setTransactionRef("")
    setCheckoutModalOpen(true)
  }

  // Handle direct payment checkout or Stripe redirect
  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFormation) return

    const buyerEmail = (user?.email || buyerForm.email).toLowerCase().trim()
    const buyerName = user?.user_metadata?.full_name || buyerForm.fullName.trim() || buyerEmail
    const buyerWhatsapp = buyerForm.whatsapp.trim() || user?.user_metadata?.whatsapp || ""

    if (!buyerEmail) {
      setErrorMessage("Veuillez renseigner une adresse email valide pour recevoir vos accès.")
      return
    }

    setProcessingPayment(true)
    setErrorMessage("")

    // 1. PAIEMENT CARTE BANCAIRE VIA STRIPE
    if (paymentMethod === "stripe") {
      try {
        const res = await fetch("/api/payment/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseSlug: selectedFormation.slug,
            courseTitle: selectedFormation.title,
            price: selectedFormation.price,
            fullName: buyerName,
            email: buyerEmail,
            whatsapp: buyerWhatsapp,
            country: "CI"
          })
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return
        } else {
          setErrorMessage(data.message || data.error || "Erreur lors de l'initialisation du paiement Stripe.")
        }
      } catch (err: any) {
        setErrorMessage("Erreur de communication avec Stripe. Veuillez réessayer.")
      } finally {
        setProcessingPayment(false)
      }
      return
    }

    // 2. PAIEMENT DIRECT MOBILE MONEY (Wave, Orange Money, MTN MoMo)
    if (!transactionRef.trim()) {
      setErrorMessage("Veuillez renseigner la référence de transaction ou votre numéro expéditeur.")
      setProcessingPayment(false)
      return
    }

    try {
      // Enregistrer la transaction Mobile Money (Status: pending_verification, validation sous 24h)
      const res = await fetch("/api/payment/direct-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: selectedFormation.slug,
          courseTitle: selectedFormation.title,
          price: selectedFormation.price,
          fullName: buyerName,
          email: buyerEmail,
          whatsapp: buyerWhatsapp,
          country: "CI",
          transactionRef: transactionRef.trim(),
          mobileOperator: paymentMethod
        })
      })

      const data = await res.json()
      if (data.success) {
        setPaymentSuccess(true)
      } else {
        setErrorMessage(data.message || "Erreur lors de l'enregistrement de votre paiement.")
      }
    } catch (e) {
      console.error("Error submitting mobile money payment:", e)
      setErrorMessage("Une erreur est survenue lors de l'enregistrement de votre paiement.")
    } finally {
      setProcessingPayment(false)
    }
  }

  const tabs = [
    { id: "all", label: "Toutes les Formations" },
    ...categories.map(c => ({ id: c.slug, label: c.label }))
  ]

  const filteredFormations = activeTab === "all" 
    ? formations 
    : formations.filter(f => 
        (f.category_slug && f.category_slug.toLowerCase() === activeTab.toLowerCase()) || 
        f.tool_icon?.toLowerCase() === activeTab.toLowerCase() || 
        f.slug?.includes(activeTab.toLowerCase())
      )

  const displayedFormations = filteredFormations.length > 0 ? filteredFormations : formations

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-[#090d16]">
      
      {/* 1. Header Global  Style */}
      <Header />

      {/* 2. Hero Section : Alignement Propre & Harmonisé avec le reste du site */}
      <section className="relative py-12 sm:py-16 md:py-20 border-b border-border/50 bg-slate-950/70 overflow-hidden">
        
        {/* Glow Subtle Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-primary/5 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 space-y-6 text-left w-full">
          
          <div className="space-y-3 w-full">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 shadow-sm">
              <Sparkles className="size-3.5 text-amber-400" />
              FORMATIONS VIDÉOS &amp; MASTERCLASSES À LA DEMANDE
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight w-full">
              Maîtrisez les meilleurs outils d'IA à votre rythme
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
              Des masterclasses vidéo autonomes, étape par étape, avec accès à vie 24h/24 et boîtes à outils de prompts prêtes à l'emploi.
            </p>
          </div>

          {/* Social Proof Badges */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs sm:text-sm font-bold text-slate-300 pt-2">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
              <span><strong className="text-white">13 000+</strong> professionnels formés</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <span><strong className="text-white">4.9/5</strong> avis vérifiés</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <InfinityIcon className="size-4 text-primary shrink-0" />
              <span><strong className="text-white">Accès à vie</strong> &amp; Replays HD</span>
            </div>
          </div>

          {/* 3. Onglets de Filtrage par Catégorie / Outil */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                  activeTab === tab.id
                    ? "bg-primary text-slate-950 border-primary font-black shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Formations List : Disposition Aérée Haute Conversion */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-16 md:space-y-24 text-left">
        
        {loading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 md:pb-24 border-b border-slate-800/80 animate-pulse"
            >
              <div className="space-y-6 lg:col-span-7">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-28 bg-white/10 rounded-full" />
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-9 w-full bg-white/10 rounded-2xl" />
                  <div className="h-6 w-2/3 bg-white/5 rounded-xl" />
                </div>
                <div className="h-16 w-full bg-white/5 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-5 w-3/4 bg-white/5 rounded" />
                  <div className="h-5 w-2/3 bg-white/5 rounded" />
                </div>
                <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
              </div>
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-[380px] aspect-[4/3] rounded-3xl bg-white/5 border border-white/10" />
              </div>
            </div>
          ))
        ) : (
          displayedFormations.map((f, idx) => {
          const isEnrolled = userEnrollments.includes(f.slug)
          const isReverse = idx % 2 !== 0

          return (
            <motion.div
              key={f.id || f.slug}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 md:pb-24 ${
                idx !== displayedFormations.length - 1 ? "border-b border-slate-800/80" : ""
              }`}
            >
              
              {/* Colonne 1 : Détails & Programme de la formation */}
              <div className={`space-y-6 lg:col-span-7 ${isReverse ? "lg:order-2" : "lg:order-1"}`}>
                
                {/* Badge & Outil */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm ${getBadgeClasses(f.badge)}`}>
                    {f.badge || "Formation Complète"}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    <Clock className="size-3.5 text-primary" />
                    <span>{f.duration}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    <BookOpen className="size-3.5 text-cyan-400" />
                    <span>{f.modules_count}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                    <Zap className="size-3.5 text-amber-400" />
                    <span>{f.prompts_count}</span>
                  </span>
                </div>

                {/* Titre & Tagline */}
                <div className="space-y-2">
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {f.title}
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    {f.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {f.description}
                </p>

                {/* Points forts du programme */}
                <div className="space-y-2.5 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Au programme de cette masterclass :
                  </h3>
                  <div className="grid gap-2.5">
                    {f.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="size-4 sm:size-5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloc Prix & Bouton d'Achat */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tarif d'accès complet à vie
                    </span>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="font-heading text-2xl sm:text-3xl font-black text-white">
                        {formatPriceNum(f.price)}
                      </span>
                      {f.original_price && (
                        <span className="text-xs sm:text-sm text-slate-500 line-through font-semibold">
                          {f.original_price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEnrolled ? (
                      <Link
                        href="/dashboard"
                        className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                      >
                        <Play className="size-4" />
                        <span>Accéder à ma Formation</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(f)}
                        className="px-6 py-3.5 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <ShoppingBag className="size-4" />
                        <span>Débloquer la formation</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Colonne 2 : Miniature 16/9, Stats clés & Avis Client */}
              <div className={`space-y-6 lg:col-span-5 ${isReverse ? "lg:order-1" : "lg:order-2"}`}>
                
                {/* 1. Miniature / Poster 16/9 Haute Définition */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
                  <img
                    src={f.thumbnail || "/images/formation_claude_thumb.jpg"}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  
                  {/* Badge & Statut Incrusté */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${getBadgeClasses(f.badge)}`}>
                      {f.badge || "Formation IA"}
                    </span>
                  </div>

                  {/* Formateur & Note Incrustés en bas */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-slate-200 font-bold">
                      {f.instructor || "Alfred Dah · Expert IA"}
                    </div>
                    <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-amber-400 font-black flex items-center gap-1 shadow-md">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>

                {/* 2. Statistiques Rapides */}
                <div className="grid grid-cols-3 gap-3">
                  {f.stats.map((st, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-0.5">
                      <div className="font-heading text-xl font-black text-white">{st.value}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{st.label}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Témoignage Vérifié */}
                {f.testimonial && (
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/20 text-primary border border-primary/30 font-black text-xs flex items-center justify-center">
                          {f.testimonial.avatar_initials || "EL"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{f.testimonial.author_name}</div>
                          <div className="text-[10px] text-slate-400">{f.testimonial.author_role || "Apprenant Vérifié"}</div>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{f.testimonial.quote}"
                    </p>
                  </div>
                )}

              </div>

            </motion.div>
          )
        }))}

      </section>

      {/* 5. Bannière Garantie & Réassurance */}
      <section className="py-12 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <InfinityIcon className="size-6" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-heading text-sm font-bold text-white">Accès à vie 24h/24</h4>
              <p className="text-xs text-slate-400">Consultez vos leçons et vos prompts à votre rythme, sans limite de temps.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-heading text-sm font-bold text-white">Paiements 100% Sécurisés</h4>
              <p className="text-xs text-slate-400">Wave, Orange Money, MTN MoMo, Carte Bancaire et Stripe.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <MessageSquare className="size-6" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-heading text-sm font-bold text-white">Support & Mises à Jour</h4>
              <p className="text-xs text-slate-400">Mises à jour incluses lors des sorties des nouvelles versions d'IA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Checkout Modal Complet (Stripe + Mobile Money avec Numéro & Référence) */}
      <AnimatePresence>
        {checkoutModalOpen && selectedFormation && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setCheckoutModalOpen(false)
                  setPaymentSuccess(false)
                  setErrorMessage("")
                }}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>

              {paymentSuccess ? (
                <div className="text-center space-y-4 py-3">
                  <div className="size-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                    <Clock className="size-8 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Validation sous moins de 24h
                    </span>
                    <h3 className="font-heading text-xl font-black text-white pt-1">
                      Demande d'Accès Enregistrée !
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    Votre déclaration de paiement Mobile Money pour la formation <strong>{selectedFormation.title}</strong> a bien été transmise à notre équipe administrative.
                  </p>

                  {/* Récapitulatif de la transaction */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Formation :</span>
                      <strong className="text-white">{selectedFormation.title}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Montant à vérifier :</span>
                      <strong className="text-white">{formatPriceNum(selectedFormation.price)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Référence de transaction :</span>
                      <strong className="text-primary font-mono">{transactionRef || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>Délai d'activation :</span>
                      <strong className="text-amber-400 font-bold">Moins de 24h ouvrées</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
                    <p className="text-[11px] text-slate-300">
                      📧 Un email de confirmation a été envoyé à votre adresse. Dès vérification du dépôt, votre formation sera automatiquement débloquée dans votre Espace Membre.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <a
                      href={`https://wa.me/22605050577?text=${encodeURIComponent(`Bonjour Alfred, je viens d'effectuer le virement Mobile Money pour la formation "${selectedFormation.title}" (${formatPriceNum(selectedFormation.price)}) avec la référence : ${transactionRef}. Pouvez-vous valider mon accès ? Merci !`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/20 cursor-pointer"
                    >
                      <MessageSquare className="size-4" />
                      <span>Accélérer ma validation sur WhatsApp</span>
                    </a>

                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                    >
                      <Play className="size-3.5" />
                      <span>Voir mon Espace Membre</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmPurchase} className="space-y-4 text-left">
                  
                  {/* En-tête de la commande */}
                  <div className="space-y-1 pr-6">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                      Déblocage Immédiat
                    </span>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-white pt-1">
                      {selectedFormation.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Paiement unique pour un accès à vie et support continu.
                    </p>
                  </div>

                  {/* Récapitulatif Tarif */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Montant à régler :</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-xl font-black text-white">
                        {formatPriceNum(selectedFormation.price)}
                      </span>
                      {selectedFormation.original_price && (
                        <span className="text-xs text-slate-500 line-through">
                          {selectedFormation.original_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Choix du Moyen de Paiement */}
                  <div className="space-y-2 text-xs">
                    <label className="font-bold text-slate-300 block">Choisissez votre moyen de paiement :</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      
                      {/* Wave */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("wave")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === "wave"
                            ? "bg-primary/10 border-primary text-white shadow-md ring-1 ring-primary"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs text-white">Wave</span>
                          {paymentMethod === "wave" && <CheckCircle2 className="size-4 text-primary" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Mobile Money</span>
                      </button>

                      {/* Orange Money */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("orange_money")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === "orange_money"
                            ? "bg-primary/10 border-primary text-white shadow-md ring-1 ring-primary"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs text-white">Orange Money</span>
                          {paymentMethod === "orange_money" && <CheckCircle2 className="size-4 text-primary" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Mobile Money</span>
                      </button>

                      {/* MTN MoMo */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("mtn_momo")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === "mtn_momo"
                            ? "bg-primary/10 border-primary text-white shadow-md ring-1 ring-primary"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs text-white">MTN MoMo</span>
                          {paymentMethod === "mtn_momo" && <CheckCircle2 className="size-4 text-primary" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Mobile Money</span>
                      </button>

                      {/* Carte Bancaire / Stripe */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("stripe")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === "stripe"
                            ? "bg-primary/10 border-primary text-white shadow-md ring-1 ring-primary"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs text-white">Carte Bancaire</span>
                          {paymentMethod === "stripe" && <CheckCircle2 className="size-4 text-primary" />}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Stripe / Visa / Master</span>
                      </button>

                    </div>
                  </div>

                  {/* 1. PANNEAU D'INSTRUCTIONS MOBILE MONEY (WAVE / OM / MTN) */}
                  {paymentMethod !== "stripe" && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="size-4 text-primary" />
                          <span>Instructions de transfert ({paymentMethod === "wave" ? "Wave" : paymentMethod === "orange_money" ? "Orange Money" : "MTN MoMo"}) :</span>
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Effectuez le transfert de <strong className="text-white font-extrabold">{formatPriceNum(selectedFormation.price)}</strong> sur le numéro officiel ci-dessous :
                        </p>
                      </div>

                      {/* Encadré Numéro Officiel */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Numéro de paiement officiel :</span>
                          <div className="font-mono text-base sm:text-lg text-primary font-black tracking-wider">
                            +226 75 75 72 73
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium">
                            Nom du compte : <strong className="text-white">Sanson Alfred Tanguy Dah</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard("+22675757273")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-slate-950 font-bold text-xs transition-all cursor-pointer border border-primary/20"
                          title="Copier le numéro"
                        >
                          {copiedNum === "+22675757273" ? (
                            <>
                              <Check className="size-3.5" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Champ Référence de transaction */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-bold text-slate-200 block">
                          ID de Transaction / N° de téléphone expéditeur *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="Ex: REF-WAVE-8921 ou votre N° de téléphone"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. PANNEAU STRIPE / CARTE BANCAIRE */}
                  {paymentMethod === "stripe" && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <CreditCard className="size-4 text-primary" />
                        <span>Paiement sécurisé par Carte Bancaire (Stripe)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Vous allez être redirigé vers la passerelle sécurisée <strong>Stripe</strong> pour régler par carte bancaire internationale (Visa, Mastercard, Apple Pay, Google Pay).
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-300 flex-wrap pt-1">
                        <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">💳 Visa</span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">💳 Mastercard</span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">🔒 Chiffrement SSL 256-bit</span>
                      </div>
                    </div>
                  )}

                  {/* Coordonnées Client si non connecté */}
                  {!user && (
                    <div className="space-y-3 pt-1 border-t border-slate-800">
                      <span className="text-xs font-bold text-slate-300 block">Vos coordonnées pour l'accès :</span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          required
                          placeholder="Votre Nom & Prénom *"
                          value={buyerForm.fullName}
                          onChange={e => setBuyerForm({ ...buyerForm, fullName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Votre Adresse Email *"
                          value={buyerForm.email}
                          onChange={e => setBuyerForm({ ...buyerForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Message d'erreur éventuel */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Bouton de Soumission */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="w-full py-3.5 rounded-xl bg-primary text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {processingPayment ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Traitement en cours...</span>
                        </>
                      ) : paymentMethod === "stripe" ? (
                        <>
                          <CreditCard className="size-4" />
                          <span>Payer avec Stripe ({formatPriceNum(selectedFormation.price)})</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>Valider mon paiement ({formatPriceNum(selectedFormation.price)})</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Footer & Éléments Flottants */}
      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />

    </main>
  )
}

export default function FormationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-primary font-bold text-sm">
        Chargement des formations...
      </div>
    }>
      <FormationsContent />
    </Suspense>
  )
}
