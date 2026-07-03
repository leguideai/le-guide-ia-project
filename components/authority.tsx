"use client"

import { motion } from "motion/react"
import { Quote, Award, Briefcase, Users, Star, Play } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Authority() {
  const { t } = useLanguage()

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-24" id="expert">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        {/* Left - Profile Image and Video slot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto w-full max-w-md flex flex-col gap-6"
        >
          {/* Main profile picture */}
          <div className="relative overflow-hidden p-6 rounded-2xl border border-primary/30 glow-blue bg-black/5">
            <img
              src="/profile_alfred.jpg"
              alt="Alfred Dah, fondateur de Le Guide IA, consultant IA & Transformation Digitale"
              className="w-full object-cover rounded-full bg-white border border-primary"
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-primary/25 to-transparent" />
            </div>
          </div>

          {/* Video Placeholder Slot (60s presentation) */}
          {/* <div className="group relative overflow-hidden rounded-xl border border-border bg-slate-950 aspect-video flex items-center justify-center cursor-pointer shadow-lg hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/60 transition-colors z-10" />
            <div className="z-20 text-center p-4">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 group-hover:scale-110 transition-transform mb-3 shadow-[0_0_15px_oklch(0.62_0.21_252_/_0.3)]">
                <Play className="size-5 fill-primary" />
              </span>
              <p className="text-xs font-bold text-foreground">
                {t("authority.videoPlaceholder")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Découvrez notre vision en 60 secondes
              </p>
            </div>
          </div> */}
        </motion.div>

        {/* Right - Profile Info and Authority elements */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{t("authority.tag")}</span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Alfred Dah
          </h2>
          <div className="mt-2 space-y-1 text-sm font-bold text-primary">
            <p>{t("authority.founderTitle")}</p>
            <p>{t("authority.consultantTitle")}</p>
          </div>

          {/* Core Strengths / Badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
              <Award className="size-5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground/90">{t("authority.cisa")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
              <Briefcase className="size-5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground/90">{t("authority.experience")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
              <Star className="size-5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground/90">{t("authority.mba")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/40 p-3">
              <Users className="size-5 text-primary shrink-0" />
              <div>
                <span className="block text-xs font-bold text-foreground/95">{t("authority.stats.followers")}</span>
                <span className="block text-[10px] text-muted-foreground">{t("authority.stats.followersLabel")}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>{t("authority.desc1")}</p>
            <p>{t("authority.desc2")}</p>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border/60 pt-6">
            <div>
              <div className="font-heading text-2xl font-extrabold text-foreground">{t("authority.stats.countries")}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("authority.stats.countriesLabel")}</div>
            </div>
            <div>
              <div className="font-heading text-2xl font-extrabold text-foreground">{t("authority.stats.target")}</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t("authority.stats.targetLabel")}</div>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <Quote className="size-6 shrink-0 text-primary" />
            <p className="font-heading text-base font-bold text-foreground leading-relaxed">
              {t("authority.quote")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
