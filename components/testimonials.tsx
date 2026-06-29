"use client"

import { Quote } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Testimonials() {
  const { t } = useLanguage()
  const items = t("testimonials.items") || []
  
  // Double the list for infinite seamless scrolling
  const duplicatedItems = [...items, ...items]

  return (
    <section className="py-24 bg-card/10 relative overflow-hidden" id="temoignages">
      {/* Glow effect backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Fade masks on sides */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-carousel {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .animate-scroll-carousel:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("testimonials.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-pretty">
            {t("testimonials.desc")}
          </p>
        </div>
      </div>

      {/* Ticker Carousel Track */}
      <div className="relative w-full overflow-hidden py-4 cursor-grab active:cursor-grabbing">
        <div className="animate-scroll-carousel">
          {duplicatedItems.map((item: any, i: number) => (
            <div
              key={i}
              className="w-[320px] sm:w-[380px] shrink-0 relative rounded-2xl border border-border bg-card/45 p-6 backdrop-blur-sm hover:border-primary/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <Quote className="size-8 text-primary/10 absolute top-4 right-4" />
                <p className="text-sm italic text-foreground/90 leading-relaxed mb-6">
                  "{item.text}"
                </p>
              </div>
              
              <div className="flex items-center gap-3 border-t border-border/60 pt-4">
                <img
                  src={item.image || "/placeholder-user.jpg"}
                  alt={item.name}
                  className="size-11 rounded-full object-cover border border-primary/25 bg-background shrink-0"
                />
                <div>
                  <div className="text-sm font-bold text-foreground">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {item.role} · {item.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
