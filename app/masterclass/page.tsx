"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { UdemyHeader } from "@/components/udemy-header"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"
import { supabase } from "@/lib/supabase"
import { 
  Sparkles, Calendar, Clock, Video, CheckCircle2, 
  ArrowRight, Play, UserCheck, ExternalLink, ShieldCheck, 
  Award, Radio, LogIn, X
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
  views: string
}

export default function MasterclassPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [selectedReplay, setSelectedReplay] = useState<ReplayItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("Tous")
  const [notice, setNotice] = useState<string | null>(null)

  // Masterclass session details
  const [sessionData, setSessionData] = useState<{
    title: string
    description: string
    instructor: string
    instructorRole: string
    scheduledAt: string
    meetUrl: string
    youtubeLiveUrl: string
    duration: string
    price: string
  }>({
    title: "Masterclass IA Hebdomadaire : Fondamentaux & Cas Pratiques en Direct",
    description: "Rejoignez Alfred Dah pour une session intensive et interactive de 1h30 en direct. Démonstrations en direct, astuces de pro et session questions & réponses pour transformer votre productivité avec l'IA.",
    instructor: "Alfred Dah",
    instructorRole: "Fondateur Le Guide IA & Expert en Intelligence Artificielle",
    scheduledAt: "",
    meetUrl: "https://meet.google.com/qvt-gkyh-yuv",
    youtubeLiveUrl: "https://www.youtube.com/@LeGuideIA",
    duration: "1h 30min",
    price: "100% Gratuit (Accès Libre)"
  })

  const [replays, setReplays] = useState<ReplayItem[]>([])

  // Compte à rebours temps réel jusqu'au prochain dimanche 19h00 GMT
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // 1. Calcul du prochain dimanche 19:00 GMT
  const targetDate = useMemo(() => {
    if (sessionData.scheduledAt) {
      const d = new Date(sessionData.scheduledAt).getTime()
      if (!isNaN(d)) return d
    }
    const now = new Date()
    const day = now.getUTCDay() // 0 = Sunday
    const daysUntilSunday = (7 - day) % 7 === 0 && now.getUTCHours() < 20 ? 0 : ((7 - day) % 7 || 7)
    const nextSunday = new Date(now)
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
    nextSunday.setUTCHours(19, 0, 0, 0)
    return nextSunday.getTime()
  }, [sessionData.scheduledAt])

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      const diff = Math.max(0, targetDate - now)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  // 2. Récupérer les données de la Masterclass et l'état utilisateur
  useEffect(() => {
    async function loadMasterclass() {
      try {
        const { data: authData } = await supabase.auth.getUser()
        const currentUser = authData?.user || null
        setUser(currentUser)

        let userEmail = currentUser?.email || ""

        if (currentUser) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle()
          setUserProfile(prof || null)
        }

        const res = await fetch(`/api/masterclass${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`)
        const data = await res.json()

        if (data && data.success) {
          if (data.upcomingSession) {
            setSessionData(prev => ({ ...prev, ...data.upcomingSession }))
          }
          if (data.replays && data.replays.length > 0) {
            setReplays(data.replays)
          }
          if (data.isRegistered) {
            setIsRegistered(true)
          }
        }
      } catch (err) {
        console.warn("Erreur chargement masterclass:", err)
      } finally {
        setLoadingAuth(false)
      }
    }
    loadMasterclass()
  }, [])

  // 3. Inscription automatique en 1 clic pour l'utilisateur connecté
  const handleOneClickRegister = async () => {
    if (!user) return
    setRegistering(true)
    setNotice(null)
    try {
      const email = user.email || ""
      const fullName = userProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Membre Le Guide IA"
      const whatsapp = userProfile?.whatsapp || user.user_metadata?.whatsapp || ""
      const country = userProfile?.country || user.user_metadata?.country || "CI"

      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, whatsapp, country })
      })

      const data = await res.json()
      if (data.success) {
        setIsRegistered(true)
        if (data.meetUrl) {
          setSessionData(prev => ({ ...prev, meetUrl: data.meetUrl, youtubeLiveUrl: data.youtubeLiveUrl || prev.youtubeLiveUrl }))
        }
        setNotice("Inscription confirmée ! Votre place pour la Masterclass de ce dimanche est réservée.")
      } else {
        alert(data.error || "Erreur lors de la réservation.")
      }
    } catch (err: any) {
      alert("Erreur de connexion : " + err.message)
    } finally {
      setRegistering(false)
    }
  }

  // 4. Générateur de lien Google Calendar
  const googleCalendarUrl = useMemo(() => {
    const title = encodeURIComponent(sessionData.title)
    const details = encodeURIComponent(`${sessionData.description}\n\nLien de connexion : ${sessionData.meetUrl}`)
    const startIso = new Date(targetDate).toISOString().replace(/-|:|\.\d\d\d/g, "")
    const endIso = new Date(targetDate + 90 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=Google%20Meet`
  }, [sessionData, targetDate])

  const filteredReplays = useMemo(() => {
    if (activeCategory === "Tous") return replays
    return replays.filter(r => r.category.toLowerCase().includes(activeCategory.toLowerCase()))
  }, [replays, activeCategory])

  const categories = ["Tous", "Prompting", "Automatisation", "Création de Contenu"]

  return (
    <main className="min-h-screen bg-[#090d16] text-foreground relative overflow-x-hidden flex flex-col">
      <GridBackground />
      <UdemyHeader />

      {/* Hero Section Masterclass */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            <Radio className="size-3.5" />
            <span>En direct chaque dimanche à 19h00 GMT</span>
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Chaque dimanche à 19h00, participez à une session intensive 100% gratuite avec <strong>Alfred Dah</strong>.
            Démonstrations d'outils, cas pratiques et questions-réponses pour débloquer votre potentiel IA.
          </p>

          {/* Countdown Card */}
          <div className="pt-2">
            <div className="inline-flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xl">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>Prochaine session en direct dans :</span>
              </span>
              
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                <div className="bg-slate-950 rounded-xl px-3 sm:px-5 py-2.5 min-w-[65px] sm:min-w-[80px] border border-border/50">
                  <span className="font-mono text-xl sm:text-3xl font-black text-white">{timeLeft.days}</span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase mt-0.5">Jours</span>
                </div>
                <div className="bg-slate-950 rounded-xl px-3 sm:px-5 py-2.5 min-w-[65px] sm:min-w-[80px] border border-border/50">
                  <span className="font-mono text-xl sm:text-3xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase mt-0.5">Heures</span>
                </div>
                <div className="bg-slate-950 rounded-xl px-3 sm:px-5 py-2.5 min-w-[65px] sm:min-w-[80px] border border-border/50">
                  <span className="font-mono text-xl sm:text-3xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase mt-0.5">Min</span>
                </div>
                <div className="bg-slate-950 rounded-xl px-3 sm:px-5 py-2.5 min-w-[65px] sm:min-w-[80px] border border-border/50">
                  <span className="font-mono text-xl sm:text-3xl font-black text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase mt-0.5">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Box : Non Connecté vs Connecté vs Déjà Inscrit */}
          <div className="max-w-xl mx-auto pt-4">
            {notice && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{notice}</span>
              </div>
            )}

            {loadingAuth ? (
              <div className="p-6 rounded-2xl bg-card border border-border animate-pulse text-xs text-muted-foreground">
                Vérification de votre compte...
              </div>
            ) : !user ? (
              /* CAS 1 : NON CONNECTÉ -> Boutons Connexion / Inscription */
              <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-xl space-y-4 text-left sm:text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-white">Participez gratuitement ce dimanche</h3>
                  <p className="text-xs text-muted-foreground">
                    Connectez-vous ou créez votre compte pour réserver votre place en direct.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/login?redirect=/masterclass"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <LogIn className="size-4" />
                    <span>Se connecter pour participer</span>
                  </Link>

                </div>
              </div>
            ) : isRegistered ? (
              /* CAS 2 : CONNECTÉ ET DÉJÀ INSCRIT -> Liens d'accès & Ajout Calendrier */
              <div className="p-6 sm:p-7 rounded-2xl bg-card border border-emerald-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Votre place est confirmée pour ce dimanche !</h3>
                    <p className="text-xs text-muted-foreground">
                      Compte : <strong>{userProfile?.full_name || user.email}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                  <a
                    href={sessionData.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Video className="size-4" />
                    <span>Lien du direct</span>
                    <ExternalLink className="size-3 opacity-70" />
                  </a>

                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border transition-all"
                  >
                    <Calendar className="size-4 text-primary" />
                    <span>Ajouter à mon Agenda</span>
                  </a>
                </div>
              </div>
            ) : (
              /* CAS 3 : CONNECTÉ MAIS PAS ENCORE INSCRIT -> 1 Clic automatique */
              <div className="p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <UserCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Réservez votre accès en 1 clic</h3>
                    <p className="text-xs text-muted-foreground">
                      Connecté en tant que <strong>{userProfile?.full_name || user.email}</strong>. Aucune saisie requise !
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOneClickRegister}
                  disabled={registering}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {registering ? (
                    <span>Réservation en cours...</span>
                  ) : (
                    <>
                      <Sparkles className="size-4 text-primary-foreground" />
                      <span>Réserver ma place gratuite pour ce Dimanche</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Section Vidéothèque des Replays YouTube */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-border bg-slate-950/60">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Video className="size-3.5" />
                <span>Replays Masterclasses</span>
              </span>
           
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                Accédez gratuitement à l'ensemble des replays sur YouTube.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground font-black"
                      : "bg-card hover:bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReplays.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReplay(rep)}
                className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-primary/60 overflow-hidden shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Video Thumbnail Wrapper */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${rep.youtubeId}/hqdefault.jpg`}
                    alt={rep.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e: any) => {
                      e.currentTarget.src = "/Logo avatar.png"
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Play className="size-4 fill-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-white text-[10px] font-mono font-bold">
                    {rep.duration}
                  </span>
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase">
                    {rep.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-2">
                      {rep.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {rep.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="font-medium">{rep.instructor}</span>
                    <span>{rep.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Passerelle d'Upsell vers les Bootcamps */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-border bg-[#090d16]">
        <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border p-6 sm:p-10 text-center space-y-5 shadow-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
            <Award className="size-3.5" />
            <span>Formations Immersives Certifiantes</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Prêt à Passer au Niveau Supérieur ?
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Les Masterclasses gratuites sont idéales pour débuter. Pour transformer radicalement votre carrière ou votre entreprise, rejoignez nos Bootcamps intensifs avec mentorat personnalisé et certification officielle.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/bootcamp"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all"
            >
              <span>Découvrir les 2 Formules de Bootcamps</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Player Modal pour YouTube */}
      {selectedReplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase shrink-0">
                  {selectedReplay.category}
                </span>
                <h3 className="font-bold text-sm text-white truncate">
                  {selectedReplay.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReplay(null)}
                className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* YouTube Embed Frame */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedReplay.youtubeId}?autoplay=1`}
                title={selectedReplay.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>{selectedReplay.description}</p>
              <a
                href={selectedReplay.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0"
              >
                <span>Ouvrir sur YouTube</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
