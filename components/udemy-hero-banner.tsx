"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

import { supabase } from "@/lib/supabase"

import { isCourseOpenForPublic } from "@/lib/courses-visibility"
import { useUserEnrollments } from "@/lib/user-enrollments"

export function UdemyHeroBanner() {
  const { isEnrolledInCourse, isPendingInCourse } = useUserEnrollments()
  const [badge, setBadge] = useState("CO-CRÉEZ VOTRE AVENIR PROFESSIONNEL")
  const [title, setTitle] = useState("Maîtrisez l'IA. Transformez votre carrière et votre business.")
  const [subtitle, setSubtitle] = useState("Formation intensive en ligne · 100% en français · Cas africains & diaspora. Apprenez à maîtriser ChatGPT, Claude, Gemini, Perplexity, NotebookLM, Make et n8n avec Alfred Dah.")
  const [dates, setDates] = useState("31 Août – 6 Sept 2026")
  const [time, setTime] = useState("19h00 GMT")
  const [posterUrl, setPosterUrl] = useState("/images/bootcamp_pro_thumb.jpg")
  const [heroFormat, setHeroFormat] = useState("🌍 100% En ligne")
  const [heroSessions, setHeroSessions] = useState("🎓 7 Sessions intensives")
  const [programmeUrl, setProgrammeUrl] = useState("/Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf")
  const [activeCourseObj, setActiveCourseObj] = useState<any>({ slug: "bootcamp-ia-pro", id: "bootcamp-ia-pro" })

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("*")
          .order("sequence_order", { ascending: true })

        if (coursesData && coursesData.length > 0) {
          const openCourses = coursesData.filter(isCourseOpenForPublic)
          const c = openCourses[0] || coursesData[0]
          setActiveCourseObj(c)
          if (c.thumbnail || c.poster) setPosterUrl(c.thumbnail || c.poster)
          if (c.dates) setDates(c.dates)
          if (c.pdf_url) setProgrammeUrl(c.pdf_url)
        }
      } catch (e) {}

      try {
        const { data: sbData } = await supabase.from("site_settings").select("*")
        if (sbData && sbData.length > 0) {
          const settingsMap: Record<string, string> = {}
          sbData.forEach((s: any) => { settingsMap[s.key] = s.value })
          if (settingsMap.hero_badge) setBadge(settingsMap.hero_badge)
          if (settingsMap.hero_title) setTitle(settingsMap.hero_title)
          if (settingsMap.hero_subtitle) setSubtitle(settingsMap.hero_subtitle)
          if (settingsMap.hero_dates) setDates(settingsMap.hero_dates)
          if (settingsMap.hero_time) setTime(settingsMap.hero_time)
          if (settingsMap.hero_poster_url) setPosterUrl(settingsMap.hero_poster_url)
          if (settingsMap.hero_format) setHeroFormat(settingsMap.hero_format)
          if (settingsMap.hero_sessions) setHeroSessions(settingsMap.hero_sessions)
          if (settingsMap.hero_programme_url) setProgrammeUrl(settingsMap.hero_programme_url)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (data?.settings) {
          if (data.settings.hero_badge) setBadge(data.settings.hero_badge)
          if (data.settings.hero_title) setTitle(data.settings.hero_title)
          if (data.settings.hero_subtitle) setSubtitle(data.settings.hero_subtitle)
          if (data.settings.hero_dates) setDates(data.settings.hero_dates)
          if (data.settings.hero_time) setTime(data.settings.hero_time)
          if (data.settings.hero_poster_url) setPosterUrl(data.settings.hero_poster_url)
          if (data.settings.hero_format) setHeroFormat(data.settings.hero_format)
          if (data.settings.hero_sessions) setHeroSessions(data.settings.hero_sessions)
          if (data.settings.hero_programme_url) setProgrammeUrl(data.settings.hero_programme_url)
        }
      } catch (e) {}
    }
    loadSettings()
  }, [])

  const isEnrolled = isEnrolledInCourse(activeCourseObj)
  const isPending = isPendingInCourse(activeCourseObj)

  return (
    <section className="relative overflow-hidden bg-slate-950 py-4 md:py-6 lg:py-8">
      
      <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6">
        
        {/* Main Banner Frame with Diagonal Glow */}
        <div className="relative rounded-3xl border border-border/80 bg-gradient-to-r from-slate-900 via-[#0d1b3e] to-slate-900 overflow-hidden shadow-2xl p-3 sm:p-5 md:p-7">
          
          <div className="grid gap-6 lg:grid-cols-12 items-stretch relative z-10">
            
            {/* Desktop Left Text Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden lg:flex lg:col-span-6 rounded-3xl border border-primary/30 bg-card/90 p-5 md:p-7 shadow-2xl backdrop-blur-2xl flex-col justify-between space-y-4 lg:space-y-6"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkles className="size-3 text-primary animate-pulse" />
                  <span>{badge}</span>
                </div>

                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  {title}
                </h1>

                <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>

                {/* Informative Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-foreground border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">📅 {dates}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">🕖 {time}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">{heroFormat}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2.5 shadow-sm">
                    <span className="text-xs">{heroSessions}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5 w-full">
                {isEnrolled ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 text-xs md:text-sm shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Vous êtes déjà inscrit(e) · Espace Membre</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : isPending ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs md:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="size-4 animate-pulse text-slate-950" />
                    <span>⏳ Inscription en cours de validation · Espace Membre</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link
                    href="/checkout/bootcamp-ia-pro"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs md:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <span>Rejoindre le Bootcamp</span>
                    <ArrowRight className="size-4" />
                  </Link>
                )}

                <a
                  href={programmeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-[1.01]"
                >
                  <span>Télécharger le programme</span>
                </a>
              </div>

            </motion.div>

            {/* Poster Graphic & Mobile Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-6 relative flex flex-col justify-center items-center h-full space-y-4"
            >
              <div className="rounded-3xl border border-primary/30 bg-card/90 p-3 sm:p-5 md:p-6 shadow-2xl backdrop-blur-2xl flex items-center justify-center w-full max-w-[440px]">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-slate-900 group">
                  <img
                    src={posterUrl || "/hero_bootcamp.jpg"}
                    alt="Affiche Officielle Le Guide IA - Bootcamp PRO 2"
                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                  />
                </div>
              </div>

              {/* Mobile Action Buttons (Visible only on < lg screens) */}
              <div className="flex flex-col gap-2.5 w-full max-w-[480px] lg:hidden">
                {isEnrolled ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 text-xs shadow-xl shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Vous êtes déjà inscrit(e) · Espace Membre</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : isPending ? (
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="size-4 animate-pulse text-slate-950" />
                    <span>⏳ Inscription en cours de validation</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link
                    href="/checkout/bootcamp-ia-pro"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Rejoindre le Bootcamp</span>
                    <ArrowRight className="size-4" />
                  </Link>
                )}

                <a
                  href={programmeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground font-bold px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  <span>Télécharger le programme</span>
                </a>
              </div>
            </motion.div>

          </div>

        </div>

      </div>

    </section>
  )
}
