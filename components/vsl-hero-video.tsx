"use client"

import { useState, useEffect } from "react"
import { Sparkles, Shuffle, Play, CheckCircle2, User, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export interface HeroVslVideo {
  id: string
  title: string
  video_url: string
  badge?: string
  author_name?: string
  author_role?: string
  is_active?: boolean
}

const DEFAULT_VIDEOS: HeroVslVideo[] = [
  {
    id: "vsl-official-presentation",
    title: "Présentation Complète du Bootcamp PRO IA par Alfred Dah",
    video_url: "https://www.youtube.com/embed/0DjfVGtWtDA?rel=0&modestbranding=1",
    badge: "Vidéo Officielle",
    author_name: "Alfred Dah",
    author_role: "Fondateur & Expert IA",
    is_active: true
  },
  {
    id: "vsl-testimonial-1",
    title: "Comment l'IA a transformé mon quotidien professionnel et ma productivité",
    video_url: "https://www.youtube.com/embed/L_LUpnjgPso?rel=0&modestbranding=1",
    badge: "Témoignage Apprenant",
    author_name: "Diplômé Bootcamp Promo 1",
    author_role: "Consultant Stratégie & Finance",
    is_active: true
  }
]

export function formatVideoEmbedUrl(url: string): string {
  if (!url) return ""
  const trimmed = url.trim()
  
  // YouTube watch format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`
  }

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i)
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`
  }

  return trimmed
}

export function VslHeroVideo() {
  const [videoList, setVideoList] = useState<HeroVslVideo[]>(DEFAULT_VIDEOS)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [hasRandomized, setHasRandomized] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: sbData } = await supabase.from("site_settings").select("*")
        if (sbData && sbData.length > 0) {
          const poolRow = sbData.find((r: any) => r.key === "vsl_videos_pool")
          if (poolRow?.value) {
            try {
              const parsed = JSON.parse(poolRow.value)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const activeOnes = parsed.filter((v: HeroVslVideo) => v.is_active !== false)
                if (activeOnes.length > 0) {
                  setVideoList(activeOnes)
                  // Pick a random video on entry
                  const randomIdx = Math.floor(Math.random() * activeOnes.length)
                  setCurrentIndex(randomIdx)
                  setHasRandomized(true)
                  return
                }
              }
            } catch (e) {}
          }

          const singleVsl = sbData.find((r: any) => r.key === "vsl_youtube_url")
          if (singleVsl?.value) {
            setVideoList([{
              id: "single-vsl",
              title: "Présentation Officielle Bootcamp IA",
              video_url: formatVideoEmbedUrl(singleVsl.value),
              badge: "Vidéo Officielle",
              author_name: "Alfred Dah",
              is_active: true
            }])
            return
          }
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (data?.settings?.vsl_videos_pool) {
          try {
            const parsed = JSON.parse(data.settings.vsl_videos_pool)
            if (Array.isArray(parsed) && parsed.length > 0) {
              const activeOnes = parsed.filter((v: HeroVslVideo) => v.is_active !== false)
              if (activeOnes.length > 0) {
                setVideoList(activeOnes)
                const randomIdx = Math.floor(Math.random() * activeOnes.length)
                setCurrentIndex(randomIdx)
                setHasRandomized(true)
                return
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
    }
    loadSettings()
  }, [])

  // Randomize once on mount for default videos if not set yet
  useEffect(() => {
    if (!hasRandomized && videoList.length > 1) {
      const randomIdx = Math.floor(Math.random() * videoList.length)
      setCurrentIndex(randomIdx)
      setHasRandomized(true)
    }
  }, [videoList, hasRandomized])

  const currentVideo = videoList[currentIndex] || videoList[0] || DEFAULT_VIDEOS[0]
  const currentUrl = formatVideoEmbedUrl(currentVideo.video_url)

  const isDirectVideo = currentUrl && (
    currentUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ||
    (currentUrl.includes("supabase.co/storage") && !currentUrl.includes("embed")) ||
    (!currentUrl.includes("youtube.com") && !currentUrl.includes("youtu.be") && !currentUrl.includes("vimeo.com") && !currentUrl.includes("embed"))
  )

  const handleNextRandom = () => {
    if (videoList.length <= 1) return
    let nextIdx = Math.floor(Math.random() * videoList.length)
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % videoList.length
    }
    setCurrentIndex(nextIdx)
  }

  const handleSelectVideo = (idx: number) => {
    setCurrentIndex(idx)
  }

  return (
    <section className="relative py-8 px-3 sm:px-4 md:px-8 border-b border-border/40 bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#0d121f]">
      
      {/* Glow Effects en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-primary/20 via-purple-600/15 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-4">
        
        {/* Top Header Card with Dynamic Badge & Shuffle button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 sm:px-5 sm:py-3 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="size-3 text-amber-400" />
              {currentVideo.badge || "Vidéo En Vedette"}
            </span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {currentVideo.title}
              </h3>
              {currentVideo.author_name && (
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <User className="size-3 text-slate-500 shrink-0" />
                  <span>{currentVideo.author_name} {currentVideo.author_role ? `• ${currentVideo.author_role}` : ""}</span>
                </p>
              )}
            </div>
          </div>

          {videoList.length > 1 && (
            <button
              onClick={handleNextRandom}
              className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-primary/50 text-slate-200 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Voir un autre témoignage ou vidéo"
            >
              <Shuffle className="size-3.5 text-amber-400" />
              <span className="hidden xs:inline">Autre vidéo</span>
              <span className="xs:hidden">Suivant</span>
            </button>
          )}
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-3xl border-2 border-primary/40 bg-card p-2 sm:p-3 shadow-[0_0_60px_rgba(2,132,199,0.25)] backdrop-blur-2xl transition-all">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
            {currentUrl ? (
              isDirectVideo ? (
                <video
                  key={currentUrl}
                  src={currentUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <iframe
                  key={currentUrl}
                  src={currentUrl}
                  title={currentVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )
            ) : null}
          </div>
        </div>

        {/* Video Switcher Pills (If multiple videos available) */}
        {videoList.length > 1 && (
          <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">
              Explorer les vidéos :
            </span>
            {videoList.map((v, idx) => {
              const isActive = idx === currentIndex
              return (
                <button
                  key={v.id || idx}
                  onClick={() => handleSelectVideo(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-slate-950 shadow-md shadow-primary/20 scale-105"
                      : "bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Play className="size-3 shrink-0" />
                  <span className="max-w-[160px] truncate">{v.badge || v.title}</span>
                </button>
              )
            })}
          </div>
        )}

      </div>

    </section>
  )
}
