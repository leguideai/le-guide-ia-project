"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { UdemyHeader } from "@/components/udemy-header"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { GridBackground } from "@/components/grid-background"
import { GraduationCap, UserCheck, Gift, ArrowRight, Sparkles, CheckCircle2, Calendar, Globe, Download } from "lucide-react"

import { supabase } from "@/lib/supabase"

export default function BootcampPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
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
          const urlParams = new URLSearchParams(window.location.search)
          const paramCourse = urlParams.get("course")
          if (paramCourse) {
            const found = data.find(c => c.slug === paramCourse || c.id === paramCourse)
            if (found) {
              setSelectedCourseId(found.id)
              return
            }
          }
          setSelectedCourseId(data[0].id)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          setDbCourses(data.courses)
          const urlParams = new URLSearchParams(window.location.search)
          const paramCourse = urlParams.get("course")
          if (paramCourse) {
            const found = data.courses.find((c: any) => c.slug === paramCourse || c.id === paramCourse)
            if (found) {
              setSelectedCourseId(found.id)
              return
            }
          }
          setSelectedCourseId(data.courses[0].id)
        }
      } catch (e) {}
    }
    loadCourses()
  }, [])

  const active = dbCourses.find(c => c.id === selectedCourseId) || dbCourses[0]

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden">
      <GridBackground />
      <UdemyHeader />

      {/* Hero Section Adaptée aux Formules de Bootcamp */}
      <section className="py-14 bg-slate-950/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          {/* Header Left-Aligned */}
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <Sparkles className="size-3.5 text-primary animate-pulse" />
              CATALOGUE OFFICIEL DES BOOTCAMPS LE GUIDE IA
            </span>

            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
               Choisissez le Bootcamp adapté à votre profil et vos objectifs.
            </p>
          </div>

          {/* Dynamic Formula Selector Tabs from Supabase */}
          <div className="flex items-center justify-start gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
            {dbCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                  active?.id === c.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                    : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
                }`}
              >
                <GraduationCap className="size-4" />
                <span>{c.title} ({c.price > 0 ? `${c.price.toLocaleString("fr-FR")} ${c.currency || "FCFA"}` : "GRATUIT"})</span>
              </button>
            ))}
          </div>

          {/* Dynamic Active Formula Showcase Card with Official 3:4 Poster Image */}
          {active && (
            <motion.div
              key={active.id || selectedCourseId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border-2 border-primary/50 bg-card/80 backdrop-blur-2xl p-6 md:p-10 shadow-2xl relative z-10"
            >
              <div className="grid gap-8 lg:grid-cols-12 items-stretch">
                
                {/* Left Column: Details & Program Features */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  
                  {/* Header Row */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
                      <div className="space-y-1 text-left">
                  
                        <h2 className="font-heading text-2xl md:text-3xl font-black text-foreground pt-1">
                          {active.title}
                        </h2>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {active.subtitle || active.description}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0 bg-primary/5 border border-primary/20 px-4 py-2 rounded-2xl">
                        <div className="font-heading text-2xl md:text-3xl font-black text-primary">
                          {active.price > 0 ? `${active.price.toLocaleString("fr-FR")} ${active.currency || "FCFA"}` : "GRATUIT"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{active.badge || "Formule Officielle"}</div>
                      </div>
                    </div>

                    {/* Highlights Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Calendar className="size-3.5 text-primary" />
                        Session : {active.dates || active.date || "Sur 7 jours"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Globe className="size-3.5 text-emerald-400" />
                        {active.format || "100% En Ligne"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-card border border-border/80 rounded-lg px-3 py-1.5 text-foreground/90">
                        <Sparkles className="size-3.5 text-amber-400" />
                        {active.certificate || "Certificat Officiel"}
                      </span>
                    </div>
                  </div>

                {/* Features List */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/80">Ce qui est inclus dans cette formule :</h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs md:text-sm text-foreground/90">
                    {Array.isArray(active?.features) && active.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action Buttons Row (Spacious & Clean Layout) */}
                <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={active?.price === 0 || active?.price === "0" || active?.price === "GRATUIT" ? "/register-account" : `/checkout/${active?.slug || active?.id}`}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-extrabold px-6 py-3.5 text-xs md:text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-95 bg-primary text-primary-foreground hover:opacity-90"
                  >
                    <span>Réserver ma place maintenant</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <a
                    href={active?.pdf_url || active?.programme_url || "/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                  >
                    <Download className="size-4" />
                    <span>Télécharger le programme (PDF)</span>
                  </a>
                </div>

              </div>

              {/* Right Column: Official Poster Display (3:4 Vertical Ratio) */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="rounded-2xl border border-primary/30 bg-slate-950 p-3 shadow-2xl backdrop-blur-xl w-full max-w-[340px]">
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/40 shadow-xl bg-slate-950 group">
                    <img
                      src={active?.poster || active?.thumbnail || "/images/bootcamp_pro_poster.jpg"}
                      alt={`Affiche Officielle ${active?.title || "Bootcamp"}`}
                      className="w-full h-full object-contain block group-hover:scale-[1.02] transition-transform duration-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        </div>
      </section>

      {/* Grille Tarifs Complète */}
      <Pricing selectedCourseId={selectedCourseId} />

      {/* Témoignages des alumni */}
      <Testimonials />

      {/* Pied de Page / Footer officiel du site */}
      <CtaFooter hideCta={true} />

      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
