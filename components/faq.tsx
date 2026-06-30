"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, HelpCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function FAQ() {
  const { t } = useLanguage()
  const items = t("faq.items") || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-24 bg-card/5 relative overflow-hidden" id="faq">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t("faq.tag")}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("faq.title")}
          </h2>
        </div>

        <div className="space-y-4">
          {items.map((item: any, i: number) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-heading text-sm font-bold text-foreground cursor-pointer focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="size-4 text-primary shrink-0" />
                    <span>{item.q}</span>
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
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
