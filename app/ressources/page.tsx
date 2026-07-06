"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Copy, Check, Download, FileText, Sparkles, BookOpen, ExternalLink } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { SiteNav } from "@/components/site-nav"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { resourcesData, ResourceItem } from "@/lib/resources-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function RessourcesPage() {
  const { t, language } = useLanguage()
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<'all' | 'prompt' | 'business-plan'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Copy handler
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Filter & Search logic
  const filteredResources = resourcesData.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter
    
    const titleText = item.title[language] || item.title.fr
    const descText = item.desc[language] || item.desc.fr
    const contentText = item.content[language] || item.content.fr
    const sectorText = item.sector ? (item.sector[language] || item.sector.fr) : ""
    
    const searchString = `${titleText} ${descText} ${contentText} ${sectorText}`.toLowerCase()
    const matchesSearch = searchString.includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-background">
      <GridBackground />
      <SiteNav />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full"
          >
            {t("resourcesPage.tag")}
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t("resourcesPage.title")}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 mx-auto max-w-3xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            {t("resourcesPage.desc")}
          </motion.p>
        </div>
      </section>

      {/* Main Controls Section (Search & Filter) */}
      <section className="py-6 border-y border-border/40 bg-card/10 backdrop-blur-md sticky top-[68px] z-30">
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categories Filters */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer border",
                activeFilter === 'all'
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
              )}
            >
              {t("resourcesPage.filterAll")}
            </button>
            <button
              onClick={() => setActiveFilter('prompt')}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                activeFilter === 'prompt'
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
              )}
            >
              <Sparkles className="size-3.5" />
              {t("resourcesPage.filterPrompts")}
            </button>
            <button
              onClick={() => setActiveFilter('business-plan')}
              className={cn(
                "px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                activeFilter === 'business-plan'
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
              )}
            >
              <FileText className="size-3.5" />
              {t("resourcesPage.filterPlans")}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-md order-1 md:order-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("resourcesPage.searchPlaceholder")}
              className="w-full rounded-lg border border-border/80 bg-card/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:bg-card/50"
            />
          </div>

        </div>
      </section>

      {/* Grid of cards */}
      <section className="py-20 relative">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          
          <motion.div 
            layout
            className="grid gap-8 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredResources.map((item) => {
                const title = item.title[language] || item.title.fr
                const desc = item.desc[language] || item.desc.fr
                const content = item.content[language] || item.content.fr
                const sector = item.sector ? (item.sector[language] || item.sector.fr) : null

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/25 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/35 shadow-sm"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider",
                          item.type === 'prompt' 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {item.type === 'prompt' ? t("resourcesPage.filterPrompts") : t("resourcesPage.filterPlans")}
                        </span>
                        
                        {sector && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {t("resourcesPage.sector")} : {sector}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-heading text-xl font-bold text-white mb-3">
                        {title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {desc}
                      </p>

                      {/* Display content preview */}
                      <div className="relative rounded-lg bg-slate-950/40 border border-border/40 p-4 mb-6 max-h-56 overflow-y-auto text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap select-all scrollbar-thin">
                        {content}
                      </div>
                    </div>

                    {/* Action button */}
                    <div>
                      {item.type === 'prompt' ? (
                        <button
                          onClick={() => handleCopy(item.id, content)}
                          className={cn(
                            buttonVariants({ variant: copiedId === item.id ? "default" : "outline" }),
                            "w-full font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                          )}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="size-4 stroke-[3]" />
                              <span>{t("resourcesPage.copied")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              <span>{t("resourcesPage.copyPrompt")}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <a
                          href={`https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Le Guide IA, je souhaite recevoir le modèle de Business Plan complet pour le projet : " + title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "default" }),
                            "w-full font-bold glow-blue transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                          )}
                        >
                          <Download className="size-4" />
                          <span>{t("resourcesPage.downloadPlan")}</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {filteredResources.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-semibold">Aucune ressource ne correspond à votre recherche.</p>
            </div>
          )}

        </div>
      </section>

      {/* Footer & floats */}
      <CtaFooter />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
