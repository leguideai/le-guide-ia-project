"use client"

import { useState, useEffect } from "react"

import { supabase } from "@/lib/supabase"

export function VslHeroVideo() {
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/0DjfVGtWtDA?rel=0&modestbranding=1")

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: sbData } = await supabase.from("site_settings").select("*").eq("key", "vsl_youtube_url").maybeSingle()
        if (sbData?.value) {
          setVideoUrl(sbData.value)
          return
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (data?.settings?.vsl_youtube_url) {
          setVideoUrl(data.settings.vsl_youtube_url)
        }
      } catch (e) {}
    }
    loadSettings()
  }, [])

  const isDirectVideo = videoUrl && (
    videoUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ||
    (videoUrl.includes("supabase.co/storage") && !videoUrl.includes("embed")) ||
    (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be") && !videoUrl.includes("vimeo.com") && !videoUrl.includes("embed"))
  )

  return (
    <section className="relative py-6 px-4 md:px-8 border-b border-border/40 bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#0d121f]">
      
      {/* Glow Effects en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-primary/20 via-purple-600/15 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Video Player Container */}
        <div className="relative rounded-3xl border-2 border-primary/40 bg-card p-2 md:p-3 shadow-[0_0_60px_rgba(2,132,199,0.25)] backdrop-blur-2xl transition-all">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
            {videoUrl ? (
              isDirectVideo ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <iframe
                  src={videoUrl}
                  title="Présentation Bootcamp IA par Alfred Dah"
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
