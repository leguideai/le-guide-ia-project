"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, HelpCircle, CreditCard, BookOpen, Clock, ShieldCheck, Layers, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

export function FAQ() {
  const { t } = useLanguage()
  const [dbFaqs, setDbFaqs] = useState<any[]>([])

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faqs")
        const data = await res.json()
        if (data?.faqs) {
          setDbFaqs(data.faqs)
        }
      } catch (e) {}
    }
    loadFaqs()
  }, [])

  const items = dbFaqs.map(f => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer
  }))

  const categories = (t("faq.categories") as Record<string, string>) || {
    all: "Toutes",
    program: "Programme & Formations",
    pricing: "Paiement & Accès",
    guarantee: "Certification & Accompagnement"
  }

  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  const filteredItems = items.filter((item) => {
    if (activeCategory === "all") return true
    return item.category === activeCategory
  })

  const categoryIcons: Record<string, any> = {
    all: Layers,
    program: BookOpen,
    pricing: CreditCard,
    guarantee: ShieldCheck,
  }

  return (
    <section className="py-24 bg-card/5 relative overflow-hidden" id="faq">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* Header with Arrow Link (Udemy Style) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              {t("faq.tag")}
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {t("faq.title")}
            </h2>
          </div>
        </div>

        {/* Category Filter Tabs (Single Horizontal Row Scroll on Mobile) */}
        <div className="flex items-center justify-start gap-2 pb-3 border-b border-border/60 overflow-x-auto no-scrollbar">
          {Object.entries(categories).map(([key, label]) => {
            const Icon = categoryIcons[key] || HelpCircle
            const isActive = activeCategory === key
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key)
                  setOpenIndex(null)
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-card/40 border-border/80 text-muted-foreground hover:bg-card/70 hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Full-width Accordion list */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item: any, i: number) => {
              const isOpen = openIndex === i
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  key={item.id || `faq-${i}-${item.question || item.q}`}
                  className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden transition-colors hover:border-primary/20"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-heading text-sm font-bold text-foreground cursor-pointer focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="size-4 text-primary shrink-0" />
                      <span>{item.question || item.q}</span>
                    </span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                          {item.answer || item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}

