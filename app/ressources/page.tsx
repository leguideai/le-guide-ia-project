"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search, Copy, Check, Download, FileText, Sparkles, BookOpen, Lock, LogIn, Crown, Clock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { TabbedCourses } from "@/components/tabbed-courses"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { resourcesData, ResourceItem } from "@/lib/resources-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResourceOptinModal } from "@/components/resource-optin-modal"
import { SubscriptionModal } from "@/components/subscription-modal"
import { supabase } from "@/lib/supabase"

export default function RessourcesPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<'all' | 'prompt' | 'business-plan'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auth & Subscription unlock state
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [isOptinOpen, setIsOptinOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'copy' | 'download'
    id: string
    title: string
    content?: string
    waUrl?: string
  } | null>(null)

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user || null
      setCurrentUser(user)

      if (!user?.email) {
        setIsUnlocked(false)
        return
      }

      try {
        const res = await fetch(`/api/subscriptions?email=${encodeURIComponent(user.email)}`)
        const data = await res.json()
        setSubscriptionInfo(data)
        if (data.isSubscribed) {
          setIsUnlocked(true)
        } else {
          setIsUnlocked(false)
        }
      } catch (_) {
        setIsUnlocked(false)
      }
    }

    checkAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUser(session.user)
        fetch(`/api/subscriptions?email=${encodeURIComponent(session.user.email)}`)
          .then(r => r.json())
          .then(d => {
            setSubscriptionInfo(d)
            if (d.isSubscribed) setIsUnlocked(true)
            else setIsUnlocked(false)
          })
          .catch(() => setIsUnlocked(false))
      } else {
        setCurrentUser(null)
        setIsUnlocked(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Copy handler
  const executeCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const handleAction = (item: ResourceItem, title: string, content: string) => {
    if (!currentUser) {
      router.push("/login?redirect=/ressources")
      return
    }

    if (!isUnlocked) {
      setShowSubscriptionModal(true)
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
  const [loadingResources, setLoadingResources] = useState(true)

  useEffect(() => {
    async function loadResources() {
      try {
        const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false })
        if (!error && data) {
          setDbResources(data)
        }
      } catch (err) {
        console.warn("Could not load resources from Supabase:", err)
      } finally {
        setLoadingResources(false)
      }
    }
    loadResources()
  }, [])

  // Strict mapping directly from Supabase table 'resources'
  const currentResourcesMap: ResourceItem[] = dbResources.map((r: any) => {
    const rawType = (r.type || "Prompt").toLowerCase()
    const itemType: 'prompt' | 'business-plan' | 'exercise' = 
      rawType.includes("plan") || rawType.includes("document") 
        ? "business-plan" 
        : rawType.includes("exercice") || rawType.includes("exercise")
        ? "exercise"
        : "prompt"

    return {
      id: r.id,
      type: itemType,
      title: { fr: r.title, en: r.title },
      desc: { fr: r.description || r.category || "Ressource certifiée Le Guide IA", en: r.description || r.category || "Ressource certifiée" },
      content: { fr: r.prompt_text || r.content || "", en: r.prompt_text || r.content || "" },
      fileUrl: r.file_url || r.download_url || undefined,
      sector: r.category ? { fr: r.category, en: r.category } : undefined,
      tier: r.tier || r.access_level || "VIP"
    }
  })

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

  const isSubPending = Boolean(
    !isUnlocked && (
      subscriptionInfo?.status === "pending" ||
      subscriptionInfo?.status === "pending_verification" ||
      subscriptionInfo?.status === "en_attente"
    )
  )

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-background">
      <GridBackground />
      <Header />

      {/* 1. Section Tutoriels Vidéos Pratiques */}
      {/* <TabbedCourses /> */}

      {/* 2. Section Prompts Métiers & Business Plans IA (Search & Filter) */}
      <section className="py-12 bg-background border-t border-border/50" id="prompts-templates">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
          
          <div className="space-y-3 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
              <Sparkles className="size-3.5 text-purple-400" />
              PROMPTS &amp; BUSINESS PLANS
            </span>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Copiez et téléchargez nos prompts métiers et modèles de projets d'entreprise prêts à l'emploi.
            </p>
          </div>

          {/* VIP All-Access Banner when not unlocked */}
          {!isUnlocked && (
            <div className={`p-5 sm:p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
              isSubPending
                ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-primary/10 border-amber-400/60"
                : "bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-primary/15 border-amber-400/50"
            }`}>
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
                  {isSubPending ? <Clock className="size-6 text-slate-950 animate-pulse" /> : <Crown className="size-6 text-slate-950" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-heading font-black text-white">
                      {isSubPending
                        ? `Validation de votre Abonnement VIP en cours (${subscriptionInfo?.planLabel || "Pass VIP"})`
                        : "Pass VIP Unique — Accès Illimité à Tout le Catalogue"}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      {isSubPending ? "⏳ Vérification sous 2h à 4h" : "1 Pass = 100% Débloqué"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isSubPending
                      ? `Votre justificatif de paiement (Réf: ${subscriptionInfo?.transactionRef || "Reçu soumis"}) a été reçu. Vos accès à l'ensemble des prompts (+100) et replays s'activeront dès confirmation.`
                      : "Un seul abonnement débloque automatiquement l'ensemble de la bibliothèque de prompts (+100), tous les business plans et tous les replays de masterclasses."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!currentUser) router.push("/login?redirect=/ressources")
                  else setShowSubscriptionModal(true)
                }}
                className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-xs shrink-0 flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap ${
                  isSubPending
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/60 hover:bg-amber-500/40"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                {isSubPending ? <Clock className="size-4" /> : <Crown className="size-4" />}
                <span>{isSubPending ? "Voir l'état de validation →" : currentUser ? "Activer mon Pass VIP Global →" : "Se Connecter & Débloquer →"}</span>
              </button>
            </div>
          )}

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
          {loadingResources ? (
            <div className="grid gap-8 md:grid-cols-2 pt-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-white/10 bg-card/30 p-6 md:p-8 space-y-5 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-white/10 rounded-full" />
                      <div className="h-5 w-28 bg-white/5 rounded-full" />
                    </div>
                    <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-28 bg-white/5 rounded-2xl border border-white/5" />
                  </div>
                  <div className="h-11 w-full bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
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
                            className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-3 rounded-xl bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-center cursor-pointer transition-colors group"
                          >
                            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 sm:px-6 py-3 rounded-xl shadow-xl border border-white/20 group-hover:scale-[1.02] transition-transform text-center">
                              {!currentUser ? (
                                <>
                                  <LogIn className="size-4 shrink-0" />
                                  <span className="text-xs font-black">Se connecter pour débloquer tout le catalogue</span>
                                </>
                              ) : isSubPending ? (
                                <>
                                  <div className="flex items-center gap-1.5 font-black">
                                    <Clock className="size-4 shrink-0 animate-pulse" />
                                    <span className="text-xs font-black">Abonnement VIP en cours de validation (2h-4h)</span>
                                  </div>
                                  <span className="text-[10px] opacity-80 sm:border-l sm:border-slate-950/20 sm:pl-2">Réf: {subscriptionInfo?.transactionRef || "Soumis"}</span>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5 font-black">
                                    <Crown className="size-4 shrink-0" />
                                    <span className="text-xs font-black">Débloquer Tous les Prompts &amp; Replays</span>
                                  </div>
                                  <span className="text-[10px] opacity-80 sm:border-l sm:border-slate-950/20 sm:pl-2">Dès 10 000 FCFA</span>
                                </>
                              )}
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
          )}

          {!loadingResources && filteredResources.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm font-semibold">Aucune ressource ne correspond à votre recherche.</p>
            </div>
          )}

        </div>
      </section>

      {/* Modal d'Abonnement VIP */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={currentUser}
        sourceContext="prompt_library"
        onSuccess={() => {
          setIsUnlocked(true)
        }}
      />

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
