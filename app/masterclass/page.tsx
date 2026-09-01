"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { 
  Play, Video, Calendar, Clock, CheckCircle2, 
  Sparkles, ArrowRight, Radio, ExternalLink, 
  LogIn, UserCheck, Search, Filter, ShieldCheck, X,
  Tv, Award, Zap, Mail, MessageCircle, Lock, Crown
} from "lucide-react"
import { SubscriptionModal } from "@/components/subscription-modal"

interface ReplayItem {
  id: string
  title: string
  description: string
  youtubeId: string
  youtubeUrl: string
  duration: string
  category: string
  instructor: string
  date: string
  views?: string
  is_published?: boolean
}

export default function MasterclassHubPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  
  // Abonnement VIP Replays & Prompts
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  
  const [upcomingSession, setUpcomingSession] = useState<any>(null)
  const [allUpcomingSessions, setAllUpcomingSessions] = useState<any[]>([])
  const [replays, setReplays] = useState<ReplayItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeVideoModal, setActiveVideoModal] = useState<ReplayItem | null>(null)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  // Vérifier si une session en direct future et active est réellement disponible
  const hasActiveLive = Boolean(
    upcomingSession && 
    upcomingSession.is_active !== false && 
    (!upcomingSession.scheduledAt || new Date(upcomingSession.scheduledAt).getTime() >= Date.now() - 4 * 3600 * 1000)
  )

  // 1. Initial Load & Auth / Registration check (Authentification requise)
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || null
        setCurrentUser(user)

        // Si l'utilisateur n'est pas connecté, pas d'inscription persistée ni de message résiduel
        if (!user) {
          setIsRegistered(false)
          setIsSubscribed(false)
          setFeedbackMsg(null)
          if (typeof window !== "undefined") {
            localStorage.removeItem("masterclass_registered")
            localStorage.removeItem("masterclass_registered_email")
          }
        }

        const emailToCheck = user?.email || ""

        // Fetch dynamic session, replays and session-specific registration from Supabase
        const res = await fetch(`/api/masterclass${emailToCheck ? `?email=${encodeURIComponent(emailToCheck)}` : ""}`)
        const data = await res.json()

        if (data.upcomingSession) {
          setUpcomingSession(data.upcomingSession)
        } else {
          setUpcomingSession(null)
        }

        if (data.allUpcomingSessions && Array.isArray(data.allUpcomingSessions)) {
          setAllUpcomingSessions(data.allUpcomingSessions)
        } else {
          setAllUpcomingSessions([])
        }

        // Seul un utilisateur connecté et inscrit en base est considéré comme inscrit au direct
        if (user && data.isRegistered) {
          setIsRegistered(true)
        } else {
          setIsRegistered(false)
        }

        if (data.replays && Array.isArray(data.replays)) {
          setReplays(data.replays)
        }

        // Vérifier l'abonnement VIP / inscription Bootcamp
        if (emailToCheck) {
          try {
            const subRes = await fetch(`/api/subscriptions?email=${encodeURIComponent(emailToCheck)}`)
            const subData = await subRes.json()
            if (subData.isSubscribed) {
              setIsSubscribed(true)
              setSubscriptionInfo(subData)
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error("Masterclass page load error:", err)
      } finally {
        setAuthChecking(false)
      }
    }

    init()
  }, [])

  // 2. Countdown Calculation strictly based on upcomingSession.scheduledAt
  useEffect(() => {
    if (!upcomingSession?.is_active || !upcomingSession?.scheduledAt) {
      setTimeLeft(null)
      return
    }

    function calculateTimeLeft() {
      const targetTime = new Date(upcomingSession.scheduledAt).getTime()
      const now = new Date().getTime()
      const difference = targetTime - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60 * 60)) % 24),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      return null
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [upcomingSession?.scheduledAt, upcomingSession?.is_active])

  // Helper pour vérifier le statut d'inscription lors du changement de session
  async function handleSelectSession(session: any) {
    setUpcomingSession(session)
    setFeedbackMsg(null)
    const emailToCheck = currentUser?.email || ""
    if (emailToCheck) {
      try {
        const res = await fetch(`/api/masterclass?email=${encodeURIComponent(emailToCheck)}&sessionId=${encodeURIComponent(session.id)}`)
        const data = await res.json()
        setIsRegistered(Boolean(data.isRegistered))
      } catch (_) {
        setIsRegistered(false)
      }
    } else {
      setIsRegistered(false)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 3. Registration handler (Utilisateur connecté requis)
  async function handleRegister() {
    if (!currentUser?.email) {
      window.location.href = "/login?redirect=/masterclass"
      return
    }

    const emailToSubmit = currentUser.email.toLowerCase().trim()
    const nameToSubmit = currentUser.user_metadata?.full_name || emailToSubmit.split("@")[0]

    setRegistering(true)
    setFeedbackMsg(null)

    const targetSessionId = upcomingSession?.id || "mc_default"
    const targetSessionTitle = upcomingSession?.title || "Masterclass IA en Direct"

    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToSubmit,
          fullName: nameToSubmit,
          whatsapp: currentUser.user_metadata?.whatsapp || "",
          country: currentUser.user_metadata?.country || "CI",
          masterclassId: targetSessionId,
          masterclassTitle: targetSessionTitle
        })
      })

      const data = await res.json()
      if (data.success) {
        setIsRegistered(true)
        if (data.alreadyRegistered) {
          setFeedbackMsg("ℹ️ Vous êtes déjà inscrit à cette Masterclass ! Vos accès sont débloqués ci-dessous.")
        } else {
          setFeedbackMsg("🎉 Inscription confirmée avec succès ! Rejoignez le groupe WhatsApp des apprenants ci-dessous.")
        }
      } else {
        setFeedbackMsg(data.error || "Erreur lors de la réservation.")
      }
    } catch (err: any) {
      setFeedbackMsg("Erreur réseau : " + err.message)
    } finally {
      setRegistering(false)
    }
  }

  // Categories list
  const categories = ["Tous", "Prompting", "Automatisation", "Création de Contenu", "Business"]

  const filteredReplays = replays.filter(r => {
    const matchCat = selectedCategory === "Tous" || r.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchQuery = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  // Composant du bloc d'action (Boutons de réservation ou Liens direct débloqués)
  const renderActionBox = () => (
    <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-4 text-left shadow-lg">
      {authChecking ? (
        <div className="py-3 text-center text-xs text-muted-foreground animate-pulse">
          Vérification de votre statut d'inscription...
        </div>
      ) : isRegistered ? (
        /* État : DÉJÀ INSCRIT */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
              <span>Vous êtes déjà inscrit à cette Masterclass !</span>
            </div>
            <p className="text-xs text-slate-300 pl-7 leading-relaxed">
              Votre place est confirmée et réservée. Accédez directement au direct et au groupe d'échange des apprenants ci-dessous.
            </p>
          </div>

          {/* GROUPE WHATSAPP CARD / BUTTON PROÉMINENT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <MessageCircle className="size-4 text-emerald-400" />
              <span>GROUPE WHATSAPP</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Intégrez le groupe WhatsApp officiel pour échanger avec Alfred Dah et tous les participants.
            </p>
            <a
              href={upcomingSession?.whatsappGroupUrl || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-600/30 cursor-pointer"
            >
              <MessageCircle className="size-4" />
              <span>Rejoindre le Groupe WhatsApp</span>
              <ExternalLink className="size-3.5 opacity-80" />
            </a>
          </div>

          {/* BOUTON GOOGLE MEET LIVE */}
          <a
            href={upcomingSession?.youtubeLiveUrl || "https://meet.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
          >
            <Video className="size-4" />
            <span>Rejoindre la Session sur Google Meet</span>
            <ExternalLink className="size-3.5 opacity-80" />
          </a>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Inscrit avec le compte : <strong className="text-white">{currentUser?.email}</strong></span>
          </div>
        </div>
      ) : currentUser ? (
        /* État : Utilisateur connecté mais pas encore inscrit */
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/60 border border-border p-3 rounded-xl">
            <UserCheck className="size-4 text-emerald-400 shrink-0" />
            <span className="truncate">Connecté en tant que <strong className="text-white">{currentUser.email}</strong></span>
          </div>

          <button
            type="button"
            disabled={registering}
            onClick={() => handleRegister()}
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            {registering ? (
              <span>Réservation en cours...</span>
            ) : (
              <>
                <span>Réserver ma place gratuite en 1 clic</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            🔒 Inscription 100% gratuite • Débloque le lien direct Google Meet et l'accès au groupe WhatsApp des apprenants.
          </p>
        </div>
      ) : (
        /* État : Visiteur non connecté -> Connexion Obligatoire */
        <div className="space-y-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Lock className="size-3.5" />
              <span>Connexion Requise</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              Connectez-vous pour réserver votre place
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pour participer à cette Masterclass en direct et débloquer les accès, veuillez vous connecter ou créer votre compte gratuit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Link
              href="/login?redirect=/masterclass"
              className="flex-1 py-3 px-4 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <LogIn className="size-4" />
              <span>Se connecter</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/register-account?redirect=/masterclass"
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs text-center border border-border transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Créer un compte</span>
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            🔒 Inscription 100% gratuite • Accès débloqués immédiatement dès la connexion.
          </p>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-3 rounded-lg bg-[#090d16] border border-border text-xs text-emerald-400 font-semibold">
          {feedbackMsg}
        </div>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#090d16] text-white selection:bg-primary selection:text-slate-950 font-sans">
      
      {/* 1. Header Global du Site */}
      <Header />

      {/* 2. SI MASTERCLASS EN DIRECT ACTIVE & À VENIR */}
      {hasActiveLive && upcomingSession ? (
        <section className="relative pt-6 sm:pt-10 pb-14 px-4 max-w-7xl mx-auto overflow-hidden">
          
          {/* ========================================================================= */}
          {/* VERSION MOBILE (< lg) : AFFICHE EN HAUT + BOUTON D'ACTION JUSTE EN DESSOUS */}
          {/* ========================================================================= */}
          <div className="lg:hidden space-y-6 text-left">
            
            {/* Tag Direct & Titre Mobile */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold">
                <Radio className="size-3.5 text-rose-500 animate-pulse" />
                <span className="text-white">
                  {upcomingSession.dateDisplay ? `DIRECT : ${upcomingSession.dateDisplay.toUpperCase()}` : "PROCHAINE SESSION EN DIRECT"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight font-heading">
                {upcomingSession.title}
              </h1>
            </div>

            {/* BLOC AFFICHE + BOUTON D'INSCRIPTION EN BAS DE L'AFFICHE (Mobile First) */}
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4 text-center">
              
              {/* Miniature / Affiche Officielle (Affichage Intégral Sans Rognage) */}
              {upcomingSession.thumbnailUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-[#090d16]/90 shadow-2xl flex items-center justify-center min-h-[220px] max-h-[360px]">
                  {/* Flou d'ambiance d'arrière-plan */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${upcomingSession.thumbnailUrl})` }}
                  />
                  {/* Affiche Complète Nette (100% visible) */}
                  <img
                    src={upcomingSession.thumbnailUrl}
                    alt={upcomingSession.title}
                    className="relative z-10 w-full h-auto max-h-[360px] object-contain mx-auto rounded-xl drop-shadow-md"
                  />
                  <span className="absolute top-2.5 left-2.5 z-20 px-2.5 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-rose-400/30">
                    <span className="size-1.5 rounded-full bg-white animate-ping" />
                    Session en Direct
                  </span>
                </div>
              )}

              {/* Date & Compte à Rebours Mobile */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  {upcomingSession.dateDisplay || "En Direct Prochainement"}
                </h3>

                {timeLeft && (
                  <div className="grid grid-cols-4 gap-1.5 py-1">
                    <div className="p-2 rounded-xl border border-border bg-[#090d16] space-y-0.5">
                      <span className="text-xl font-black text-white font-mono">{timeLeft.days}</span>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold">Jours</span>
                    </div>
                    <div className="p-2 rounded-xl border border-border bg-[#090d16] space-y-0.5">
                      <span className="text-xl font-black text-white font-mono">{timeLeft.hours}</span>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold">Heures</span>
                    </div>
                    <div className="p-2 rounded-xl border border-border bg-[#090d16] space-y-0.5">
                      <span className="text-xl font-black text-white font-mono">{timeLeft.minutes}</span>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold">Min</span>
                    </div>
                    <div className="p-2 rounded-xl border border-border bg-[#090d16] space-y-0.5">
                      <span className="text-xl font-black text-primary font-mono">{timeLeft.seconds}</span>
                      <span className="block text-[9px] text-muted-foreground uppercase font-bold">Sec</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOUTON D'INSCRIPTION / LIENS LIVE DÉBLOQUÉS (Placé directement en bas de l'affiche) */}
              <div className="pt-1">
                {renderActionBox()}
              </div>

            </div>

            {/* Détails et Highlights (Mobile) */}
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {upcomingSession.description}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl border border-border bg-card/80 space-y-0.5 text-center">
                  <Clock className="size-4 text-primary mx-auto" />
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase">Durée</span>
                  <p className="text-[11px] text-white font-bold">{upcomingSession.duration}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 space-y-0.5 text-center">
                  <Video className="size-4 text-primary mx-auto" />
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase">Plateforme</span>
                  <p className="text-[11px] text-white font-bold">Google Meet (Direct)</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card/80 space-y-0.5 text-center">
                  <ShieldCheck className="size-4 text-emerald-400 mx-auto" />
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase">Tarif</span>
                  <p className="text-[11px] text-emerald-400 font-bold">100% Gratuit</p>
                </div>
              </div>

              {/* Formateur Mobile */}
              <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                <div className="size-11 rounded-full overflow-hidden border border-border shrink-0 bg-slate-800">
                  <img
                    src="/Logo avatar.png"
                    alt={upcomingSession.instructor}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white truncate">{upcomingSession.instructor}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{upcomingSession.instructorRole}</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* VERSION DESKTOP (lg:grid-cols-12) : 2 COLONNES CLASSIC CLEAN LAYOUT       */}
          {/* ========================================================================= */}
          <div className="hidden lg:grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Colonne Gauche: Infos & Action Box Desktop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold">
                <Radio className="size-3.5 text-rose-500 animate-pulse" />
                <span className="text-white">
                  {upcomingSession.dateDisplay ? `DIRECT : ${upcomingSession.dateDisplay.toUpperCase()}` : "PROCHAINE SESSION EN DIRECT"}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
                {upcomingSession.title}
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                {upcomingSession.description}
              </p>

              {/* Session Highlights */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="size-4" />
                    <span className="font-bold text-xs">Durée & Format</span>
                  </div>
                  <p className="text-xs text-white font-semibold">{upcomingSession.duration} en direct</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Video className="size-4" />
                    <span className="font-bold text-xs">Plateforme</span>
                  </div>
                  <p className="text-xs text-white font-semibold">Google Meet (En Direct)</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="size-4" />
                    <span className="font-bold text-xs">Tarif d'Accès</span>
                  </div>
                  <p className="text-xs text-white font-semibold">100% Gratuit</p>
                </div>
              </div>

              {/* Action Box Desktop */}
              {renderActionBox()}

            </div>

            {/* Colonne Droite: Affiche & Compte à Rebours Desktop */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl space-y-6 text-center">
                
                {/* Miniature / Affiche Officielle (Affichage Intégral Sans Rognage) */}
                {upcomingSession.thumbnailUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-[#090d16]/90 shadow-2xl flex items-center justify-center min-h-[260px] max-h-[420px]">
                    {/* Flou d'ambiance d'arrière-plan */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
                      style={{ backgroundImage: `url(${upcomingSession.thumbnailUrl})` }}
                    />
                    {/* Affiche Complète Nette (100% visible) */}
                    <img
                      src={upcomingSession.thumbnailUrl}
                      alt={upcomingSession.title}
                      className="relative z-10 w-full h-auto max-h-[420px] object-contain mx-auto rounded-xl drop-shadow-md"
                    />
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-rose-400/30">
                      <span className="size-1.5 rounded-full bg-white animate-ping" />
                      Session en Direct
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-heading">
                    {upcomingSession.dateDisplay || "En Direct Prochainement"}
                  </h3>
                </div>

                {/* Compte à rebours */}
                {timeLeft && (
                  <div className="grid grid-cols-4 gap-2 py-2">
                    <div className="p-3 rounded-xl border border-border bg-[#090d16] space-y-1">
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">{timeLeft.days}</span>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold">Jours</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-[#090d16] space-y-1">
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">{timeLeft.hours}</span>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold">Heures</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-[#090d16] space-y-1">
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">{timeLeft.minutes}</span>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-[#090d16] space-y-1">
                      <span className="text-2xl sm:text-3xl font-black text-primary font-mono">{timeLeft.seconds}</span>
                      <span className="block text-[10px] text-muted-foreground uppercase font-bold">Sec</span>
                    </div>
                  </div>
                )}

                {/* Formateur */}
                <div className="p-4 rounded-2xl border border-border bg-[#090d16] flex items-center gap-3 text-left">
                  <div className="size-12 rounded-full overflow-hidden border border-border shrink-0 bg-slate-800">
                    <img
                      src="/Logo avatar.png"
                      alt={upcomingSession.instructor}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate">{upcomingSession.instructor}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{upcomingSession.instructorRole}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      ) : (
        /* 3. SI AUCUNE MASTERCLASS EN DIRECT PROGRAMMÉE (is_active === false) */
        <section className="relative pt-12 pb-14 px-4 max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-primary">
            {replays.length > 0 ? <Tv className="size-3.5" /> : <Sparkles className="size-3.5" />}
            <span>{replays.length > 0 ? "VIDÉOTHÈQUE DES MASTERCLASSES" : "MASTERCLASSES LE GUIDE IA"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading max-w-3xl mx-auto">
            {replays.length > 0 ? "Masterclasses IA : Replays & Sessions Pratiques" : "Les Masterclasses IA Arrivent Bientôt !"}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {replays.length > 0 ? (
              <>Visionnez gratuitement toutes les masterclasses passées animées par <strong>Alfred Dah</strong>. Apprenez le Prompt Engineering, l'automatisation de workflows et la création de contenu sans limite.</>
            ) : (
              <>Notre équipe pédagogique prépare activement les prochaines sessions interactives en direct et des démonstrations pratiques. Restez connectés pour être prévenus dès l'ouverture des inscriptions.</>
            )}
          </p>

          {/* Badges d'Accès */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-slate-200">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>100% Gratuit & Accès Libre</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-slate-200">
              <Tv className="size-4 text-primary" />
              <span>Directs & Replays HD</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-slate-200">
              <Zap className="size-4 text-primary" />
              <span>Cas Pratiques Concrets</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl border border-border bg-card/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-bold text-white">
                {replays.length > 0 ? "💡 Prochaine session en direct en préparation" : "🚀 Envie d'accélérer dès maintenant ?"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {replays.length > 0 
                  ? "Nos formateurs préparent le prochain live. Visionnez tous les replays ci-dessous !" 
                  : "N'attendez plus améliorez votre potentiel en vous inscrivant à nos bootcamps !"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/bootcamp"
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Voir les Bootcamp AI
              </Link>
            </div>
          </div>

        </section>
      )}

      {/* 2. CALENDRIER DES PROCHAINES MASTERCLASSES AU PROGRAMME (si plusieurs sessions configurées) */}
      {allUpcomingSessions.length > 1 && (
        <section className="py-8 max-w-7xl mx-auto px-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-primary font-bold">
                <Calendar className="size-3 text-primary" />
                <span>CALENDRIER DES MASTERCLASSES</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Prochaines Sessions en Direct au Programme
              </h2>
              <p className="text-xs text-muted-foreground">
                Découvrez les thématiques des prochaines sessions interactives hebdomadaires animées par Alfred Dah.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allUpcomingSessions.map((s, idx) => {
              const isSelected = s.id === upcomingSession.id
              return (
                <div
                  key={s.id || idx}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card/60 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {idx === 0 ? "🔴 Prochaine Session" : `Session #${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {s.duration || "1h 30min"}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white line-clamp-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.description || "Session interactive animée par Alfred Dah."}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 pt-1">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span>{s.dateDisplay || (s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Date à venir")}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-bold">
                      ✓ 100% Gratuit
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectSession(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-slate-950 font-extrabold"
                          : "bg-white/5 hover:bg-white/10 text-white border border-border"
                      }`}
                    >
                      {isSelected ? "Session Sélectionnée" : "Participer à ce direct"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. Vidéothèque des Replays (YouTube) - Accessible aux abonnés VIP & Bootcamp */}
      {replays.length > 0 && (
        <section id="replays-section" className="pt-8 pb-20 max-w-7xl mx-auto px-4 border-t border-border">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-primary font-bold">
                <Play className="size-3 fill-primary" />
                <span>VIDÉOTHÈQUE DES REPLAYS MASTERCLASSES</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Rediffusions &amp; Formations Pratiques
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Visionnez tous les replays en illimité et pratiquez avec nos experts.
              </p>
            </div>

            {/* Bannière / Statut Abonnement VIP */}
            <div className="p-4 rounded-2xl border bg-[#0b0f19] border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-xl">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  {isSubscribed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                      <CheckCircle2 className="size-3" />
                      <span>Accès VIP Actif</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase">
                      <Crown className="size-3" />
                      <span>Pass VIP Replays &amp; Prompts</span>
                    </span>
                  )}
                  {subscriptionInfo?.daysRemaining > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({subscriptionInfo.daysRemaining} jours restants)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  {isSubscribed 
                    ? "Tous les replays HD et la bibliothèque de prompts sont débloqués sur votre compte." 
                    : "10 000 FCFA / 3 mois ou 30 000 FCFA / an • Inclus gratuitement pour les inscrits aux Bootcamps."}
                </p>
              </div>

              {!isSubscribed && (
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary to-amber-500 text-slate-950 font-black text-xs hover:opacity-95 transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Crown className="size-3.5 fill-slate-950" />
                  <span>Prendre mon Pass VIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtres par Catégorie */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-slate-950"
                    : "bg-card border border-border text-muted-foreground hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grille des Replays */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
            {filteredReplays.map((replay) => (
              <div
                key={replay.id}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all text-left shadow-lg"
              >
                {/* Miniature & Déclencheur Vidéo */}
                <div 
                  onClick={() => {
                    if (isSubscribed) {
                      setActiveVideoModal(replay)
                    } else {
                      setShowSubscriptionModal(true)
                    }
                  }}
                  className="relative aspect-video bg-black/80 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={`https://img.youtube.com/vi/${replay.youtubeId}/hqdefault.jpg`}
                    alt={replay.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => { e.currentTarget.src = "/Logo avatar.png" }}
                  />
                  
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    {isSubscribed ? (
                      <div className="size-12 rounded-full bg-primary/90 text-slate-950 flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="size-5 fill-slate-950" />
                      </div>
                    ) : (
                      <div className="size-12 rounded-full bg-slate-900/90 border border-amber-500/50 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Lock className="size-5 text-amber-400" />
                      </div>
                    )}
                  </div>
                  
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                    {replay.duration}
                  </span>

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-primary text-slate-950 text-[10px] font-extrabold uppercase">
                    {replay.category}
                  </span>

                  {!isSubscribed && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                      <Lock className="size-2.5" />
                      <span>Pass VIP Requis</span>
                    </span>
                  )}
                </div>

                {/* Contenu de la Carte */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-2">
                      {replay.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {replay.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-slate-300">{replay.instructor}</span>
                    <span>{replay.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (isSubscribed) {
                        setActiveVideoModal(replay)
                      } else {
                        setShowSubscriptionModal(true)
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      isSubscribed
                        ? "border-border bg-[#090d16] hover:bg-primary hover:text-slate-950 hover:border-primary text-white"
                        : "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300"
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <Play className="size-3.5 fill-current" />
                        <span>Visionner le Replay HD</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5" />
                        <span>Débloquer avec le Pass VIP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* 5. Modal Lecteur Vidéo HD */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4">
            
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white truncate max-w-[80%]">
                <Play className="size-4 text-primary fill-primary" />
                <span className="truncate">{activeVideoModal.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>

            <div className="p-5 pt-1 text-left space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{activeVideoModal.description}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-border">
                <span>Formateur : <strong className="text-white">{activeVideoModal.instructor}</strong></span>
                <span>Date : {activeVideoModal.date}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal d'Abonnement VIP */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={currentUser}
        sourceContext="masterclass_replay"
        onSuccess={() => {
          setIsSubscribed(true)
        }}
      />

      {/* 6. Footer Global */}
      <CtaFooter />

      {/* Éléments Flottants */}
      <ScrollToTop />
      <WhatsAppFloat />

    </main>
  )
}
