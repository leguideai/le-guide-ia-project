"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { GraduationCap, UserCheck, Gift, ArrowRight } from "lucide-react"
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
    title: c.title,
    desc: c.description,
    price: c.price > 0 ? `${c.price.toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT",
    badge: c.badge || "FORMULE OFFICIELLE",
    icon: c.price === 0 ? Gift : c.price > 100000 ? UserCheck : GraduationCap,
    href: `/bootcamp?course=${c.slug || c.id}`,
    image: c.thumbnail || "/images/bootcamp_pro_thumb.jpg",
    borderColor: c.price === 0 ? "border-emerald-500/40" : c.price > 100000 ? "border-amber-500/40" : "border-primary/40",
    btnColor: c.price === 0 ? "bg-secondary text-foreground border border-border" : c.price > 100000 ? "bg-amber-500 text-slate-950" : "bg-primary text-primary-foreground"
  }))

  return (
    <section className="py-14 bg-background border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              BOOTCAMP PRO IA
            </span>
          </div>

          <Link
            href="/bootcamp"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group shrink-0"
          >
            <span>Voir tous les bootcamps</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Pathway Cards Grid (Scrollable on Mobile, Grid on Desktop) */}
        <div className="flex overflow-x-auto md:overflow-visible snap-x no-scrollbar pt-3 pb-4 gap-4 md:grid md:grid-cols-3 md:pb-0">
          {pathways.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6 }}
                className={`relative z-10 hover:z-20 rounded-2xl border ${item.borderColor} bg-card/60 overflow-hidden flex flex-col justify-between hover:border-primary transition-all duration-300 shadow-xl group backdrop-blur-xl p-5 space-y-4 shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center`}
              >
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={item.image || "/images/bootcamp_pro_thumb.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-border/60">
                    {item.badge}
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <h3 className="font-heading text-base font-bold text-foreground">{item.title}</h3>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="font-heading text-base font-black text-primary">{item.price}</span>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md group-hover:scale-105 ${item.btnColor}`}
                  >
                    <span>Explorer</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
