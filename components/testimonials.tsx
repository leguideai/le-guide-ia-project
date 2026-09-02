"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "motion/react"
import { Quote, Star, ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from "lucide-react"

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/testimonials")
        const data = await res.json()
        if (data?.testimonials && Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials)
        }
      } catch (e) {
        console.warn("Failed to load testimonials:", e)
      }
    }
    loadTestimonials()
  }, [])

  // Scroll to specific index or direction
  const scrollTo = useCallback((direction: "prev" | "next") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector("div[data-card]")?.clientWidth || 360
    const scrollAmount = cardWidth + 20 // card width + gap

    if (direction === "next") {
      const maxScroll = container.scrollWidth - container.clientWidth
      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    } else {
      if (container.scrollLeft <= 20) {
        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" })
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      }
    }
  }, [])

  // Update current visible index on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector("div[data-card]")?.clientWidth || 360
    const newIdx = Math.round(container.scrollLeft / (cardWidth + 20))
    setCurrentIndex(Math.min(newIdx, testimonials.length - 1))
  }

  // Auto-scroll carousel every 5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return
    const interval = setInterval(() => {
      scrollTo("next")
    }, 4500)
    return () => clearInterval(interval)
  }, [isPaused, testimonials.length, scrollTo])

  if (!testimonials || testimonials.length === 0) return null

  return (
    <section 
      className="py-24 bg-slate-950/80 relative overflow-hidden border-t border-border/40" 
      id="temoignages"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 size-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10 relative z-10">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/40 pb-6">
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5" />
              RECOMMANDATIONS & AVIS APRENANTS
            </span>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Retours d'expérience concrets de cadres, consultants et entrepreneurs formés et accompagnés.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="hidden sm:flex items-center text-xs font-bold text-muted-foreground mr-2">
              <span className="text-primary font-extrabold">{currentIndex + 1}</span>
              <span className="mx-1">/</span>
              <span>{testimonials.length}</span>
            </div>

            <button
              onClick={() => scrollTo("prev")}
              className="size-11 rounded-2xl bg-card border border-border/80 hover:border-primary/60 text-foreground hover:text-primary flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              onClick={() => scrollTo("next")}
              className="size-11 rounded-2xl bg-primary text-slate-950 font-bold flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Carousel Row (Single Line) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pt-2 pb-6 px-1 cursor-grab active:cursor-grabbing"
        >
          {testimonials.map((item, i) => {
            const avatar = item.avatar_url || item.image
            const initials = item.name ? item.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "IA"

            return (
              <motion.div
                key={item.id || i}
                data-card
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                whileHover={{ y: -6 }}
                className="w-[300px] sm:w-[380px] md:w-[420px] shrink-0 snap-start rounded-3xl border border-border/80 bg-card/70 p-6 md:p-7 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-primary/50 transition-all space-y-6 relative overflow-hidden group select-none"
              >
                {/* Decorative Quote mark */}
                <Quote className="size-12 text-primary/10 absolute top-5 right-5 group-hover:text-primary/20 transition-colors pointer-events-none" />

                {/* Stars & Body Quote */}
                <div className="space-y-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="size-3" /> Recommandation
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-foreground/90 leading-relaxed font-normal italic line-clamp-[11]">
                    "{item.text}"
                  </p>
                </div>

                {/* Author Info (Avatar + Name + Profession) — NO Country */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-border/60 relative z-10">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={item.name}
                      className="size-12 rounded-full object-cover border-2 border-primary/40 shadow-md shrink-0 bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-primary/20 text-primary font-extrabold flex items-center justify-center border-2 border-primary/40 text-xs shrink-0 uppercase">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5" title={item.role}>
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Carousel Indicators / Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {testimonials.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => {
                if (!scrollContainerRef.current) return
                const container = scrollContainerRef.current
                const cardWidth = container.querySelector("div[data-card]")?.clientWidth || 360
                container.scrollTo({ left: dotIdx * (cardWidth + 20), behavior: "smooth" })
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === dotIdx 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Aller au témoignage ${dotIdx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}


