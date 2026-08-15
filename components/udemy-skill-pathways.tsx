"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { GraduationCap, UserCheck, Gift, ArrowRight, Calendar, CheckCircle2, Sparkles, Download, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

function formatDateSafe(d: Date | string | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]}`
}

const DEFAULT_COURSES = [
  {
    id: "bootcamp-ia-carriere",
    slug: "bootcamp-ia-carriere",
    title: "Bootcamp IA & Carrière",
    subtitle: "Conçu pour les professionnels en poste, consultants et cadres voulant transformer l'IA en avantage concret dans leur travail quotidien et leur trajectoire.",
    description: "Conçu pour les professionnels en poste, consultants et cadres voulant transformer l'IA en avantage concret dans leur travail quotidien et leur trajectoire.",
    price: 99000,
    original_price: "149 000 FCFA",
    badge: "INTENSIF & DIRECT",
    dates: "31 Août au 5 Septembre 2026",
    format: "100% En Ligne",
    offer_start_date: "2026-08-10T00:00:00Z",
    offer_end_date: "2026-08-25T23:59:59Z",
    offer_badge_text: "Offre Fondateur -50 000 FCFA",
    pdf_url: "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786475706651_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
    poster: "/images/bootcamp_pro_thumb.jpg",
    thumbnail: "/images/bootcamp_pro_thumb.jpg",
    skills: [
      "Système de travail IA personnalisé, configuré et opérationnel dès le 1er jour",
      "Bibliothèque de prompts professionnels adaptée à votre métier",
      "Modèles d'écrits professionnels (emails, rapports, notes, synthèses)",
      "Premier workflow automatisé fonctionnel (Make / n8n)",
      "CV compatible ATS et profil LinkedIn optimisés et publiés",
      "Plan de carrière IA sur 90 jours + Certificat officiel LE GUIDE IA"
    ]
  },
  {
    id: "bootcamp-business-exec",
    slug: "bootcamp-business-exec",
    title: "Bootcamp IA & Business",
    subtitle: "Pour entrepreneurs, fondateurs et dirigeants souhaitant structurer leur modèle économique, automatiser leur prospection et accélérer leurs ventes avec l'IA.",
    description: "Pour entrepreneurs, fondateurs et dirigeants souhaitant structurer leur modèle économique, automatiser leur prospection et accélérer leurs ventes avec l'IA.",
    price: 149000,
    original_price: "199 000 FCFA",
    badge: "EXECUTIF VIP",
    dates: "14 au 19 Septembre 2026",
    format: "100% En Ligne",
    offer_start_date: "2026-08-10T00:00:00Z",
    offer_end_date: "2026-09-05T23:59:59Z",
    offer_badge_text: "Offre Fondateur -50 000 FCFA",
    pdf_url: "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786799298400_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
    poster: "/images/bootcamp_business_thumb.jpg",
    thumbnail: "/images/bootcamp_business_thumb.jpg",
    skills: [
      "Business Model Canvas finalisé et validé par l'IA",
      "Business Plan professionnel structuré pour investisseurs & banques",
      "Bibliothèque de 100+ prompts stratégiques Business & Vente",
      "Workflow d'automatisation des tâches & prospection commerciale (Make / n8n)",
      "Stratégie de contenu & Plan éditorial 30 jours prêt à publier",
      "Roadmap Business IA sur 90 jours + Certificat officiel LE GUIDE IA"
    ]
  }
]

function getOfferDetails(c: any) {
  const badgeText = c.offer_badge_text || "Offre Fondateur"
  const rawStart = c.offer_start_date
  const rawEnd = c.offer_end_date || (c.slug?.includes("business") ? "2026-09-05T23:59:59Z" : "2026-08-25T23:59:59Z")

  if (rawEnd) {
    try {
      const endFormatted = formatDateSafe(rawEnd) || "25 Août"
      const startFormatted = rawStart ? formatDateSafe(rawStart) : null

      const periodLabel = startFormatted
        ? `Du ${startFormatted} au ${endFormatted}`
        : `Jusqu'au ${endFormatted}`

      return {
        badgeText,
        periodLabel,
        endFormatted
      }
    } catch {
      return { badgeText, periodLabel: "Jusqu'au 25 Août", endFormatted: "25 Août" }
    }
  }

  return { badgeText, periodLabel: "Jusqu'au 25 Août", endFormatted: "25 Août" }
}

