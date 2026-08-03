"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations } from "./translations"

export type Language = "fr" | "en"

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => any
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("lang") as Language
    if (stored === "fr" || stored === "en") {
      setLanguageState(stored)
      document.documentElement.lang = stored
    } else {
      // Check browser language
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "en" || browserLang === "fr") {
        const nextLang = browserLang as Language
        setLanguageState(nextLang)
        document.documentElement.lang = nextLang
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Update document title and description dynamically on the client
    if (language === "en") {
      document.title = "Le Guide IA — Practical AI for French-speaking Africa"
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "Le Guide IA helps French-speaking Africa master artificial intelligence: ChatGPT, Claude, Gemini, Canva AI, productivity, and business. Join the free 5-day AI Challenge and transition to the PRO Bootcamp."
        )
      }
    } else {
      document.title = "Le Guide IA — L'IA pratique pour l'Afrique francophone"
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          "Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini, Canva IA, productivité et business. Rejoignez le Challenge IA gratuit de 5 jours et passez au Bootcamp PRO 2."
        )
      }
    }
  }, [language, mounted])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("lang", lang)
    document.documentElement.lang = lang
  }

  // A simple translation helper that supports nested keys like "hero.title"
  const t = (key: string) => {
    const keys = key.split(".")
    let current: any = translations[language]
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k]
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`)
        return key
      }
    }
    return current
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
