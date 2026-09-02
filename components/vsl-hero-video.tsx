"use client"

import { useState, useEffect } from "react"
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
  const [videoList, setVideoList] = useState<HeroVslVideo[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)

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
                  // Pick a random video at each visit/reload
                  const randomIdx = Math.floor(Math.random() * activeOnes.length)
                  setCurrentIndex(randomIdx)
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
                return
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    loadSettings()
  }, [])

  const currentVideo = videoList[currentIndex] || null
  const currentUrl = formatVideoEmbedUrl(currentVideo?.video_url)

  const isDirectVideo = currentUrl && (
    currentUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ||
    (currentUrl.includes("supabase.co/storage") && !currentUrl.includes("embed")) ||
    (!currentUrl.includes("youtube.com") && !currentUrl.includes("youtu.be") && !currentUrl.includes("vimeo.com") && !currentUrl.includes("embed"))
  )

  return (
    <section className="relative py-6 sm:py-8 px-3 sm:px-4 md:px-8 border-b border-border/40 bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#0d121f]">
      
      {/* Glow Effects en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-primary/20 via-blue-600/15 to-[#D4AF37]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        
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
                  title={currentVideo.title || "Présentation Bootcamp IA"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )
            ) : null}
          </div>
        </div>

      </div>

    </section>
  )
}
