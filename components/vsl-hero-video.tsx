"use client"

import { useState, useEffect } from "react"

export function VslHeroVideo() {
  const [videoUrl, setVideoUrl] = useState("")

  useEffect(() => {
    async function loadSettings() {
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

  return (
    <section className="relative py-6 px-4 md:px-8 border-b border-border/40 bg-gradient-to-b from-[#0b0f19] via-[#090d16] to-[#0d121f]">
      
      {/* Glow Effects en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-primary/20 via-purple-600/15 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Native YouTube Video Player Container */}
        <div className="relative rounded-3xl border-2 border-primary/40 bg-card p-2 md:p-3 shadow-[0_0_60px_rgba(2,132,199,0.25)] backdrop-blur-2xl transition-all">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
            <iframe
              src={videoUrl}
              title="Présentation Bootcamp IA par Alfred Dah"
              className="w-full h-full border-0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

      </div>

    </section>
  )
}
