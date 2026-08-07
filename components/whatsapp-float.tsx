"use client"

import { useEffect, useState } from "react"
import { ArrowUp, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function WhatsAppFloat() {
  const whatsappNumber = "22605050577" // Support number
  const message = encodeURIComponent("Bonjour Le Guide IA, je souhaite avoir des informations sur le Bootcamp PRO 2.")
  const url = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1 group hover:-translate-y-1 transition-all duration-300 cursor-pointer drop-shadow-2xl"
    >
      {/* Speech Bubble with 2-line Text */}
      <div className="bg-[#25D366] text-white px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm text-center leading-snug shadow-xl border border-white/20 whitespace-nowrap">
        <span>Discuter avec nous sur</span>
        <span className="block font-black">WhatsApp</span>
      </div>

      {/* Pointer Triangle */}
      <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#25D366] -ml-1 shrink-0" />

      {/* Circle Icon Button */}
      <div className="relative size-12 md:size-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30" aria-hidden="true" />
        <img src="/whatsapp_logo.png" alt="WhatsApp Support" className="size-6 md:size-7 object-contain" />
      </div>
    </a>
  )
}

export function ScrollToTop() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("scrollToTop.ariaLabel")}
      className="fixed bottom-24 right-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg shadow-black/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
    >
      <ArrowUp className="size-4" />
    </button>
  )
}
