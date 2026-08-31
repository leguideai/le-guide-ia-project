"use client"

import { Suspense, useState, useEffect, use, useRef, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase"
import { useUserEnrollments } from "@/lib/user-enrollments"
import { 
  countries, getCountryFlag, Country, 
  PHONE_RULES, formatPhoneNumber, parsePhoneNumber 
} from "@/lib/countries"
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Lock, CreditCard, Smartphone, 
  CheckCircle2, AlertCircle, GraduationCap, UserCheck, Copy, Check, 
  Upload, Image as ImageIcon, X, ChevronDown, Search, Sparkles, Clock, Tag
} from "lucide-react"

interface PageProps {
  params: Promise<{ courseSlug: string }>
}

// Mettre à true pour réactiver PayTech quand vous aurez les documents NINEA / RC
const ENABLE_PAYTECH = false

function getOfferEndTimestamp(rawDate?: string | null): number | null {
  if (!rawDate || String(rawDate).trim() === "") return null
  const clean = String(rawDate).trim()
  
  // Format YYYY-MM-DD -> Inclut toute la journée jusqu'à 23:59:59.999
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  if (clean.includes("T00:00:00")) {
    const datePart = clean.split("T")[0]
    const [y, m, d] = datePart.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }

  const parsed = new Date(clean).getTime()
  return isNaN(parsed) ? null : parsed
}

