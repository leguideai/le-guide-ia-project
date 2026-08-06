"use client"

import { Quote, Star } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Testimonials() {
  const { t } = useLanguage()
  const items = t("testimonials.items") || []

  return (
    <section className="py-24 bg-card/20 relative overflow-hidden" id="temoignages">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            {t("testimonials.tag")}
          </span>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            {t("testimonials.title")}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            {t("testimonials.desc")}
          </p>
        </div>

        {/* Clean 3-column Grid (Unique items only - No Duplication) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="rounded-3xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between space-y-6 relative group"
            >
              <Quote className="size-10 text-primary/15 absolute top-6 right-6 group-hover:text-primary/30 transition-colors" />

              <div className="space-y-4 relative z-10">
                {/* 5 Stars rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-normal italic">
                  "{item.text}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-border/60 relative z-10">
                <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/30 text-sm shrink-0 uppercase">
                  {item.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-foreground">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {item.role} · <span className="text-primary">{item.country}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