function parseCourseSkills(c: any): string[] {
  let list: string[] = []

  if (Array.isArray(c.skills) && c.skills.length > 0) {
    list = c.skills
  } else if (typeof c.skills === "string" && c.skills.trim()) {
    try {
      const parsed = JSON.parse(c.skills)
      if (Array.isArray(parsed)) list = parsed
    } catch {
      list = c.skills.split("\n").map((s: string) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean)
    }
  }

  const isOperational = (s: string) => {
    const low = s.toLowerCase()
    return low.includes("replays") || low.includes("whatsapp") || low.includes("facture") || low.includes("sessions en direct live")
  }

  const validSkills = list.map(s => String(s).replace(/^[-•*]\s*/, "").trim()).filter(s => s.length > 0 && !isOperational(s))

  if (validSkills.length >= 3) {
    return validSkills
  }

  const isCarriere = c.title?.toLowerCase().includes("carrière") || c.slug?.includes("carriere") || c.slug?.includes("pro")
  const isBusiness = c.title?.toLowerCase().includes("business") || c.slug?.includes("business")
  if (isCarriere) {
    return [
      "Système de travail IA personnalisé, configuré et opérationnel dès le 1er jour",
      "Bibliothèque de prompts professionnels adaptée à votre métier",
      "Modèles d'écrits professionnels (emails, rapports, notes, synthèses)",
      "Premier workflow automatisé fonctionnel (Make / n8n)",
      "CV compatible ATS et profil LinkedIn optimisés et publiés",
      "Plan de carrière IA sur 90 jours + Certificat officiel LE GUIDE IA"
    ]
  }
  if (isBusiness) {
    return [
      "Business Model Canvas finalisé et validé par l'IA",
      "Business Plan professionnel structuré pour investisseurs & banques",
      "Bibliothèque de 100+ prompts stratégiques Business & Vente",
      "Workflow d'automatisation des tâches & prospection commerciale (Make / n8n)",
      "Stratégie de contenu & Plan éditorial 30 jours prêt à publier",
      "Roadmap Business IA sur 90 jours + Certificat officiel LE GUIDE IA"
    ]
  }

  return validSkills
}

function formatPriceStr(val: any): string {
  if (val === null || val === undefined || val === "") return ""
  if (typeof val === "number") {
    return val > 0 ? `${val.toLocaleString("fr-FR")} FCFA` : "GRATUIT"
  }
  const str = String(val).trim()
  if (str.toLowerCase() === "gratuit" || str === "0") return "GRATUIT"
  const num = parseInt(str.replace(/\s+/g, "").replace(/fcfa/gi, ""), 10)
  if (!isNaN(num) && num > 0) {
    return `${num.toLocaleString("fr-FR")} FCFA`
  }
  return str
}