function CheckoutContent({ params }: PageProps) {
  const { courseSlug } = use(params)
  const searchParams = useSearchParams()
  const requestedTier = searchParams.get("tier")
  const { isEnrolledInCourse } = useUserEnrollments()

  const [courseData, setCourseData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<"mobile_direct" | "stripe" | "paytech">("mobile_direct")
  const [mobileOperator, setMobileOperator] = useState<"wave" | "orange_money" | "moov" | "mtn">("wave")
  const [transactionRef, setTransactionRef] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("Côte d'Ivoire")
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  // WhatsApp states & country selector
  const [selectedWhatsappCountry, setSelectedWhatsappCountry] = useState<Country>(() => {
    return countries.find((c) => c.name === "Côte d'Ivoire") || countries[0]
  })
  const [whatsappLocalNumber, setWhatsappLocalNumber] = useState("")
  const [isWhatsappDropdownOpen, setIsWhatsappDropdownOpen] = useState(false)
  const [whatsappCountrySearch, setWhatsappCountrySearch] = useState("")
  const whatsappDropdownRef = useRef<HTMLDivElement>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedNum, setCopiedNum] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Selected country object resolution for residence
  const selectedCountryObj = useMemo(() => {
    return (
      countries.find(
        (c) => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase()
      ) ||
      countries.find((c) => c.name === "Côte d'Ivoire") ||
      countries[0]
    )
  }, [country])

  // Filtered countries list for residence searchable dropdown
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries
    const q = countrySearch.toLowerCase().trim()
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    )
  }, [countrySearch])

  // Filtered countries list for WhatsApp searchable dropdown
  const filteredWhatsappCountries = useMemo(() => {
    if (!whatsappCountrySearch.trim()) return countries
    const q = whatsappCountrySearch.toLowerCase().trim()
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    )
  }, [whatsappCountrySearch])

  // WhatsApp phone rules & validation
  const currentWhatsappRule = PHONE_RULES[selectedWhatsappCountry.code]
  const rawWhatsappDigits = useMemo(() => whatsappLocalNumber.replace(/\D/g, ""), [whatsappLocalNumber])
  const isWhatsappValid = useMemo(() => {
    if (!rawWhatsappDigits) return false
    if (!currentWhatsappRule) return rawWhatsappDigits.length >= 6 && rawWhatsappDigits.length <= 15
    if (Array.isArray(currentWhatsappRule.expectedLength)) {
      return currentWhatsappRule.expectedLength.includes(rawWhatsappDigits.length)
    }
    return rawWhatsappDigits.length === currentWhatsappRule.expectedLength
  }, [rawWhatsappDigits, currentWhatsappRule])

  const fullWhatsapp = useMemo(() => {
    if (!rawWhatsappDigits) return ""
    return `${selectedWhatsappCountry.dial}${rawWhatsappDigits}`
  }, [selectedWhatsappCountry, rawWhatsappDigits])

  const handleWhatsappChange = (val: string) => {
    if (val.startsWith("+")) {
      const parsed = parsePhoneNumber(val)
      if (parsed) {
        setSelectedWhatsappCountry(parsed.country)
        setWhatsappLocalNumber(parsed.localNumber)
        return
      }
    }
    const formatted = formatPhoneNumber(val, selectedWhatsappCountry.code)
    setWhatsappLocalNumber(formatted)
  }

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false)
      }
      if (whatsappDropdownRef.current && !whatsappDropdownRef.current.contains(e.target as Node)) {
        setIsWhatsappDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 10 Mo.")
        return
      }
      setReceiptFile(file)
      const previewUrl = URL.createObjectURL(file)
      setReceiptPreview(previewUrl)
      setError(null)
    }
  }

  const handleRemoveReceipt = () => {
    setReceiptFile(null)
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
      setReceiptPreview(null)
    }
  }

  // Fetch course from Supabase with fallback to API
  useEffect(() => {
    async function fetchCourse() {
      try {
        let found: any = null
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .or(`slug.eq.${courseSlug},id.eq.${courseSlug}`)
          .maybeSingle()

        if (data) {
          found = data
        } else {
          const res = await fetch("/api/admin/courses")
          const apiData = await res.json()
          if (apiData?.courses && apiData.courses.length > 0) {
            found = apiData.courses.find((c: any) => 
              c.slug === courseSlug || 
              c.id === courseSlug ||
              (courseSlug.includes("business") && c.slug?.includes("business")) ||
              (!courseSlug.includes("business") && !c.slug?.includes("business"))
            )
          }
        }

        if (found) {
          setCourseData(found)
        }
      } catch (err) {
        console.warn("Could not fetch course in checkout:", err)
      }
    }
    fetchCourse()
  }, [courseSlug])

  // Helper to extract clean numeric value from DB field (e.g. 99000, "99 000 FCFA", "149000", etc.)
  function parseDbPrice(val: any): number | null {
    if (val === undefined || val === null || val === "") return null
    if (typeof val === "number" && !isNaN(val)) return val
    const cleaned = String(val).replace(/[^0-9.]/g, "")
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }

  // 100% Dynamic Price Calculations directly from Database (NO hardcoded numbers or static fallbacks)
  const offerPriceFromDb = parseDbPrice(courseData?.price)
  const standardPriceFromDb = parseDbPrice(courseData?.original_price)

  const rawOfferPrice = offerPriceFromDb !== null ? offerPriceFromDb : (standardPriceFromDb !== null ? standardPriceFromDb : 0)
  const rawStandardPrice = standardPriceFromDb !== null ? standardPriceFromDb : rawOfferPrice

  // Check if special offer has expired based on database offer_end_date
  const targetTimestamp = getOfferEndTimestamp(courseData?.offer_end_date)
  const hasOfferEndDate = targetTimestamp !== null
  const isOfferExpired = hasOfferEndDate && new Date().getTime() > targetTimestamp

  // Active Tier: if offer expired, standard price is applied
  const isStandardTier = requestedTier === "standard" || isOfferExpired

  const isBusiness = courseSlug?.includes("business") || 
    courseData?.slug?.includes("business") || 
    courseData?.title?.toLowerCase().includes("business")

  const courseTitle = courseData?.title || (courseSlug ? courseSlug.replace(/-/g, " ") : "Bootcamp IA")
  const isEnrolled = isEnrolledInCourse(courseData || { id: courseSlug, slug: courseSlug, title: courseTitle })

  // Final dynamic price to charge
  const price = isStandardTier ? rawStandardPrice : rawOfferPrice
  const discountAmount = Math.max(0, rawStandardPrice - price)
  const discountPercent = (rawStandardPrice > 0 && discountAmount > 0) ? Math.round((discountAmount / rawStandardPrice) * 100) : 0

  const currency = courseData?.currency || "FCFA"
  const coursePriceFcfa = `${price.toLocaleString("fr-FR")} ${currency}`
  const eurVal = price > 0 ? (price >= 655 ? `${Math.round(price / 655.957)} €` : `${Math.max(0.01, price / 655.957).toFixed(2)} €`) : "0 €"
  const usdVal = price > 0 ? (price >= 655 ? `$${Math.round((price / 655.957) * 1.08)}` : `$${Math.max(0.01, (price / 655.957) * 1.08).toFixed(2)}`) : "$0"
  const coursePriceUsd = `≈ ${eurVal} / ${usdVal}`
  const courseSchedule = courseData?.dates || ""
  const formattedOfferEndDate = courseData?.offer_end_date 
    ? new Date(courseData.offer_end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setIsLoggedIn(true)
          const userEmail = data.user.email || ""
          if (userEmail) setEmail(userEmail)

          let name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || ""
          let phone = data.user.user_metadata?.whatsapp || data.user.user_metadata?.phone || ""
          let userCountry = data.user.user_metadata?.country || ""

          // Enrich with profiles table data
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, whatsapp, phone, country")
              .or(`id.eq.${data.user.id},email.eq.${userEmail.toLowerCase()}`)
              .maybeSingle()

            if (profile) {
              if (profile.full_name && !name) name = profile.full_name
              if (profile.whatsapp && !phone) phone = profile.whatsapp
              if (profile.phone && !phone) phone = profile.phone
              if (profile.country && !userCountry) userCountry = profile.country
            }

            // Also check latest registration for contact phone / country
            if (userEmail && (!phone || !name)) {
              const { data: reg } = await supabase
                .from("registrations")
                .select("full_name, whatsapp, country")
                .eq("email", userEmail.toLowerCase())
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()

              if (reg) {
                if (reg.full_name && !name) name = reg.full_name
                if (reg.whatsapp && !phone) phone = reg.whatsapp
                if (reg.country && !userCountry) userCountry = reg.country
              }
            }
          } catch (pErr) {
            console.warn("Could not query profile in checkout:", pErr)
          }

          if (name) {
            setFullName(name)
            try { localStorage.setItem("user_name", name) } catch(e){}
          }
          if (phone) {
            const parsed = parsePhoneNumber(phone)
            if (parsed) {
              setSelectedWhatsappCountry(parsed.country)
              setWhatsappLocalNumber(parsed.localNumber)
            } else {
              setWhatsappLocalNumber(phone.replace(/^\+\d+\s*/, ""))
            }
            try { localStorage.setItem("user_whatsapp", phone) } catch(e){}
          }
          if (userCountry) {
            setCountry(userCountry)
            const matched = countries.find(c => c.name.toLowerCase() === userCountry.toLowerCase() || c.code.toLowerCase() === userCountry.toLowerCase())
            if (matched && !phone) {
              setSelectedWhatsappCountry(matched)
            }
            try { localStorage.setItem("user_country", userCountry) } catch(e){}
          }
          if (userEmail) {
            try { localStorage.setItem("user_email", userEmail) } catch(e){}
          }
        } else {
          const savedEmail = localStorage.getItem("user_email")
          const savedName = localStorage.getItem("user_name")
          const savedPhone = localStorage.getItem("user_whatsapp") || localStorage.getItem("user_phone")
          const savedCountry = localStorage.getItem("user_country")
          if (savedEmail) {
            setEmail(savedEmail)
            setIsLoggedIn(true)
          }
          if (savedName) setFullName(savedName)
          if (savedPhone) {
            const parsed = parsePhoneNumber(savedPhone)
            if (parsed) {
              setSelectedWhatsappCountry(parsed.country)
              setWhatsappLocalNumber(parsed.localNumber)
            } else {
              setWhatsappLocalNumber(savedPhone)
            }
          }
          if (savedCountry) {
            setCountry(savedCountry)
            const matched = countries.find(c => c.name.toLowerCase() === savedCountry.toLowerCase() || c.code.toLowerCase() === savedCountry.toLowerCase())
            if (matched && !savedPhone) {
              setSelectedWhatsappCountry(matched)
            }
          }
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

    if (!rawWhatsappDigits) {
      setError("Veuillez renseigner votre numéro WhatsApp.")
      setLoading(false)
      return
    }

    if (!isWhatsappValid) {
      setError(`Veuillez renseigner un numéro WhatsApp valide pour ${selectedWhatsappCountry.name} (${currentWhatsappRule ? currentWhatsappRule.formatExample : "longueur incorrecte"}).`)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseSlug, 
          courseTitle, 
          price, 
          email, 
          fullName, 
          whatsapp: fullWhatsapp, 
          country 
        }),
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

    if (!rawWhatsappDigits) {
      setError("Veuillez renseigner votre numéro WhatsApp.")
      setLoading(false)
      return
    }

    if (!isWhatsappValid) {
      setError(`Veuillez renseigner un numéro WhatsApp valide pour ${selectedWhatsappCountry.name} (${currentWhatsappRule ? currentWhatsappRule.formatExample : "longueur incorrecte"}).`)
      setLoading(false)
      return
    }

    if (!transactionRef.trim() && !receiptFile) {
      setError("Veuillez saisir la référence de transaction OU ajouter une capture d'écran de votre reçu de paiement.")
      setLoading(false)
      return
    }

    try {
      let uploadedReceiptUrl: string | undefined = undefined

      // 1. Upload receipt screenshot if provided
      if (receiptFile) {
        const formData = new FormData()
        formData.append("file", receiptFile)
        formData.append("folder", "receipts")
        formData.append("bucket", "courses-pdf")

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          uploadedReceiptUrl = uploadData.url
        }
      }

      // 2. Submit payment declaration
      const res = await fetch("/api/payment/direct-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseSlug, 
          courseTitle, 
          courseId: courseData?.id,
          price, 
          email, 
          fullName, 
          whatsapp: fullWhatsapp, 
          country, 
          transactionRef, 
          mobileOperator,
          receiptUrl: uploadedReceiptUrl
        }),
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

    if (!rawWhatsappDigits) {
      setError("Veuillez renseigner votre numéro WhatsApp.")
      setLoading(false)
      return
    }

    if (!isWhatsappValid) {
      setError(`Veuillez renseigner un numéro WhatsApp valide pour ${selectedWhatsappCountry.name} (${currentWhatsappRule ? currentWhatsappRule.formatExample : "longueur incorrecte"}).`)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/payment/paytech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseSlug, 
          courseTitle, 
          price, 
          email, 
          fullName, 
          whatsapp: fullWhatsapp, 
          country 
        }),
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
      <Header />
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

            {isEnrolled && (
              <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/15 p-5 space-y-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">Vous êtes déjà inscrit(e) à ce Bootcamp !</h3>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Votre compte possède déjà l'accès actif à cette cohorte. Vous n'avez pas besoin de renouveler votre paiement.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <span>Accéder directement à mon Espace Membre</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}

            {isLoggedIn && !isEnrolled && (
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
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                {/* WhatsApp avec Drapeau, Indicatif et Validation par Règles Pays */}
                <div className="space-y-1.5" ref={whatsappDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground/80">WhatsApp *</label>
                    <span className="text-[10px] text-muted-foreground">
                      {currentWhatsappRule ? currentWhatsappRule.formatExample : "Indicatif + Numéro"}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    {/* Bouton Drapeau & Indicatif */}
                    <button
                      type="button"
                      onClick={() => setIsWhatsappDropdownOpen(!isWhatsappDropdownOpen)}
                      className="h-10.5 sm:h-10 shrink-0 flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-border bg-secondary/60 hover:bg-secondary text-foreground transition-all cursor-pointer select-none"
                      title="Changer l'indicatif pays de votre WhatsApp"
                    >
                      <span className="text-lg leading-none">{getCountryFlag(selectedWhatsappCountry.code)}</span>
                      <span className="font-mono text-xs font-bold text-foreground">{selectedWhatsappCountry.dial}</span>
                      <ChevronDown className={`size-3 text-muted-foreground transition-transform duration-200 ${isWhatsappDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Champ de saisie du numéro local */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={whatsappLocalNumber}
                        onChange={(e) => handleWhatsappChange(e.target.value)}
                        placeholder={currentWhatsappRule?.placeholder || "07 12 34 56 78"}
                        className={`w-full h-10.5 sm:h-10 rounded-r-xl border bg-card px-3.5 py-2 text-sm sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                          rawWhatsappDigits.length > 0 && isWhatsappValid
                            ? "border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : rawWhatsappDigits.length > 0 && !isWhatsappValid
                            ? "border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            : "border-border focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        }`}
                      />
                      {rawWhatsappDigits.length > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {isWhatsappValid ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="size-4 text-amber-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Popover Sélecteur d'Indicatif WhatsApp */}
                    {isWhatsappDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-72 max-w-[90vw] max-h-64 bg-card border border-border/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-2.5 border-b border-border/80 sticky top-0 bg-card z-10">
                          <div className="relative">
                            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={whatsappCountrySearch}
                              onChange={(e) => setWhatsappCountrySearch(e.target.value)}
                              placeholder="Rechercher pays ou indicatif..."
                              className="w-full bg-secondary/50 border border-border/80 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                              autoFocus
                            />
                            {whatsappCountrySearch && (
                              <button
                                type="button"
                                onClick={() => setWhatsappCountrySearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="overflow-y-auto divide-y divide-border/40 text-left max-h-52">
                          {filteredWhatsappCountries.map((c) => {
                            const isSelected = selectedWhatsappCountry.code === c.code
                            return (
                              <button
                                key={`wa-c-${c.code}-${c.dial}`}
                                type="button"
                                onClick={() => {
                                  setSelectedWhatsappCountry(c)
                                  setIsWhatsappDropdownOpen(false)
                                  setWhatsappCountrySearch("")
                                  if (whatsappLocalNumber) {
                                    setWhatsappLocalNumber(formatPhoneNumber(whatsappLocalNumber, c.code))
                                  }
                                }}
                                className={`w-full px-3.5 py-2 text-xs flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer text-left ${
                                  isSelected ? "bg-primary/15 text-primary font-bold" : "text-foreground"
                                }`}
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <span className="text-base leading-none">{getCountryFlag(c.code)}</span>
                                  <span className="truncate">{c.name}</span>
                                </span>
                                <span className="font-mono text-[11px] font-bold text-muted-foreground ml-2 shrink-0">
                                  {c.dial}
                                </span>
                              </button>
                            )
                          })}
                          {filteredWhatsappCountries.length === 0 && (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                              Aucun pays trouvé
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback en direct sur le format du numéro */}
                  <div className="flex items-center justify-between text-[10px] pt-0.5">
                    {rawWhatsappDigits.length > 0 ? (
                      isWhatsappValid ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="size-3" /> Numéro valide pour {selectedWhatsappCountry.name}
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <AlertCircle className="size-3" /> {currentWhatsappRule ? `Format : ${currentWhatsappRule.formatExample} (${rawWhatsappDigits.length}/${Array.isArray(currentWhatsappRule.expectedLength) ? currentWhatsappRule.expectedLength.join(' ou ') : currentWhatsappRule.expectedLength})` : "Format incomplet"}
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Exemple : {selectedWhatsappCountry.dial} {currentWhatsappRule?.placeholder || "07 12 34 56 78"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pays de résidence (Sélecteur avec Drapeaux & Recherche de tous les pays) */}
              <div className="space-y-1.5" ref={countryDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground/80">Pays de résidence *</label>
                  <span className="text-[10px] text-muted-foreground">Sélectionnez avec drapeau</span>
                </div>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm sm:text-xs text-foreground hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="text-lg leading-none">{getCountryFlag(selectedCountryObj.code)}</span>
                      <span className="font-bold text-foreground truncate">{selectedCountryObj.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">({selectedCountryObj.dial})</span>
                    </span>
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${isCountryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Popover Liste des Pays */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full max-h-64 bg-card border border-border/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2.5 border-b border-border/80 sticky top-0 bg-card z-10">
                        <div className="relative">
                          <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Rechercher un pays ou un code..."
                            className="w-full bg-secondary/50 border border-border/80 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                            autoFocus
                          />
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={() => setCountrySearch("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto divide-y divide-border/40 text-left max-h-52">
                        {filteredCountries.map((c) => {
                          const isSelected = country.toLowerCase() === c.name.toLowerCase() || country.toLowerCase() === c.code.toLowerCase()
                          return (
                            <button
                              key={`country-${c.code}`}
                              type="button"
                              onClick={() => {
                                setCountry(c.name)
                                setIsCountryDropdownOpen(false)
                                setCountrySearch("")
                                setSelectedWhatsappCountry(c)
                                if (whatsappLocalNumber) {
                                  setWhatsappLocalNumber(formatPhoneNumber(whatsappLocalNumber, c.code))
                                }
                              }}
                              className={`w-full px-3.5 py-2 text-xs flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-primary/15 text-primary font-bold" : "text-foreground"
                              }`}
                            >
                              <span className="flex items-center gap-2.5 truncate">
                                <span className="text-base leading-none">{getCountryFlag(c.code)}</span>
                                <span className="truncate">{c.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">({c.dial})</span>
                              </span>
                              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                        {filteredCountries.length === 0 && (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            Aucun pays trouvé pour &quot;{countrySearch}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Smartphone className="size-4" />
                      <span>Instructions de dépôt Mobile Money</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Effectuez le transfert de <strong className="text-foreground font-extrabold">{coursePriceFcfa}</strong> sur le numéro officiel unique ci-dessous (Wave, Orange Money, Moov, MTN) :
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-primary/30 shadow-md">
                    <div>
                      <div className="font-mono text-base text-primary font-extrabold tracking-wider mt-0.5">+226 75 75 72 73</div>
                      <div className="text-[11px] text-muted-foreground font-medium">Nom du destinataire : Sanson Alfred Dah</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("+22675757273")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-xs transition-all cursor-pointer border border-primary/30"
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

                  {/* Field 1: Transaction Ref */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground/90">
                        ID de Transaction / N° du dépôt
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {receiptFile ? "(Optionnel si capture fournie)" : "* Requis"}
                      </span>
                    </div>
                    <input
                      type="text"
                      required={!receiptFile}
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: REF-WAVE-8921 ou N° de téléphone expéditeur"
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Field 2: Screenshot / Receipt Upload */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                        <ImageIcon className="size-3.5 text-primary" />
                        <span>Capture d'écran du paiement</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Recommandé
                      </span>
                    </div>

                    {!receiptPreview ? (
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-card/40 hover:bg-primary/5 cursor-pointer transition-all group">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2">
                          <Upload className="size-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          Cliquez pour ajouter la capture du reçu
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          PNG, JPG, JPEG ou WEBP (Max 10 Mo)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-2xl border border-primary/40 bg-card p-3 flex items-center gap-3 shadow-md">
                        <div className="size-16 rounded-xl overflow-hidden bg-slate-900 border border-primary/30 shrink-0">
                          <img
                            src={receiptPreview}
                            alt="Aperçu reçu"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="size-3.5" />
                            <span>Capture prête à être envoyée</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                            {receiptFile?.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {receiptFile ? `${(receiptFile.size / 1024).toFixed(0)} Ko` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveReceipt}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer cette capture"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
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
                      ? "Valider mon paiement & Finaliser l'inscription"
                      : "Payer en ligne & Accéder immédiatement"
                  }
                </span>
                <ArrowRight className="size-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground text-center pt-2">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Cryptage SSL 256-bit — Accès et confirmation immédiats</span>
              </div>
            </form>
          </div>

          {/* Summary Card (5 Cols) */}
          <div className="md:col-span-5 rounded-3xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur-xl space-y-5 text-left">
            <div className="space-y-3 pb-4 border-b border-border">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {isBusiness ? (
                    <UserCheck className="size-5 text-[#D4AF37]" />
                  ) : (
                    <GraduationCap className="size-5 text-primary" />
                  )}
                  <h3 className="font-heading text-lg font-bold text-foreground">{courseTitle}</h3>
                </div>

                {!isStandardTier ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="size-3" />
                    {courseData?.offer_badge_text || (isBusiness ? "Offre Exclusive" : "Offre Spéciale Fondateur")}
                  </span>
                ) : isOfferExpired ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    <Clock className="size-3" />
                    Tarif Standard (Offre terminée)
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                15h de formation intensive en direct avec Alfred Dah · 100% En ligne + Replays HD à vie.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Formule</span>
                <span className="font-bold text-foreground">{courseTitle}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Créneaux Live</span>
                <span className="font-semibold text-foreground text-right max-w-[65%]">{courseSchedule}</span>
              </div>

              {/* Ligne Tarif Standard */}
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tarif Standard</span>
                <span className={`font-mono ${!isStandardTier ? "line-through text-muted-foreground/70" : "font-bold text-foreground"}`}>
                  {rawStandardPrice.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              {/* Notification contextuelle sur l'offre */}
              {!isStandardTier && formattedOfferEndDate && (
                <p className="text-[11px] text-amber-300/90 pt-1 leading-relaxed">
                  ✨ <strong>Offre garantie :</strong> Tarif promotionnel appliqué jusqu'au {formattedOfferEndDate}.
                </p>
              )}

              {isOfferExpired && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                  ⏱️ <em>La période de promotion s'étant achevée, le tarif régulier officiel ({rawStandardPrice.toLocaleString("fr-FR")} FCFA) est appliqué.</em>
                </div>
              )}

              {/* Total à régler */}
              <div className="flex justify-between py-2 border-t border-border/80 pt-3.5 items-baseline">
                <div>
                  <span className="font-bold text-foreground block text-sm">Total à régler</span>
                  <span className="text-[10px] text-muted-foreground">TVA et accès complets inclus</span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${isBusiness ? "text-[#ECC86B]" : "text-primary"}`}>
                    {coursePriceFcfa}
                  </div>
                  <div className="text-[10px] text-muted-foreground">≈ {coursePriceUsd}</div>
                </div>
              </div>
            </div>

            {/* Inclusions garanties */}
            <div className="pt-2 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Accès direct aux 6 sessions + Replays HD illimités</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Templates, prompts professionnels &amp; support direct</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <span>Certificat Officiel nominatif LE GUIDE IA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </main>
)
}

export default function CheckoutPage(props: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-primary font-bold text-sm">
        Chargement de la commande...
      </div>
    }>
      <CheckoutContent {...props} />
    </Suspense>
  )
}
