"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Play, Star, Clock, ArrowRight, Sparkles, X, Tv, ShieldCheck, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CourseCard {
  id: string
  title: string
  subtitle: string
  duration: string
  rating: string
  reviews: string
  instructor: string
  source: "youtube" | "supabase"
  videoUrl: string
  thumbnail: string
  badge: string
  price: string
  href: string
}

export function UdemyTabbedCourses() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("initiation")
  const [selectedVideo, setSelectedVideo] = useState<CourseCard | null>(null)
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null)
  const [dbLessonsData, setDbLessonsData] = useState<any[]>([])

  useEffect(() => {
    async function loadLessons() {
      try {
        const { data } = await supabase.from("lessons").select("*").order("sequence_order", { ascending: true })
        if (data && data.length > 0) {
          setDbLessonsData(data)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/courses")
        const data = await res.json()
        const fetchedLessons: any[] = []
        if (data?.courses) {
          data.courses.forEach((c: any) => {
            if (c.lessons && Array.isArray(c.lessons)) {
              fetchedLessons.push(...c.lessons)
            }
          })
        }
        if (fetchedLessons.length > 0) {
          setDbLessonsData(fetchedLessons)
        }
      } catch (e) {}
    }
    loadLessons()
  }, [])

  const getMediaThumbnail = (card: CourseCard) => {
    if (card.videoUrl) {
      const match = card.videoUrl.match(/(?:embed\/|watch\?v=|v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
      }
    }
    return card.thumbnail
  }

  const tabs = [
    { id: "initiation", label: "Initiation IA & Productivité" },
    { id: "business", label: "Business Model & Plan" },
    { id: "career", label: "CV, LinkedIn & Emploi" },
  ]

  const dynamicLessonsMap = dbLessonsData.length > 0 ? dbLessonsData.map((les, idx) => ({
    id: les.id,
    title: les.title,
    subtitle: les.module_name || "Module de cours interactif",
    duration: les.duration || "1h 30m",
    rating: "4.9",
    reviews: `${100 + idx * 45} avis`,
    instructor: "Alfred Dah",
    source: "supabase" as const,
    videoUrl: les.video_url || "https://www.youtube.com/embed/L_LUpnjgPso",
    thumbnail: les.pdf_url || "/images/bootcamp_pro_thumb.jpg",
    badge: les.module_name || `Module ${idx + 1}`,
    price: "Accès Membre",
    href: "/dashboard"
  })) : []

  const tabContent: Record<string, CourseCard[]> = {
    initiation: dynamicLessonsMap.slice(0, 3),
    business: dynamicLessonsMap.slice(1, 4),
    career: dynamicLessonsMap.slice(0, 4)
  }

  const currentCards = tabContent[activeTab] || tabContent["initiation"]

  return (
    <section className="py-10 md:py-12 bg-slate-950/60 border-t border-border/50" id="parcours">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Header with Arrow Link (Udemy Style) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              TUTORIELS VIDÉOS PRATIQUES
            </span>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Découvrez nos cours et petits tutoriels vidéo pour prendre en main l'Intelligence Artificielle.
            </p>
          </div>

          {pathname !== "/ressources" && (
            <Link
              href="/ressources"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors group shrink-0"
            >
              <span>Voir la bibliothèque</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Tabbar Navigation (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 border-b border-border/70 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer border shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-card/40 border-border/60 text-muted-foreground hover:bg-card/80 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3 Video Cards Grid (Scrollable on Mobile, Grid on Desktop) */}
        <div className="flex overflow-x-auto md:overflow-visible snap-x no-scrollbar pt-3 pb-4 gap-4 md:grid md:grid-cols-3 md:pb-0">
          {currentCards.map((card) => (
            <div
              key={card.id}
              className="relative z-10 hover:z-20 rounded-2xl border border-border/80 bg-card/60 overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-xl backdrop-blur-xl group shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center"
            >
              {/* Card Media Container (Real YouTube Thumbnail & Inline Playable Frame) */}
              <div className="relative aspect-video overflow-hidden bg-slate-900 group/video">
                {inlinePlayingId === card.id ? (
                  <iframe
                    src={`${card.videoUrl}?autoplay=1`}
                    title={card.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => setInlinePlayingId(card.id)}>
                    <img
                      src={getMediaThumbnail(card)}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover/video:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover/video:scale-110 transition-transform border border-white/20">
                        <Play className="size-5 fill-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Video Duration Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-md px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                      <Clock className="size-3 text-primary" />
                      <span>{card.duration}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block font-medium">Formateur</span>
                    <span className="text-xs font-bold text-foreground">{card.instructor}</span>
                  </div>

                  <button
                    onClick={() => setInlinePlayingId(card.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-3 py-1.5 text-xs transition-all shadow-md cursor-pointer"
                  >
                    <span>Regarder la vidéo</span>
                    <Play className="size-3.5 fill-current" />
                  </button>
                </div> */}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Video Modal Preview */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border border-primary/40 bg-slate-900 overflow-hidden shadow-2xl space-y-4 p-4 md:p-6">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-primary tracking-widest">
                  {selectedVideo.badge} · Aperçu de la formation
                </span>
                <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="size-8 rounded-full bg-card hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/80 bg-black">
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-300">
                <span>Accédez à l'intégralité des 15h de Bootcamp & replays HD</span>
              </div>

              <Link
                href={selectedVideo.href}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 text-xs shadow-lg transition-all"
              >
                <span>Rejoindre le Bootcamp complet</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}

