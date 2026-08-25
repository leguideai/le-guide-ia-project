"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  Sparkles, Clock, Video, Radio, 
  ArrowRight, ShieldCheck, Play 
} from "lucide-react"

export function MasterclassHomeSection() {
  // Calcul dynamique de la date du prochain dimanche à 19h00 GMT
  const targetDate = useMemo(() => {
    const now = new Date()
    const day = now.getUTCDay()
    const daysUntilSunday = (7 - day) % 7 === 0 && now.getUTCHours() < 20 ? 0 : ((7 - day) % 7 || 7)
    const nextSunday = new Date(now)
    nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
    nextSunday.setUTCHours(19, 0, 0, 0)
    return nextSunday.getTime()
  }, [])

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

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

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 border-y border-border bg-[#090d16]">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl bg-card border border-border p-6 sm:p-10 shadow-xl">
          
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                <Radio className="size-3.5" />
                <span>Rendez-vous Hebdomadaire en Direct</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight">
                Masterclass IA Gratuite <br />
                <span className="text-primary">
                  Chaque Dimanche à 19h00 (GMT)
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Rejoignez <strong>Alfred Dah</strong> chaque dimanche pour 1h30 de formation intensive et interactive. Cas pratiques concrets, prompts avancés, démonstrations d'outils et session de questions/réponses en direct.
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
                  <span>Réserver ma place pour ce Dimanche</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                <Link
                  href="/masterclass"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs border border-border active:scale-95 transition-all"
                >
                  <Play className="size-3.5 fill-foreground" />
                  <span>Voir les Replays Précédents</span>
                </Link>
              </div>

            </div>

            {/* Right Countdown Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-border p-6 text-center space-y-4 shadow-lg">
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock className="size-4 text-primary" />
                  <span>Début du direct dans :</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-card border border-border/60 rounded-xl p-2.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Jours</span>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-2.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Heures</span>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-2.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Min</span>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-2.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="block text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Sec</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/60 flex items-center justify-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Session interactive animée par <strong className="text-white">Alfred Dah</strong></span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
