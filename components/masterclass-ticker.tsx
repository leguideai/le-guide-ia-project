"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function MasterclassTicker() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/masterclass")
        const data = await res.json()
        if (data?.upcomingSession?.is_active) {
          setSession(data.upcomingSession)
        }
      } catch (e) {
        console.warn("Could not load masterclass ticker:", e)
      }
    }
    load()
  }, [])

  if (!session?.is_active) return null

  return (
    <div className="w-full border-b border-border/80 bg-[#090d16]/90 backdrop-blur-sm z-30 relative">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 overflow-hidden">
        
        {/* Badge Fixe Gauche */}
        <Link 
          href="/masterclass"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors shadow-xs"
        >
          <span className="size-1.5 rounded-full bg-white animate-ping" />
          <span>DIRECT</span>
        </Link>

        {/* Texte Défilant Continu (Marquee) */}
        <Link href="/masterclass" className="flex-1 overflow-hidden relative group">
          <div className="flex items-center gap-10 whitespace-nowrap animate-ticker text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
            <span className="inline-flex items-center gap-2">
              <strong className="text-white font-heading">{session.title}</strong>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-bold">{session.dateDisplay || "En Direct Prochainement"}</span>
              <span className="text-muted-foreground">•</span>
              <span>Animé par {session.instructor || "Alfred Dah"}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-emerald-400 font-bold">100% Gratuit (Accès Libre)</span>
            </span>

            <span className="inline-flex items-center gap-2" aria-hidden="true">
              <strong className="text-white font-heading">{session.title}</strong>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-bold">{session.dateDisplay || "En Direct Prochainement"}</span>
              <span className="text-muted-foreground">•</span>
              <span>Animé par {session.instructor || "Alfred Dah"}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-emerald-400 font-bold">100% Gratuit (Accès Libre)</span>
            </span>
          </div>
        </Link>

        {/* Lien Fixe Droite */}
        <Link
          href="/masterclass"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Réserver ma place</span>
          <ChevronRight className="size-4" />
        </Link>

      </div>
    </div>
  )
}
