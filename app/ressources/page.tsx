"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search, Copy, Check, Download, FileText, Sparkles, BookOpen, Lock, LogIn } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { UdemyHeader } from "@/components/udemy-header"
import { UdemyTabbedCourses } from "@/components/udemy-tabbed-courses"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { resourcesData, ResourceItem } from "@/lib/resources-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResourceOptinModal } from "@/components/resource-optin-modal"
import { supabase } from "@/lib/supabase"

export default function RessourcesPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<'all' | 'prompt' | 'business-plan'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auth unlock state
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isOptinOpen, setIsOptinOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'copy' | 'download'
    id: string
    title: string
    content?: string
    waUrl?: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const unlocked = localStorage.getItem("leguideia_resources_unlocked") === "true"
      if (unlocked) {
        setIsUnlocked(true)
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsUnlocked(true)
          localStorage.setItem("leguideia_resources_unlocked", "true")
        }
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsUnlocked(true)
          localStorage.setItem("leguideia_resources_unlocked", "true")
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  // Copy handler
  const executeCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const handleAction = (item: ResourceItem, title: string, content: string) => {
    if (!isUnlocked) {
      // Redirige directement vers la page de connexion
      router.push("/login?redirect=/ressources")
      return
    }

    if (item.type === 'prompt') {
      executeCopy(item.id, content)
    } else {
      const waUrl = `https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Le Guide IA, je souhaite recevoir le modèle de Business Plan complet pour le projet : " + title)}`
      window.open(waUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleOptinSuccess = () => {
    setIsUnlocked(true)
    localStorage.setItem("leguideia_resources_unlocked", "true")
    if (pendingAction) {
      if (pendingAction.type === 'copy' && pendingAction.content) {
        executeCopy(pendingAction.id, pendingAction.content)
      } else if (pendingAction.type === 'download' && pendingAction.waUrl) {
        window.open(pendingAction.waUrl, "_blank", "noopener,noreferrer")
      }
      setPendingAction(null)
    }
  }

  const [dbResources, setDbResources] = useState<any[]>([])

  useEffect(() => {
    async function loadResources() {
      const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false })
      if (data && data.length > 0) setDbResources(data)
    }
    loadResources()
  }, [])

  const currentResourcesMap: ResourceItem[] = dbResources.length > 0 ? dbResources.map((r: any) => ({
    id: r.id,
    type: r.type === "Prompt" ? "prompt" : "business-plan",
    title: { fr: r.title, en: r.title },
    desc: { fr: r.category || "Ressource certifiée Le Guide IA", en: r.category || "Ressource certifiée" },
    content: { fr: r.prompt_text || "", en: r.prompt_text || "" },
    fileUrl: r.file_url || undefined,
    tier: r.tier || "Membre Premium"
  })) : resourcesData

  // Filter & Search logic
  const filteredResources = currentResourcesMap.filter((item) => {
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
      <UdemyHeader />

      {/* 1. Section Tutoriels Vidéos Pratiques */}
      {/* <UdemyTabbedCourses /> */}

      {/* 2. Section Prompts Métiers & Business Plans IA (Search & Filter) */}
      <section className="py-12 bg-background border-t border-border/50" id="prompts-templates">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
              <Sparkles className="size-3.5 text-purple-400" />
              PROMPTS &amp; BUSINESS PLANS TÉLÉCHARGEABLES
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-black text-foreground tracking-tight">
              Bibliothèque de Prompts &amp; Modèles IA
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Connectez-vous pour débloquer, copier et télécharger nos prompts métiers et modèles de projets d'entreprise.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-y border-border/40 py-4 bg-card/10 backdrop-blur-md rounded-2xl px-4">
            
            {/* Categories Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "px-4 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border",
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
                  "px-4 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
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
                  "px-4 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
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
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="size-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("resourcesPage.searchPlaceholder")}
                className="w-full rounded-xl border border-border/80 bg-card/40 py-2.5 pl-10 pr-4 text-xs text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:bg-card/60"
              />
            </div>

          </div>

          {/* Grid of Prompts & Business Plan cards */}
          <motion.div 
            layout
            className="grid gap-8 md:grid-cols-2 pt-2"
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
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card/30 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/50 shadow-xl text-left"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
                          item.type === 'prompt' 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {item.type === 'prompt' ? t("resourcesPage.filterPrompts") : t("resourcesPage.filterPlans")}
                        </span>
                        
                        {sector && (
                          <span className="text-[10px] text-muted-foreground font-semibold bg-card/60 border border-border/60 rounded-full px-2.5 py-1">
                            {t("resourcesPage.sector")} : {sector}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-heading text-xl font-bold text-white mb-2 text-left">
                        {title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-5 text-left">
                        {desc}
                      </p>

                      {/* Display content preview */}
                      <div className="relative mb-6">
                        {!isUnlocked ? (
                          <div className="rounded-xl bg-slate-950 border border-primary/30 p-4 max-h-60 overflow-hidden text-xs md:text-sm leading-relaxed font-mono whitespace-pre-wrap select-none pointer-events-none text-left relative">
                            {/* Teaser Header Badge */}
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
                              <Sparkles className="size-3 text-amber-400" />
                              <span>Aperçu en clair (Avant-goût) :</span>
                            </div>
                            {/* Crystal Clear Unblurred Teaser Snippet */}
                            <div className="text-white font-bold opacity-100 pb-1 leading-snug">
                              {content.slice(0, 150)}...
                            </div>
                            {/* Blurred Rest of Prompt (Uncopyable) */}
                            <div className="blur-[7px] opacity-30 select-none pointer-events-none text-slate-400 mt-1">
                              {content.slice(150)}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-slate-950/60 border border-border/60 p-4 max-h-56 overflow-y-auto text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap transition-all duration-300 scrollbar-thin text-left select-all">
                            {content}
                          </div>
                        )}

                        {!isUnlocked && (
                          <div
                            onClick={() => handleAction(item, title, content)}
                            className="absolute inset-0 flex flex-col items-center justify-end pb-4 rounded-xl bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-center cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl shadow-xl border border-white/20 group-hover:scale-105 transition-transform">
                              <LogIn className="size-4" />
                              <span className="text-xs font-extrabold">
                                Se connecter pour débloquer
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action button (Displayed ONLY when unlocked / connected) */}
                    {isUnlocked && (
                      <div>
                        <button
                          onClick={() => handleAction(item, title, content)}
                          className={cn(
                            buttonVariants({
                              variant: copiedId === item.id ? "default" : item.type === 'prompt' ? "outline" : "default"
                            }),
                            "w-full rounded-xl font-extrabold text-xs py-3 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2",
                            item.type !== 'prompt' && "glow-blue"
                          )}
                        >
                          {item.type === 'prompt' ? (
                            copiedId === item.id ? (
                              <>
                                <Check className="size-4 stroke-[3]" />
                                <span>{t("resourcesPage.copied")}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-4" />
                                <span>{t("resourcesPage.copyPrompt")}</span>
                              </>
                            )
                          ) : (
                            <>
                              <Download className="size-4" />
                              <span>{t("resourcesPage.downloadPlan")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
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

      {/* Opt-in Modal fallback */}
      <ResourceOptinModal
        isOpen={isOptinOpen}
        onClose={() => setIsOptinOpen(false)}
        onSuccess={handleOptinSuccess}
        resourceTitle={pendingAction?.title}
      />

      {/* Footer & floats */}
      <CtaFooter hideCta={true} />
      <ScrollToTop />
      <WhatsAppFloat />
    </main>
  )
}
