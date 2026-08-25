"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UdemyHeader } from "@/components/udemy-header"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { 
  Play, Video, Calendar, Clock, CheckCircle2, 
  Sparkles, ArrowRight, Radio, ExternalLink, 
  LogIn, UserCheck, Search, Filter, ShieldCheck, X,
  Tv, Award, Zap
} from "lucide-react"

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
  
  const [upcomingSession, setUpcomingSession] = useState<any>({
    is_active: false,
    title: "Masterclass IA : Fondamentaux & Cas Pratiques en Direct",
    description: "Rejoignez Alfred Dah pour une session interactive de 1h30 en direct. Démonstrations d'outils, cas pratiques et questions-réponses.",
    instructor: "Alfred Dah",
    instructorRole: "Fondateur Le Guide IA & Expert en Intelligence Artificielle",
    scheduledAt: "",
    dateDisplay: "",
    thumbnailUrl: "",
    meetUrl: "https://meet.google.com/qvt-gkyh-yuv",
    youtubeLiveUrl: "https://www.youtube.com/@LeGuideIA",
    duration: "1h 30min",
    price: "100% Gratuit"
  })

  const [replays, setReplays] = useState<ReplayItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeVideoModal, setActiveVideoModal] = useState<ReplayItem | null>(null)

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  // 1. Initial Load & Auth check
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || null
        setCurrentUser(user)

        // Fetch dynamic session and replays
        const res = await fetch(`/api/masterclass${user?.email ? `?email=${encodeURIComponent(user.email)}` : ""}`)
        const data = await res.json()

        if (data.upcomingSession) {
          setUpcomingSession(data.upcomingSession)
        }
        if (data.isRegistered) {
          setIsRegistered(true)
        }
        if (data.replays && Array.isArray(data.replays)) {
          setReplays(data.replays)
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
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [upcomingSession?.scheduledAt, upcomingSession?.is_active])

  // 3. One-click frictionless registration for connected user
  async function handleOneClickRegister() {
    if (!currentUser?.email) return
    setRegistering(true)
    setFeedbackMsg(null)

    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          fullName: currentUser.user_metadata?.full_name || currentUser.email.split("@")[0],
          country: currentUser.user_metadata?.country || "CI"
        })
      })

      const data = await res.json()
      if (data.success) {
        setIsRegistered(true)
        setFeedbackMsg("🎉 Votre place est confirmée ! Vos liens d'accès vous ont été envoyés par email.")
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

  return (
    <main className="min-h-screen bg-[#090d16] text-white selection:bg-primary selection:text-slate-950 font-sans">
      
      {/* 1. Header Global du Site */}
      <UdemyHeader />

      {/* 2. SI MASTERCLASS EN DIRECT PROGRAMMÉE (is_active === true) */}
      {upcomingSession?.is_active ? (
        <section className="relative pt-10 pb-14 px-4 max-w-7xl mx-auto overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Colonne Gauche: Infos & Réservation 1-Clic */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold">
                <Radio className="size-3.5 text-rose-500 animate-pulse" />
                <span className="text-white">
                  {upcomingSession.dateDisplay ? `DIRECT : ${upcomingSession.dateDisplay.toUpperCase()}` : "PROCHAINE SESSION EN DIRECT"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-heading">
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
                  <p className="text-xs text-white font-semibold">Google Meet + YouTube Live</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card/80 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="size-4" />
                    <span className="font-bold text-xs">Tarif d'Accès</span>
                  </div>
                  <p className="text-xs text-white font-semibold">100% Gratuit</p>
                </div>
              </div>

              {/* Zone d'action: Réservation 1-Clic ou Liens directs */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                {authChecking ? (
                  <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
                    Vérification de votre compte...
                  </div>
                ) : isRegistered ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="size-5 shrink-0" />
                      <span>Votre place est confirmée pour ce direct !</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Un email de confirmation vous a été envoyé. Vous pouvez rejoindre la salle directement ci-dessous le jour J.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <a
                        href={upcomingSession.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 rounded-xl bg-primary text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <Video className="size-4" />
                        <span>Rejoindre la salle Google Meet</span>
                        <ExternalLink className="size-3.5" />
                      </a>

                      <a
                        href={upcomingSession.youtubeLiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 rounded-xl border border-border bg-card text-white font-bold text-xs text-center flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                      >
                        <Play className="size-4 text-rose-500 fill-rose-500" />
                        <span>Suivre sur YouTube</span>
                      </a>
                    </div>
                  </div>
                ) : currentUser ? (
                  /* Utilisateur connecté: 1-Clic sans formulaire */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserCheck className="size-4 text-primary" />
                        <span>Connecté en tant que <strong className="text-white">{currentUser.email}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={registering}
                      onClick={handleOneClickRegister}
                      className="w-full py-3.5 px-6 rounded-xl bg-primary text-slate-950 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                    >
                      {registering ? (
                        <span>Réservation en cours...</span>
                      ) : (
                        <>
                          <span>Réserver ma place en 1 clic</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                
                  </div>
                ) : (
                  /* Visiteur non connecté: boutons de connexion */
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white">
                      Connectez-vous pour réserver votre place en 1 clic :
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/login?redirect=/masterclass"
                        className="flex-1 py-3 px-4 rounded-xl bg-primary text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <LogIn className="size-4" />
                        <span>Se connecter au site</span>
                      </Link>

                      <Link
                        href="/register-account?redirect=/masterclass"
                        className="flex-1 py-3 px-4 rounded-xl border border-border bg-card text-white font-bold text-xs text-center flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                      >
                        <span>Créer un compte gratuit</span>
                      </Link>
                    </div>
                  </div>
                )}

                {feedbackMsg && (
                  <div className="p-3 rounded-lg bg-card border border-border text-xs text-white">
                    {feedbackMsg}
                  </div>
                )}
              </div>

            </div>

            {/* Colonne Droite: Affiche & Compte à Rebours */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl space-y-6 text-center">
                
                {/* Miniature / Affiche Officielle Uploader */}
                {upcomingSession.thumbnailUrl && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black/60 shadow-lg">
                    <img
                      src={upcomingSession.thumbnailUrl}
                      alt={upcomingSession.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
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
                  : "Rejoignez le Bootcamp PRO 2 ou explorez nos formations vidéo complètes."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/bootcamp"
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Voir le Bootcamp
              </Link>
              <Link
                href="/formations"
                className="px-4 py-2 rounded-xl border border-border bg-[#090d16] text-white font-bold text-xs hover:bg-white/5 transition-colors"
              >
                Formations
              </Link>
            </div>
          </div>

        </section>
      )}

      {/* 4. Vidéothèque des Replays (YouTube) - Uniquement si des replays existent */}
      {replays.length > 0 && (
        <section id="replays-section" className="pt-8 pb-20 max-w-7xl mx-auto px-4 border-t border-border">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-primary font-bold">
                <Play className="size-3 fill-primary" />
                <span>REPLAYS VIDÉOS MASTERCLASSES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                Replays des Masterclasses Passées ({replays.length})
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Visionnez gratuitement toutes les masterclasses passées.
              </p>
            </div>

            {/* Barre de Recherche */}
            <div className="relative w-full sm:w-72">
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher une masterclass..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-primary placeholder:text-muted-foreground"
              />
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
                  onClick={() => setActiveVideoModal(replay)}
                  className="relative aspect-video bg-black/80 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={`https://img.youtube.com/vi/${replay.youtubeId}/hqdefault.jpg`}
                    alt={replay.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => { e.currentTarget.src = "/Logo avatar.png" }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="size-12 rounded-full bg-primary/90 text-slate-950 flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="size-5 fill-slate-950" />
                    </div>
                  </div>
                  
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                    {replay.duration}
                  </span>

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-primary text-slate-950 text-[10px] font-extrabold uppercase">
                    {replay.category}
                  </span>
                </div>

                {/* Contenu de la Carte */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {replay.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
                      {replay.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{replay.instructor}</span>
                      <span>{replay.date}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(replay)}
                      className="w-full py-2.5 px-4 rounded-xl border border-border bg-[#090d16] hover:bg-primary hover:text-slate-950 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Regarder le Replay</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReplays.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-xs">
              Aucun replay ne correspond à votre recherche.
            </div>
          )}

        </section>
      )}

      {/* Lecteur Vidéo Modal YouTube */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
            
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white truncate max-w-[80%]">
                <Radio className="size-4 text-rose-500" />
                <span className="truncate">{activeVideoModal.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg border border-border bg-[#090d16] text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Iframe YouTube */}
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

            <div className="p-4 pt-0 text-left space-y-1">
              <p className="text-xs text-muted-foreground">{activeVideoModal.description}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                <span>Formateur : {activeVideoModal.instructor}</span>
                <span>Date : {activeVideoModal.date}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. Pied de Page Global du Site */}
      <CtaFooter />

      {/* Éléments Flottants */}
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
