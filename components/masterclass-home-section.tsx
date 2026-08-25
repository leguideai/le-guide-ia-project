"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Sparkles, Clock, Video, Radio, 
  ArrowRight, ShieldCheck, Play 
} from "lucide-react"

export function MasterclassHomeSection() {
  const [sessionData, setSessionData] = useState<any>({
    is_active: true,
    title: "Masterclass IA Interactive en Direct",
    description: "Rejoignez Alfred Dah pour 1h30 de formation intensive et interactive. Cas pratiques concrets, démonstrations d'outils et Q&A en direct.",
    scheduledAt: "",
    dateDisplay: "Chaque Dimanche à 19h00 (GMT)"
  })

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/masterclass")
        const data = await res.json()
        if (data.upcomingSession) {
          setSessionData(data.upcomingSession)
        }
      } catch (e) {
        console.warn("Could not fetch masterclass for homepage:", e)
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (!sessionData?.is_active || !sessionData?.scheduledAt) {
      setTimeLeft(null)
      return
    }

    const updateCountdown = () => {
      const targetTime = new Date(sessionData.scheduledAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, targetTime - now)

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [sessionData?.scheduledAt, sessionData?.is_active])

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 border-y border-border bg-[#090d16]">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl bg-card border border-border p-6 sm:p-10 shadow-xl">
          
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                {sessionData.is_active ? (
                  <>
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                    <Radio className="size-3.5" />
                    <span>Session en Direct & Replays</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Vidéothèque Masterclasses & Replays</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight">
                {sessionData.is_active ? (
                  <>
                    Masterclass IA Gratuite <br />
                    <span className="text-primary">
                      {sessionData.dateDisplay || "En Direct Prochainement"}
                    </span>
                  </>
                ) : (
                  <>
                    Masterclasses & Replays IA <br />
                    <span className="text-primary">Accès 100% Libre & Gratuit</span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {sessionData.description || "Rejoignez Alfred Dah pour 1h30 de formation intensive et interactive. Cas pratiques concrets, prompts avancés, démonstrations d'outils et session de questions/réponses en direct."}
              </p>

              {/* Badges Reassurance */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>100% Gratuit</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Video className="size-4 text-primary" />
                  <span>Google Meet & YouTube Live</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Play className="size-4 text-primary" />
                  <span>Replays HD Disponibles</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/masterclass"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md active:scale-95 transition-all"
                >
                  <Sparkles className="size-4 text-primary-foreground" />
                  <span>{sessionData.is_active ? "Réserver ma place gratuite" : "Découvrir les Masterclasses"}</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                <Link
                  href="/masterclass#replays-section"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border active:scale-95 transition-all"
                >
                  <Play className="size-3.5 text-primary" />
                  <span>Vidéothèque Replays</span>
                </Link>
              </div>

            </div>

            {/* Right Countdown Box */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-[#090d16] border border-border p-6 sm:p-7 text-center space-y-4 shadow-inner">
                
                {/* Affiche Officielle Uploader */}
                {sessionData.thumbnailUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black/60 shadow-md">
                    <img
                      src={sessionData.thumbnailUrl}
                      alt={sessionData.title}
                      className="w-full h-full object-cover"
                    />
                    {sessionData.is_active && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                        <span className="size-1.5 rounded-full bg-white animate-ping" />
                        Session en Direct
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    {sessionData.is_active ? "Compte à Rebours du Direct" : "Accès Immédiat"}
                  </span>
                  <p className="text-xs font-semibold text-slate-300">
                    {sessionData.is_active ? (sessionData.dateDisplay || "Prochaine Session") : "Replays Disponibles 24h/24"}
                  </p>
                </div>

                {sessionData.is_active && timeLeft ? (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-card border border-border p-2.5">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                        {String(timeLeft.days).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Jours</span>
                    </div>

                    <div className="rounded-lg bg-card border border-border p-2.5">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                        {String(timeLeft.hours).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Heures</span>
                    </div>

                    <div className="rounded-lg bg-card border border-border p-2.5">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                        {String(timeLeft.minutes).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Min</span>
                    </div>

                    <div className="rounded-lg bg-card border border-border p-2.5">
                      <span className="text-xl sm:text-2xl font-black text-primary font-mono block">
                        {String(timeLeft.seconds).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Sec</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <Play className="size-8 text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Regardez les sessions passées sur notre vidéothèque en ligne.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Animé par <strong>Alfred Dah</strong></span>
                  <span className="text-emerald-400 font-bold">100% Gratuit</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
