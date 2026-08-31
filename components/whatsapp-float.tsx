"use client"

import { useEffect, useState } from "react"
import { ArrowUp, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function WhatsAppFloat() {
  const whatsappNumber = "22605050577" // Support number
  const message = encodeURIComponent("Bonjour Le Guide IA, je souhaite avoir des informations sur les formations et bootcamps.")
  const url = `https://wa.me/${whatsappNumber}?text=${message}`

  const [isAtTop, setIsAtTop] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsAtTop(currentScrollY < 100)

      // Sur mobile : si on scroll vers le bas au-delà du hero, rétracter/discrétiser
      if (currentScrollY > lastScrollY && currentScrollY > 180) {
        setIsVisible(false) // scroll vers le bas
      } else {
        setIsVisible(true) // scroll vers le haut ou tout en haut
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-1 group transition-all duration-300 cursor-pointer drop-shadow-2xl ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-40 hover:opacity-100 translate-y-2 scale-90 sm:opacity-100 sm:translate-y-0 sm:scale-100"
      }`}
    >
      {/* Speech Bubble (Visible tout en haut, se replie proprement dès qu'on scroll pour ne rien cacher) */}
      <div 
        className={`transition-all duration-300 ease-out origin-right ${
          isAtTop 
            ? "opacity-100 scale-100 max-w-[200px]" 
            : "opacity-0 scale-75 max-w-0 pointer-events-none hidden sm:block sm:opacity-90 sm:scale-95 sm:max-w-[200px]"
        }`}
      >
        <div className="bg-[#25D366] text-white px-3.5 py-2 rounded-2xl font-bold text-xs text-center leading-snug shadow-xl border border-white/20 whitespace-nowrap">
          <span>Discuter avec nous sur</span>
          <span className="block font-black">WhatsApp</span>
        </div>
      </div>

      {/* Pointer Triangle */}
      <div 
        className={`w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#25D366] -ml-1 shrink-0 transition-opacity duration-300 ${
          isAtTop ? "opacity-100" : "opacity-0 hidden sm:block"
        }`} 
      />

      {/* Circle Icon Button (Discret en bas à droite) */}
      <div className="relative size-11 md:size-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
        <span className={`absolute inset-0 rounded-full bg-[#25D366]/30 ${isAtTop ? "animate-ping" : ""}`} aria-hidden="true" />
        <img src="/whatsapp_logo.png" alt="WhatsApp Support" className="size-5.5 md:size-6.5 object-contain" />
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
