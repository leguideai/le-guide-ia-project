"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Clock, Award, ArrowRight, Zap, CheckCircle2, ShieldCheck, User, Users, PlayCircle, Sparkles, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CourseCatalogProps {
  activeCategory: string
}

export function CourseCatalog({ activeCategory }: CourseCatalogProps) {
  const [dbCourses, setDbCourses] = useState<any[]>([])

  useEffect(() => {
    async function loadCourses() {
      let { data, error } = await supabase.from("courses").select("*").order("sequence_order", { ascending: true }).order("created_at", { ascending: true })
      if (error || !data || data.length === 0) {
        const res = await supabase.from("courses").select("*").order("created_at", { ascending: true })
        data = res.data
      }
      if (data && data.length > 0) setDbCourses(data)
    }
    loadCourses()
  }, [])

  const courses = dbCourses.map(c => ({
    id: c.slug || c.id,
    category: c.price === 0 ? "free" : c.price > 100000 ? "business" : "pro",
    title: c.title,
    subtitle: c.description,
    instructor: c.instructor || "Alfred Dah",
    instructorRole: "Auditeur CISA & Expert IA",
    rating: "4.9",
    reviewsCount: "Avis apprenants certifiés",
    studentsCount: "Apprenants inscrits",
    badge: c.badge,
    badgeColor: c.price === 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : c.price > 100000 ? "bg-primary/20 text-primary border-primary/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30",
    hours: c.price === 0 ? "Accès Libre" : "Session Intensive Live",
    schedule: c.dates || "19h00 GMT",
    oldPriceFcfa: c.price > 0 ? `${(c.price * 1.5).toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "",
    priceFcfa: c.price > 0 ? `${c.price.toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT",
    priceEur: "",
    isFree: c.price === 0,
    image: c.thumbnail || c.poster || "/images/bootcamp_pro_thumb.jpg",
    href: `/bootcamp?course=${c.slug || c.id}`,
    highlights: Array.isArray(c.features) ? c.features : []
  }))

  const filteredCourses = activeCategory === "all"
    ? courses
    : courses.filter(c => c.category === activeCategory)

  return (
    <section className="py-20 bg-background relative" id="catalogue-formations">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-primary" />
              Catalogue Officiel — Formations & Bootcamps LE GUIDE IA
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Développez des compétences IA concrètes pour votre carrière
            </h2>
            <p className="text-xs md:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Inspiration plateforme éducative avec le périmètre exact de Le Guide IA : cours d'initiation gratuit, Bootcamps intensifs de 15h en direct et ressources métiers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/register-account"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-card/60 border border-border px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>Inscription Gratuite</span>
            </Link>
            <Link
              href="/checkout/bootcamp-ia-pro"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 px-4 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <span>Rejoindre le Bootcamp (99k FCFA)</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Udemy Course Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-border/80 bg-card/50 overflow-hidden flex flex-col justify-between hover:border-primary/60 transition-all duration-300 shadow-2xl hover:shadow-primary/10 group backdrop-blur-xl relative"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                <img
                  src={course.image || "/images/bootcamp_pro_thumb.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-md ${course.badgeColor}`}>
                    {course.badge}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-border/60 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                  <Clock className="size-3 text-primary" />
                  <span>{course.hours}</span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                
                <div className="space-y-3">
                  {/* Instructor Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/30">
                        AD
                      </div>
                      <div>
                        <span className="font-bold text-foreground block leading-tight">{course.instructor}</span>
                        <span className="text-[10px] text-muted-foreground">{course.instructorRole}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {course.subtitle}
                  </p>

                  {/* Rating & Stats Bar */}
                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1 text-amber-400 font-extrabold">
                      <span>{course.rating}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-muted-foreground text-[11px]">({course.reviewsCount})</span>
                    <span className="text-border">•</span>
                    <span className="text-[11px] font-semibold text-primary">{course.studentsCount}</span>
                  </div>

                  {/* Highlights Checklist */}
                  <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                    {course.highlights.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="pt-5 border-t border-border/80 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground line-through">
                      {course.oldPriceFcfa}
                    </div>
                    <div className="font-heading text-xl font-black text-primary">
                      {course.priceFcfa}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {course.priceEur}
                    </div>
                  </div>

                  <Link
                    href={course.href}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-lg cursor-pointer ${
                      course.isFree
                        ? "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                        : "bg-primary hover:opacity-90 text-primary-foreground shadow-primary/20"
                    }`}
                  >
                    <span>{course.isFree ? "Rejoindre (0 FCFA)" : "S'inscrire"}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
