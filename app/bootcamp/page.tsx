"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Header } from "@/components/header"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"
import { GraduationCap, UserCheck, Gift, ArrowRight, Sparkles, CheckCircle2, Calendar, Globe, Download, Clock } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic, getCourseVisibilityStatus } from "@/lib/courses-visibility"
import { useUserEnrollments } from "@/lib/user-enrollments"

function BootcampContent() {
  const { isEnrolledInCourse, isPendingInCourse } = useUserEnrollments()
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [dbCourses, setDbCourses] = useState<any[]>([])

  useEffect(() => {
    async function loadCourses() {
      try {
        let { data, error } = await supabase.from("courses").select("*").order("sequence_order", { ascending: true }).order("created_at", { ascending: true })
        if (error || !data || data.length === 0) {
          const res = await supabase.from("courses").select("*").order("created_at", { ascending: true })
          data = res.data
        }
        if (data && data.length > 0) {
          setDbCourses(data)
          const urlParams = new URLSearchParams(window.location.search)
          const paramCourse = urlParams.get("course")
          if (paramCourse) {
            const found = data.find(c => c.slug === paramCourse || c.id === paramCourse)
            if (found) {
              setSelectedCourseId(found.id)
              return
            }
          }
          const publicOnly = data.filter(isCourseOpenForPublic)
          setSelectedCourseId((publicOnly[0] || data[0]).id)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          setDbCourses(data.courses)
          const urlParams = new URLSearchParams(window.location.search)
          const paramCourse = urlParams.get("course")
          if (paramCourse) {
            const found = data.courses.find((c: any) => c.slug === paramCourse || c.id === paramCourse)
            if (found) {
              setSelectedCourseId(found.id)
              return
            }
          }
          const publicOnly = data.courses.filter(isCourseOpenForPublic)
          setSelectedCourseId((publicOnly[0] || data.courses[0]).id)
        }
      } catch (e) {}
    }
    loadCourses()
  }, [])

  const isBusinessCourse = (c: any) => {
    if (!c) return false
    const p = Number(c.price)
    const slug = String(c.slug || "").toLowerCase()
    const title = String(c.title || "").toLowerCase()
    const badge = String(c.badge || "").toLowerCase()
    return p >= 140000 || slug.includes("business") || slug.includes("exec") || title.includes("business") || badge.includes("vip") || badge.includes("executif") || badge.includes("manager")
  }

  const getOfferEndTimestamp = (rawDate?: string | null): number | null => {
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

  const active = dbCourses.find(c => c.id === selectedCourseId || c.slug === selectedCourseId) || dbCourses[0]

  const isBusiness = isBusinessCourse(active)

  const activeTargetTimestamp = getOfferEndTimestamp(active?.offer_end_date)
  const isOfferExpired = activeTargetTimestamp ? activeTargetTimestamp < Date.now() : false

  const displayPrice = isOfferExpired
    ? (active?.original_price || active?.price || 0)
    : (active?.price || 0)

  const getBadgeLabel = (c: any) => {
    if (isBusinessCourse(c)) return "EXCLUSIVE MANAGERS"
    if (c?.badge && !c.badge.toLowerCase().includes("vip") && !c.badge.toLowerCase().includes("executif")) return c.badge
    return "PARCOURS CARRIÈRE & PROS"
  }

  const formatText = active?.format
    ? String(active.format).replace(/VIP/gi, "Dirigeants")
    : "100% En Ligne"

  const certificateText = active?.certificate
    ? String(active.certificate).replace(/VIP/gi, "Exécutif")
    : "Certificat Officiel"

  const theme = isBusiness
    ? {
        border: "border-2 border-[#D4AF37] glow-gold bg-slate-950/90 shadow-2xl",
        priceBox: "bg-[#D4AF37]/10 border border-[#D4AF37]/30",
        priceText: "text-[#ECC86B]",
        badgeText: "text-[#F3E5AB] font-black uppercase tracking-wider text-[10px]",
        iconSession: "text-[#D4AF37]",
        iconOnline: "text-[#ECC86B]",
        iconCert: "text-[#D4AF37]",
        checkIcon: "text-[#D4AF37]",
        btn: "bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black shadow-xl shadow-[#D4AF37]/25",
        posterBorder: "border-[#D4AF37]/40 glow-gold",
      }
    : {
        border: "border-2 border-blue-500/50 glow-blue bg-card/80 shadow-2xl",
        priceBox: "bg-blue-500/10 border border-blue-500/20",
        priceText: "text-blue-400",
        badgeText: "text-blue-200 font-bold uppercase tracking-wider text-[10px]",
        iconSession: "text-blue-400",
        iconOnline: "text-blue-300",
        iconCert: "text-[#D4AF37]",
        checkIcon: "text-blue-400",
        btn: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-500/25",
        posterBorder: "border-blue-500/30",
      }

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <Header />

      {/* Hero Section Adaptée aux Formules de Bootcamp */}
      <section className="py-14 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          {/* Header Left-Aligned */}
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              CATALOGUE OFFICIEL DES BOOTCAMPS LE GUIDE IA
            </span>

            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
               Choisissez le Bootcamp adapté à votre profil et vos objectifs.
            </p>
          </div>

          {/* Dynamic Formula Selector Tabs from Supabase */}
          <div className="flex items-center justify-start gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
            {dbCourses.filter(isCourseOpenForPublic).map((c) => {
              const isCurActive = active?.id === c.id
              const isCurBusiness = isBusinessCourse(c)
              const cTarget = getOfferEndTimestamp(c.offer_end_date)
              const cExpired = cTarget ? cTarget < Date.now() : false
              const cDisplayPrice = cExpired ? (c.original_price || c.price) : c.price
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                    isCurActive
                      ? isCurBusiness
                        ? "bg-[#D4AF37] text-slate-950 border-[#F3E5AB] shadow-lg shadow-[#D4AF37]/30 scale-[1.02] font-black"
                        : "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-[1.02] font-bold"
                      : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground font-semibold"
                  }`}
                >
                  {isCurBusiness ? <UserCheck className="size-4" /> : <GraduationCap className="size-4" />}
                  <span>{c.title} ({cDisplayPrice > 0 ? `${Number(cDisplayPrice).toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT"})</span>
                </button>
              )
            })}
          </div>

          {/* Dynamic Active Formula Showcase Card with Official 3:4 Poster Image */}
          {active && (
            <motion.div
              key={active.id || selectedCourseId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl backdrop-blur-2xl p-6 md:p-10 relative z-10 ${theme.border}`}
            >
              <div className="grid gap-8 lg:grid-cols-12 items-stretch">
                
                {/* Left Column: Details & Program Features (Order 2 on mobile, Order 1 on desktop) */}
                <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-between space-y-6">
                  
                  {/* Header Row */}
                  <div className="space-y-4">
                    {/* Already Enrolled Banner */}
                    {isEnrolledInCourse(active) && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                        <div>
                          <strong>Inscription confirmée :</strong> Vous êtes déjà inscrit(e) à ce Bootcamp. Vos replays et salons d'entraide sont disponibles dans votre espace membre.
                        </div>
                      </div>
                    )}

                    {/* Pending Verification Banner */}
                    {isPendingInCourse(active) && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                        <Clock className="size-4 shrink-0 text-amber-400 animate-pulse" />
                        <div>
                          <strong>Demande d'inscription reçue :</strong> Votre virement Mobile Money est en cours de vérification sous moins de 24h. Vous pouvez suivre l'état d'activation sur votre espace membre.
                        </div>
                      </div>
                    )}

                    {/* Expired / Closed Notice if viewed directly and not enrolled */}
                    {!isEnrolledInCourse(active) && !isPendingInCourse(active) && !isCourseOpenForPublic(active) && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                        <Sparkles className="size-4 shrink-0 text-amber-400" />
                        <div>
                          <strong>Session clôturée :</strong> Les inscriptions pour cette cohorte sont terminées. Les membres inscrits peuvent accéder aux replays et ressources directement sur leur espace membre.
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
                      <div className="space-y-1 text-left">
                  
                        <h2 className="font-heading text-2xl md:text-3xl font-black text-foreground pt-1">
                          {active.title}
                        </h2>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {active.subtitle || active.description}
                        </p>
                      </div>

                      <div className={`text-left sm:text-right shrink-0 px-4 py-2.5 rounded-2xl ${theme.priceBox}`}>
                        <div className={`font-heading text-2xl md:text-3xl font-black ${theme.priceText}`}>
                          {displayPrice > 0 ? `${Number(displayPrice).toLocaleString("fr-FR")} ${active.currency || "FCFA"}` : "GRATUIT"}
                        </div>
                        <div className={theme.badgeText}>
                          {isEnrolledInCourse(active) ? "INSCRIPTION ACTIVE" : isPendingInCourse(active) ? "EN COURS DE VALIDATION" : isOfferExpired ? "TARIF STANDARD" : getBadgeLabel(active)}
                        </div>
                      </div>
                    </div>

                    {/* Highlights Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Calendar className={`size-3.5 ${theme.iconSession}`} />
                        Session : {active.dates || active.date || "Sur 7 jours"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Globe className={`size-3.5 ${theme.iconOnline}`} />
                        {formatText}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Sparkles className={`size-3.5 ${theme.iconCert}`} />
                        {certificateText}
                      </span>
                    </div>
                  </div>

                {/* Features List */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/80">Ce qui est inclus dans cette formule :</h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs md:text-sm text-foreground/90">
                    {Array.isArray(active?.features) && active.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${theme.checkIcon}`} />
                        <span>{String(feat).replace(/VIP/gi, "Exclusifs")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Buttons Row (Spacious & Clean Layout) */}
                <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
                  {isEnrolledInCourse(active) ? (
                    <Link
                      href="/dashboard"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs md:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Vous êtes déjà inscrit(e) · Espace Membre</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : isPendingInCourse(active) ? (
                    <Link
                      href="/dashboard"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs md:text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Clock className="size-4 animate-pulse" />
                      <span>⏳ Inscription en cours de traitement · Espace Membre</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : isCourseOpenForPublic(active) ? (
                    <Link
                      href={active?.price === 0 || active?.price === "0" || active?.price === "GRATUIT" ? "/register-account" : `/checkout/${active?.slug || active?.id}?id=${active?.id || ""}${isOfferExpired ? "&tier=standard" : ""}`}
                      className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs md:text-sm transition-all hover:scale-[1.01] active:scale-95 cursor-pointer ${theme.btn}`}
                    >
                      <span>Réserver ma place ({displayPrice > 0 ? `${Number(displayPrice).toLocaleString("fr-FR")} FCFA` : "Tarif Standard"})</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs md:text-sm font-bold bg-primary text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-lg"
                    >
                      <span>Accéder à l'Espace Membre (Replays)</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  )}

                  <a
                    href={active?.pdf_url || active?.programme_url || "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                  >
                    <Download className="size-4" />
                    <span>Télécharger le programme (PDF)</span>
                  </a>
                </div>

              </div>

              {/* Right Column: Official Poster Display (Order 1 on mobile, Order 2 on desktop) */}
              <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center items-center">
                <div className={`rounded-2xl bg-slate-950 p-3 shadow-2xl backdrop-blur-xl w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[340px] border ${theme.posterBorder}`}>
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/40 shadow-xl bg-slate-950 group">
                    <img
                      src={active?.poster || active?.thumbnail || "/images/bootcamp_pro_poster.jpg"}
                      alt={`Affiche Officielle ${active?.title || "Bootcamp"}`}
                      className="w-full h-full object-contain block group-hover:scale-[1.02] transition-transform duration-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        </div>
      </section>

      {/* Grille Tarifs Complète */}
      <Pricing 
        activeCourse={active}
        selectedCourseId={selectedCourseId} 
        courses={dbCourses} 
        onSelectCourse={(id) => setSelectedCourseId(id)} 
      />

      {/* Témoignages des alumni */}
      <Testimonials />

      {/* Pied de Page / Footer officiel du site */}
      <CtaFooter hideCta={true} />

      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}

export default function BootcampPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-primary font-bold text-sm">
        Chargement des bootcamps...
      </div>
    }>
      <BootcampContent />
    </Suspense>
  )
}