export function UdemySkillPathways() {
  const [dbCourses, setDbCourses] = useState<any[]>(DEFAULT_COURSES)

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        if (data?.courses && data.courses.length > 0) {
          setDbCourses(data.courses)
          return
        }
      } catch (e) {}

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
    }
    loadCourses()
  }, [])

  const pathways = dbCourses.map(c => {
    const datesText = c.dates
      ? c.dates
      : (c.start_date && c.end_date)
      ? `Du ${formatDateSafe(c.start_date)} au ${formatDateSafe(c.end_date)}`
      : c.slug?.includes("business") || c.title?.toLowerCase().includes("business")
      ? "14 au 19 Septembre 2026"
      : c.price === 0
      ? "Accès Immédiat 24h/7j"
      : "31 Août au 5 Septembre 2026"

    const skills = parseCourseSkills(c)
    const offer = c.price === 0 ? null : getOfferDetails(c)

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      desc: c.description || c.subtitle,
      price: formatPriceStr(c.price || "99000"),
      originalPrice: formatPriceStr(c.original_price || "149000"),
      badge: c.badge || "FORMULE OFFICIELLE",
      format: c.format || "100% En Ligne",
      certificate: c.certificate || "Certificat Officiel",
      dates: datesText,
      skills: skills,
      offer: offer,
      pdfUrl: c.pdf_url || "https://voxqivzzskbttytyklnn.supabase.co/storage/v1/object/public/resources-files/programmes/1786475706651_Programme_Bootcamp_PRO_LE_GUIDE_IA.pdf",
      icon: c.price === 0 ? Gift : Number(c.price) > 100000 || String(c.slug).includes("business") ? UserCheck : GraduationCap,
      href: `/bootcamp?course=${c.slug || c.id}`,
      image: c.thumbnail || c.poster || "/images/bootcamp_pro_thumb.jpg",
      isFree: c.price === 0,
      isVIP: Number(c.price) > 100000 || String(c.slug).includes("business"),
      accentColor: c.price === 0 ? "emerald" : Number(c.price) > 100000 || String(c.slug).includes("business") ? "amber" : "blue",
    }
  })

  const getAccent = (color: string) => {
    if (color === "emerald") {
      return {
        border: "border-emerald-500/50",
        badge: "bg-emerald-500 text-slate-950 border border-emerald-300 font-black shadow-lg shadow-emerald-500/30",
        btn: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20",
        glow: "shadow-emerald-500/10",
        price: "text-emerald-400"
      }
    }
    if (color === "amber") {
      return {
        border: "border-amber-500/50",
        badge: "bg-amber-400 text-slate-950 border border-amber-200 font-black shadow-lg shadow-amber-500/30",
        btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20",
        glow: "shadow-amber-500/10",
        price: "text-amber-400"
      }
    }
    return {
      border: "border-primary/50",
      badge: "bg-blue-600 text-white border border-blue-400/60 font-black shadow-lg shadow-blue-500/30",
      btn: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20",
      glow: "shadow-primary/10",
      price: "text-primary"
    }
  }

  return (
    <section className="py-10 sm:py-14 bg-background border-t border-border/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8 space-y-6 sm:space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              BOOTCAMP PRO IA
            </span>
            <p className="text-xs text-muted-foreground">Choisissez la formule adaptée à vos objectifs</p>
          </div>
        </div>

        {/* Stable Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                className={`relative rounded-3xl border ${accent.border} bg-card/70 overflow-hidden flex flex-col group backdrop-blur-xl shadow-2xl ${accent.glow} transition-all duration-300 hover:shadow-lg`}
              >
                {/* Image */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge top-left (High Contrast Vibrant Pill) */}
                  <div className={`absolute top-3.5 left-3.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ${accent.badge}`}>
                    {item.badge}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 flex-1 justify-between">
                  <div className="space-y-4">
                    {/* Header with Title & Price */}
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-5 shrink-0 ${accent.price}`} />
                        <h3 className="font-heading text-lg font-bold text-foreground leading-snug">{item.title}</h3>
                      </div>

                      {/* Dynamic Price & Founder Offer Validity Box */}
                      <div className="bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
                        {/* Top Row: Price + Offer Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={`text-xl sm:text-2xl font-black tracking-tight ${accent.price}`}>{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through font-semibold">{item.originalPrice}</span>
                            )}
                          </div>
                          {item.offer && (
                            <div className="self-start sm:self-auto">
                              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 whitespace-nowrap">
                                🔥 {item.offer.badgeText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Date de début et fin de l'offre */}
                        {item.offer && item.offer.periodLabel && (
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-2 border-t border-border/40 text-slate-300">
                            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                              <Clock className="size-3.5 text-amber-400 shrink-0" />
                              <span>Validité de l'offre :</span>
                            </span>
                            <span className="font-bold text-amber-300">
                              {item.offer.periodLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.desc && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.desc}</p>
                      )}
                    </div>

                    {/* 1. Dates & Format Badge */}
                    {item.dates && (
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm">
                          <Calendar className="size-4 text-amber-400 shrink-0" />
                          <span>Session : <strong>{item.dates}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200 bg-slate-900 border border-slate-700 px-3 py-1.5 sm:py-2 rounded-xl">
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{item.format}</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Compétences & Livrables Concrets (Garantis à la fin) */}
                    {item.skills && item.skills.length > 0 && (
                      <div className="space-y-3 pt-3 text-left bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="size-3.5 sm:size-4 text-amber-400 shrink-0" />
                            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                              Compétences & Livrables :
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            Garantis à la fin
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {item.skills.map((skill: string, sIdx: number) => (
                            <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-200 leading-snug font-medium">
                              <CheckCircle2 className="size-3.5 sm:size-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      href={item.href}
                      className={`w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer ${accent.btn}`}
                    >
                      <span>Découvrir la formule</span>
                      <ArrowRight className="size-4" />
                    </Link>
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold px-3.5 py-3 text-xs transition-all shrink-0 hover:text-white"
                        title="Télécharger le programme officiel (PDF)"
                      >
                        <Download className="size-3.5 text-primary" />
                        <span className="hidden sm:inline">Programme PDF</span>
                        <span className="sm:hidden">Programme (PDF)</span>
                      </a>
                    )}
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
