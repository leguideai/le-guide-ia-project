"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { GraduationCap, UserCheck, Gift, ArrowRight, Calendar, Award } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function UdemySkillPathways() {
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
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          setDbCourses(data.courses)
        }
      } catch (e) {}
    }
    loadCourses()
  }, [])

  const pathways = dbCourses.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    desc: c.description || c.subtitle,
    price: c.price > 0 ? `${c.price.toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT",
    originalPrice: c.original_price || "",
    badge: c.badge || "FORMULE OFFICIELLE",
    format: c.format || "100% En Ligne",
    certificate: c.certificate || "",
    dates: c.dates || "",
    icon: c.price === 0 ? Gift : c.price > 100000 ? UserCheck : GraduationCap,
    href: `/bootcamp?course=${c.slug || c.id}`,
    image: c.thumbnail || c.poster || "/images/bootcamp_pro_thumb.jpg",
    isFree: c.price === 0,
    isVIP: c.price > 100000,
    accentColor: c.price === 0 ? "emerald" : c.price > 100000 ? "amber" : "blue",
  }))

  // Dynamic grid: 1 card = full, 2 cards = 2 cols, 3+ = 3 cols
  const gridClass =
    pathways.length === 1
      ? "grid grid-cols-1 max-w-2xl mx-auto"
      : pathways.length === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

  const getAccent = (color: string) => {
    if (color === "emerald") return { border: "border-emerald-500/50", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", btn: "bg-emerald-500 text-slate-950", glow: "shadow-emerald-500/10", price: "text-emerald-400" }
    if (color === "amber") return { border: "border-amber-500/50", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40", btn: "bg-amber-500 text-slate-950", glow: "shadow-amber-500/10", price: "text-amber-400" }
    return { border: "border-primary/50", badge: "bg-primary/20 text-primary border-primary/40", btn: "bg-primary text-primary-foreground", glow: "shadow-primary/10", price: "text-primary" }
  }

  return (
    <section className="py-14 bg-background border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              BOOTCAMP PRO IA
            </span>
            <p className="text-xs text-muted-foreground">Choisissez la formule adaptée à vos objectifs</p>
          </div>

          {/* <Link
            href="/bootcamp"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group shrink-0"
          >
            <span>Voir tous les bootcamps</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Link> */}
        </div>

        {/* Adaptive Grid */}
        <div className={gridClass}>
          {pathways.map((item, idx) => {
            const Icon = item.icon
            const accent = getAccent(item.accentColor)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl border ${accent.border} bg-card/60 overflow-hidden flex flex-col group backdrop-blur-xl shadow-2xl ${accent.glow} transition-all duration-300 hover:shadow-lg`}
              >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  {/* Badge top-left */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border backdrop-blur-md ${accent.badge}`}>
                    {item.badge}
                  </div>
                  {/* Price bottom-left over image */}
                  <div className="absolute bottom-3 left-3 flex items-baseline gap-1.5">
                    <span className={`text-xl font-black ${accent.price} drop-shadow-lg`}>{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">{item.originalPrice}</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Title */}
                  <div className="flex items-start gap-2.5">
                    <Icon className={`size-5 shrink-0 mt-0.5 ${accent.price}`} />
                    <div>
                      <h3 className="font-heading text-base font-bold text-foreground leading-snug">{item.title}</h3>
                      {item.desc && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
                      )}
                    </div>
                  </div>

                  {/* Meta badges */}
                  {/* <div className="flex flex-wrap gap-2">
                    {item.format && (
                      <span className="inline-flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        <Calendar className="size-3" />
                        {item.format}
                      </span>
                    )}
                    {item.certificate && (
                      <span className="inline-flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        <Award className="size-3" />
                        {item.certificate}
                      </span>
                    )}
                  </div> */}

                  {/* CTA */}
                  <div className="mt-auto pt-3 border-t border-border/40">
                    <Link
                      href={item.href}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95 ${accent.btn}`}
                    >
                      <span>Découvrir cette formule</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
