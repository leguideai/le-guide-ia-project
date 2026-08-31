"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, Menu, X, ChevronDown, Sparkles, BookOpen, GraduationCap, Building2, User, LogOut } from "lucide-react"

function getOfferEndTimestamp(rawDate?: string | null): number | null {
  if (!rawDate || String(rawDate).trim() === "") return null
  const clean = String(rawDate).trim()
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

export function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check initial user session
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }
    checkUser()

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      localStorage.clear()
      window.location.href = "/login"
    }
  }

  const [announcementText, setAnnouncementText] = useState("")
  const [courseTitle, setCourseTitle] = useState("Bootcamp IA")
  const [courseDatesText, setCourseDatesText] = useState("")
  const [isPromoActiveState, setIsPromoActiveState] = useState(false)
  const [discountPercentState, setDiscountPercentState] = useState<number | null>(null)
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState("")
  const [promoPriceDisplay, setPromoPriceDisplay] = useState("")
  const [announcementMobileText, setAnnouncementMobileText] = useState("")
  const [announcementMobilePrice, setAnnouncementMobilePrice] = useState("")
  const [announcementCta, setAnnouncementCta] = useState("")
  const [announcementHref, setAnnouncementHref] = useState("/checkout/bootcamp-ia-pro")

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        const rawCustomText = data?.settings?.announcement_text || ""
        const rawCustomCta = data?.settings?.announcement_cta || ""

        // Fetch all active courses to find the closest upcoming bootcamp
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title, slug, price, original_price, offer_end_date, dates, status, sequence_order, start_date")
          .order("sequence_order", { ascending: true })

        const activeCourses = (courses || []).filter(c => c.status !== "archived" && c.status !== "draft")
        const now = Date.now()

        // Prioritize the closest upcoming bootcamp with active promotion or upcoming cohort
        activeCourses.sort((a, b) => {
          const targetA = getOfferEndTimestamp(a.offer_end_date)
          const targetB = getOfferEndTimestamp(b.offer_end_date)
          const isPromoA = targetA ? targetA > now : false
          const isPromoB = targetB ? targetB > now : false
          if (isPromoA && !isPromoB) return -1
          if (!isPromoA && isPromoB) return 1
          return (a.sequence_order ?? 0) - (b.sequence_order ?? 0)
        })

        const course = activeCourses[0] || courses?.[0]

        if (course) {
          setCourseTitle(course.title || "Bootcamp IA")

          const targetTime = getOfferEndTimestamp(course.offer_end_date)
          const isPromoActive = targetTime ? targetTime > now : false
          const isExpired = targetTime ? targetTime <= now : false

          const origPrice = Number(course.original_price) || 0
          const promoPrice = Number(course.price) || 0
          const hasDiscount = origPrice > 0 && promoPrice > 0 && promoPrice < origPrice

          // Exact price according to promo status & date
          const currentPrice = isPromoActive 
            ? (course.price || course.original_price) 
            : (course.original_price || course.price)
          const formattedPrice = currentPrice > 0 
            ? `${Number(currentPrice).toLocaleString("fr-FR")} FCFA` 
            : "99 000 FCFA"

          if (isPromoActive && hasDiscount) {
            setIsPromoActiveState(true)
            const pct = Math.round(((origPrice - promoPrice) / origPrice) * 100)
            setDiscountPercentState(pct)
            setOriginalPriceDisplay(`${origPrice.toLocaleString("fr-FR")} FCFA`)
            setPromoPriceDisplay(`${promoPrice.toLocaleString("fr-FR")} FCFA`)
          } else {
            setIsPromoActiveState(false)
            setDiscountPercentState(null)
            setOriginalPriceDisplay("")
            setPromoPriceDisplay(formattedPrice)
          }

          let promoAlert = ""
          if (isPromoActive && targetTime) {
            const diffMs = targetTime - now
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

            if (diffHours <= 24) {
              promoAlert = `🔥 Dernières 24h au tarif promo (${formattedPrice}) !`
            } else if (diffDays <= 5) {
              promoAlert = `🔥 Plus que ${diffDays} jours au tarif promo (${formattedPrice}) !`
            } else {
              promoAlert = `Offre Promo : ${formattedPrice} (Inscriptions ouvertes !)`
            }
          } else if (isExpired) {
            promoAlert = `Tarif Standard (${formattedPrice}) — Dernières places !`
          } else {
            promoAlert = "Inscriptions ouvertes !"
          }

          // Build dynamic title & dates
          const dateStr = course.dates ? `du ${course.dates}` : ""
          setCourseDatesText(dateStr)

          const isLegacyDefault = !rawCustomText || rawCustomText.includes("BOOTCAMP IA PRO 2") || rawCustomText.includes("Bootcamp IA & Carrière — Direct Live du 31 Août")
          
          let finalText = ""
          if (isLegacyDefault) {
            finalText = `${course.title} — Direct Live ${dateStr}. ${promoAlert}`
          } else {
            finalText = rawCustomText
              .replace(/{course}/gi, course.title)
              .replace(/{dates}/gi, course.dates || "")
              .replace(/{price}/gi, formattedPrice)
              .replace(/{promo}/gi, promoAlert)
          }

          let finalCta = ""
          if (!rawCustomCta || rawCustomCta.includes("99 000") || rawCustomCta.includes("149 000") || rawCustomCta.includes("FCFA")) {
            finalCta = "Réserver ma place →"
          } else {
            finalCta = rawCustomCta
          }

          // Formatage concis et ultra lisible de la date pour mobile
          let mobileDateLabel = "Direct Live"
          if (course.dates) {
            let d = course.dates.replace(/2026/g, '').replace(/2027/g, '').trim()
            d = d.replace(/Septembre/gi, 'Sept.').replace(/Octobre/gi, 'Oct.').replace(/Novembre/gi, 'Nov.').replace(/Décembre/gi, 'Déc.').replace(/Janvier/gi, 'Janv.').replace(/Février/gi, 'Févr.').replace(/Juillet/gi, 'Juil.')
            const parts = d.split(/\s+au\s+/i)
            if (parts.length === 2) {
              const startDay = parts[0].trim().replace(/\D+/g, '')
              const endPart = parts[1].trim()
              if (startDay && endPart) {
                mobileDateLabel = `${startDay} au ${endPart}`
              } else {
                mobileDateLabel = d
              }
            } else {
              mobileDateLabel = d
            }
          }

          setAnnouncementMobileText(mobileDateLabel.startsWith("du") ? mobileDateLabel : `du ${mobileDateLabel}`)
          setAnnouncementMobilePrice(`${formattedPrice} →`)

          setAnnouncementText(finalText)
          setAnnouncementCta(finalCta)
          setAnnouncementHref(`/checkout/${course.slug || course.id}${isExpired ? "?tier=standard" : ""}`)
        } else if (rawCustomText) {
          setAnnouncementText(rawCustomText)
          setAnnouncementMobileText("Direct Live")
          setAnnouncementMobilePrice("Réserver →")
          setAnnouncementCta(rawCustomCta || "En savoir plus →")
        }
      } catch (e) {}
    }

    loadAnnouncement()
    const interval = setInterval(loadAnnouncement, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase().trim()
    if (q.includes("claude")) router.push("/formations?category=claude")
    else if (q.includes("chatgpt") || q.includes("make")) router.push("/formations?category=chatgpt")
    else if (q.includes("notebook") || q.includes("gemini")) router.push("/formations?category=notebook")
    else if (q.includes("linkedin") || q.includes("prospect")) router.push("/formations?category=linkedin")
    else router.push("/formations")
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-border/80 backdrop-blur-xl">
      
      {/* Top Announcement Bar - 100% Responsive Mobile & Desktop */}
      <Link 
        href={announcementHref}
        className="block bg-gradient-to-r from-primary via-blue-600 to-[#D4AF37] text-white text-[11px] font-extrabold py-2 px-3 text-center transition-all hover:opacity-95 shadow-xs group"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 leading-tight flex-wrap sm:flex-nowrap">
          <Sparkles className="size-3.5 shrink-0 animate-pulse text-[#F3E5AB] hidden xs:inline-block" />
          
          {/* Version Mobile : Date clairement visible + Effet Promo avec prix barré */}
          <div className="inline sm:hidden text-[10.5px] xs:text-[11px] font-bold tracking-tight">
            <span>🔥 {courseTitle} • </span>
            <span className="text-[#F3E5AB] font-black underline decoration-amber-300/60 underline-offset-2">
              {announcementMobileText}
            </span>
          </div>
          
          {/* Version Desktop : Texte complet avec effet promo barré et badge -% */}
          <div className="hidden sm:inline-flex items-center gap-2">
            <span>{courseTitle} — Direct Live {courseDatesText}.</span>
            {isPromoActiveState && discountPercentState ? (
              <span className="inline-flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10">
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase animate-pulse">
                  -{discountPercentState}%
                </span>
                <span className="line-through text-slate-300/80 text-[10px]">
                  {originalPriceDisplay}
                </span>
                <span className="text-[#F3E5AB] font-black text-xs">
                  {promoPriceDisplay}
                </span>
              </span>
            ) : (
              <span>{announcementText}</span>
            )}
          </div>

          {/* Badge CTA Mobile & Desktop */}
          <span className="inline-flex items-center gap-1.5 font-black bg-slate-950/40 sm:bg-slate-950/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#F3E5AB]/30 shrink-0 text-[10px] sm:text-[11px] group-hover:bg-[#F3E5AB] group-hover:text-slate-950 transition-all text-[#F3E5AB]">
            {/* Sur Mobile : prix barré + prix promo si actif */}
            <span className="inline sm:hidden flex items-center gap-1">
              {isPromoActiveState && originalPriceDisplay && (
                <span className="line-through text-slate-300/80 text-[9px] font-normal">
                  {originalPriceDisplay.replace(" FCFA", "")}
                </span>
              )}
              <span>{announcementMobilePrice || "Réserver →"}</span>
            </span>

            {/* Sur Desktop */}
            <span className="hidden sm:inline">{announcementCta}</span>
          </span>
        </div>
      </Link>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <img src="/Logo%20avatar.png" alt="Logo Le Guide IA" className="size-8 rounded-lg object-cover" />
          <span className="font-heading text-lg font-black tracking-tight text-white">
            LE GUIDE <span className="text-primary">IA</span>
          </span>
        </Link>

        {/* Categories Dropdown */}
        <div
          className="relative hidden flex-1 md:block group"
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => setCategoriesOpen(false)}
        >
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <span>Catégories</span>
            <ChevronDown className="size-3.5 text-muted-foreground group-hover:rotate-180 transition-transform" />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 pt-2 w-64 z-50">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl space-y-1 backdrop-blur-2xl">
               
                <Link href="/bootcamp" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <GraduationCap className="size-4 text-primary" />
                  <span>Bootcamps IA</span>
                </Link>
                {/* <Link href="/formations" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <Sparkles className="size-4 text-blue-400" />
                  <span>Nos Formations (À la demande)</span>
                </Link> */}
                <Link href="/ressources" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <BookOpen className="size-4 text-[#D4AF37]" />
                  <span>Bibliothèque de Prompts</span>
                </Link>
                <Link href="/entreprises" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary text-foreground">
                  <Building2 className="size-4 text-blue-400" />
                  <span>Espace Entreprises (B2B)</span>
                </Link>
                 <Link href="/masterclass" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold hover:bg-secondary text-rose-300">
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Masterclasses (Live)</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar ( Style) */}
        {/* <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Que voulez-vous apprendre ? (ex: ChatGPT, Claude, Make...)"
              className="w-full rounded-full border border-border bg-input/40 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </form>
        </div> */}

        {/* Nav Links & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          <Link 
            href="/masterclass" 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-white px-3 py-1.5 rounded-xl bg-slate-900/90 border border-rose-500/40 hover:border-rose-500 text-rose-300 transition-all shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Masterclasses</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 font-extrabold uppercase">Gratuit</span>
          </Link>

          <Link href="/bootcamp" className="hidden md:inline-block text-xs font-bold text-slate-300 hover:text-white transition-colors">
            Bootcamps
          </Link>

          <Link href="/entreprises" className="hidden lg:inline-block text-xs font-bold text-slate-300 hover:text-white transition-colors">
            Espace Entreprises
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-primary hover:opacity-90 px-3.5 py-2 rounded-xl shadow-md transition-all"
              >
                <User className="size-3.5" />
                <span>Mon Espace</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-2.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                title="Déconnexion"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-slate-950 bg-primary hover:opacity-90 px-4 py-2 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <User className="size-3.5" />
              <span>Connexion</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-slate-950/98 px-5 py-6 space-y-5 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Rechercher une formation..."
              className="w-full rounded-xl border border-border bg-input/40 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          <div className="space-y-1">
            <Link
              href="/masterclass"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-black text-rose-300 bg-rose-500/10 border border-rose-500/20"
            >
              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Masterclasses (Live Dimanche 19h)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-extrabold ml-auto">Gratuit</span>
            </Link>
            <Link
              href="/bootcamp"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-secondary"
            >
              <GraduationCap className="size-4 text-primary" />
              <span>Bootcamps IA</span>
            </Link>
            <Link
              href="/formations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-secondary"
            >
              <Sparkles className="size-4 text-cyan-400" />
              <span>Formations Vidéos (À la demande)</span>
            </Link>
            <Link
              href="/ressources"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-secondary"
            >
              <BookOpen className="size-4 text-purple-400" />
              <span>Bibliothèque de Prompts</span>
            </Link>
            <Link
              href="/entreprises"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-secondary"
            >
              <Building2 className="size-4 text-blue-400" />
              <span>Espace Entreprises (B2B)</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-border/60">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-slate-950 font-black text-xs shadow-lg"
                >
                  <User className="size-4" />
                  <span>Accéder à Mon Espace</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs"
                >
                  <LogOut className="size-3.5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-slate-950 font-black text-xs shadow-lg"
              >
                <User className="size-4" />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  )
}
