"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Clock, Award, ArrowRight, Zap, CheckCircle2, ShieldCheck, User, Users, PlayCircle, Sparkles, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic } from "@/lib/courses-visibility"
import { useUserEnrollments } from "@/lib/user-enrollments"

interface CourseCatalogProps {
  activeCategory: string
}

export function CourseCatalog({ activeCategory }: CourseCatalogProps) {
  const { isEnrolledInCourse, isPendingInCourse } = useUserEnrollments()
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

  const courses = dbCourses.filter(isCourseOpenForPublic).map(c => ({
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
    badgeColor: c.price >= 140000 ? "bg-[#D4AF37]/20 text-[#ECC86B] border border-[#D4AF37]/30" : "bg-blue-600/20 text-blue-300 border border-blue-500/30",
    hours: c.price === 0 ? "Accès Libre" : "Session Intensive Live",
    schedule: c.dates || "19h00 GMT",
    oldPriceFcfa: c.price > 0 ? `${(c.price * 1.5).toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "",
    priceFcfa: c.price > 0 ? `${c.price.toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT",
    priceEur: "",
    isFree: c.price === 0,
    isEnrolled: isEnrolledInCourse(c),
    isPending: isPendingInCourse(c),
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
          <div className="space-y-4 max-w-2xl text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5" />
              Catalogue Officiel des Bootcamps
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Trouvez le Bootcamp Adapté à vos Ambitions
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Formations immersives et certifiantes en direct avec Alfred Dah pour acquérir des compétences concrètes en Intelligence Artificielle générative.
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`rounded-3xl border bg-card/60 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all group hover:shadow-2xl hover:shadow-primary/5 ${
                course.isEnrolled ? "border-emerald-500/50 shadow-emerald-500/5" : "border-border/80"
              }`}
            >
              <div className="space-y-6">
                
                {/* Poster / Thumbnail Preview */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-border/60">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg backdrop-blur-md ${course.badgeColor}`}>
                      {course.badge || "SESSION OFFICIELLE"}
                    </span>
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Inscrit
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Metadata */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3.5 text-primary" />
                    <span>{course.schedule}</span>
                    <span>•</span>
                    <span>{course.hours}</span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.subtitle}
                  </p>

                  {/* Ratings & Social Proof */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <span>{course.rating}</span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground line-through">
                        {course.oldPriceFcfa}
                      </div>
                      <div className="font-heading text-lg font-black text-primary">
                        {course.priceFcfa}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {course.priceEur}
                      </div>
                    </div>

                    {course.isEnrolled ? (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all shadow-lg cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Déjà Inscrit(e)</span>
                      </Link>
                    ) : course.isPending ? (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all shadow-lg cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95"
                      >
                        <Clock className="size-3.5 animate-pulse" />
                        <span>⏳ En validation...</span>
                      </Link>
                    ) : (
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
                    )}
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
