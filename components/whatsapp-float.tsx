"use client"

import { useEffect, useState } from "react"
import { ArrowUp, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function WhatsAppFloat() {
  const whatsappNumber = "22675757273" // Support number
  const message = encodeURIComponent("Bonjour Le Guide IA, je souhaite avoir des informations sur le Bootcamp PRO.")
  const url = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 hover:bg-emerald-600 hover:-translate-y-1 active:scale-95 transition-all cursor-pointer"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" aria-hidden="true" />
      <img src="/whatsapp_logo.png" alt="WhatsApp Support" className="size-8 object-contain" />
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
