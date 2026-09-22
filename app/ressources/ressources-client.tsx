"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search, Copy, Check, Download, FileText, Sparkles, BookOpen, Lock, LogIn, Crown, Clock, Filter, Layers } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Header } from "@/components/header"
import { TabbedCourses } from "@/components/tabbed-courses"
import { CtaFooter } from "@/components/cta-footer"
import { GridBackground } from "@/components/grid-background"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { resourcesData, ResourceItem, RESOURCE_CATEGORIES } from "@/lib/resources-data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResourceOptinModal } from "@/components/resource-optin-modal"
import { SubscriptionModal } from "@/components/subscription-modal"
import { supabase } from "@/lib/supabase"

function getFileInfo(url?: string) {
  if (!url) return { name: "Document joint", ext: "FICHIER" }
  try {
    const clean = url.split("?")[0]
    const rawName = clean.split("/").pop() || "Document"
    const parts = rawName.split(".")
    const ext = parts.length > 1 ? parts.pop()?.toUpperCase() || "DOC" : "DOC"
    const readableName = decodeURIComponent(parts.join(".")).replace(/^\d+[-_]/, "").replace(/[-_]/g, " ")
    return { name: readableName || "Document prêt à l'emploi", ext }
  } catch {
    return { name: "Document joint", ext: "DOC" }
  }
}

export function RessourcesClient() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [search, setSearch] = useState("")
  const [formatFilter, setFormatFilter] = useState<'all' | 'prompt' | 'file' | 'bundle' | 'business-plan'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
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

      try {
        const subUrl = user?.email ? `/api/subscriptions?email=${encodeURIComponent(user.email)}` : "/api/subscriptions"
        const res = await fetch(subUrl)
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

  // Handle prompt copying with access checks
  const handleCopyPrompt = (item: ResourceItem, text: string) => {
    const isFree = item.tier === "Gratuit" || (item.tier !== "Membre Premium" && item.tier !== "VIP")

    // Only premium/VIP resources require authentication and active VIP subscription
    if (!isFree) {
      if (!currentUser) {
        router.push("/login?redirect=/ressources")
        return
      }
      if (!isUnlocked) {
        setShowSubscriptionModal(true)
        return
      }
    }

    executeCopy(item.id, text)
  }

  // Handle file downloading with direct URL or fallback
  const handleDownloadFile = (item: ResourceItem) => {
    const isFree = item.tier === "Gratuit" || (item.tier !== "Membre Premium" && item.tier !== "VIP")

    // Only premium/VIP resources require authentication and active VIP subscription
    if (!isFree) {
      if (!currentUser) {
        router.push("/login?redirect=/ressources")
        return
      }
      if (!isUnlocked) {
        setShowSubscriptionModal(true)
        return
      }
    }

    if (item.fileUrl) {
      window.open(item.fileUrl, "_blank", "noopener,noreferrer")
    } else {
      const title = item.title[language] || item.title.fr
      const waUrl = `https://wa.me/22675757273?text=${encodeURIComponent("Bonjour Le Guide IA, je souhaite recevoir le document/modèle gratuit pour la ressource : " + title)}`
      window.open(waUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleAction = (item: ResourceItem, title: string, content: string) => {
    if (item.hasText && !item.hasFile) {
      handleCopyPrompt(item, content)
    } else if (item.hasFile && !item.hasText) {
      handleDownloadFile(item)
    } else {
      handleCopyPrompt(item, content)
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
    const promptText = (r.prompt_text || r.content || "").trim()
    const rawFileUrl = (r.download_url || r.file_url || "").trim()
    const hasText = promptText.length > 0
    const hasFile = rawFileUrl.length > 0
    const category = r.category || "Autre"
    const catLower = category.toLowerCase()

    let itemType: 'prompt' | 'business-plan' | 'file' | 'bundle' = 'prompt'
    if (catLower.includes("business plan") || catLower.includes("plan d'affaires")) {
      itemType = "business-plan"
    } else if (hasText && hasFile) {
      itemType = "bundle"
    } else if (!hasText && hasFile) {
      itemType = "file"
    } else {
      itemType = "prompt"
    }

    return {
      id: r.id,
      type: itemType,
      title: { fr: r.title, en: r.title },
      desc: { fr: r.description || category || "Ressource certifiée Le Guide IA", en: r.description || category || "Ressource certifiée" },
      content: { fr: promptText, en: promptText },
      fileUrl: rawFileUrl || undefined,
      downloadUrl: rawFileUrl || undefined,
      sector: { fr: category, en: category },
      tier: r.access_level || r.tier || "Gratuit",
      hasText,
      hasFile,
      downloadsCount: r.downloads_count || 0
    }
  })

  // Filter & Search logic
  const filteredResources = currentResourcesMap.filter((item) => {
    // 1. Format Filter
    if (formatFilter === 'prompt' && (!item.hasText || item.hasFile)) return false
    if (formatFilter === 'file' && (item.hasText || !item.hasFile)) return false
    if (formatFilter === 'bundle' && (!item.hasText || !item.hasFile)) return false
    if (formatFilter === 'business-plan' && item.type !== 'business-plan') return false

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      const itemCat = (item.sector?.fr || "").toLowerCase()
      if (itemCat !== selectedCategory.toLowerCase()) return false
    }

    // 3. Search text
    if (search.trim()) {
      const q = search.toLowerCase()
      const titleText = (item.title[language] || item.title.fr || "").toLowerCase()
      const descText = (item.desc[language] || item.desc.fr || "").toLowerCase()
      const contentText = (item.content[language] || item.content.fr || "").toLowerCase()
      const sectorText = (item.sector?.fr || "").toLowerCase()
      const searchString = `${titleText} ${descText} ${contentText} ${sectorText}`
      if (!searchString.includes(q)) return false
    }
    
    return true
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
          {/* Header Left-Aligned */}
          <div className="space-y-4 text-left">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-purple-600 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
              <Sparkles className="size-3.5 text-purple-600" />
              BIBLIOTHÈQUE DE RESSOURCES IA &amp; BUSINESS PLANS
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-[#0E1E3F] leading-tight">
              Prompts IA Optimisés &amp;{" "}
              <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                Modèles de Business Plans
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Copiez plus de 100 prompts professionnels calibrés pour ChatGPT, Claude et Gemini, et téléchargez des modèles de projets d&apos;entreprise adaptés au contexte africain.
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
                <div className="size-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
                  {isSubPending ? <Clock className="size-6 text-slate-950 animate-pulse" /> : <Crown className="size-6 text-slate-950" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-heading font-black text-[#0E1E3F]">
                      {isSubPending
                        ? `Validation de votre Abonnement VIP en cours (${subscriptionInfo?.planLabel || "Pass VIP"})`
                        : "Pass VIP  — Accès à Tout le Catalogue"}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 border border-amber-400/40">
                      {isSubPending ? "⏳ Vérification sous 2h à 4h" : "1 Pass VIP Débloqué"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
                className={`w-full md:w-auto px-6 py-3 rounded-xl font-black text-xs shrink-0 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                  isSubPending
                    ? "bg-amber-500/30 text-amber-800 border border-amber-400/60 hover:bg-amber-500/40"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
              >
                {isSubPending ? <Clock className="size-4" /> : <Crown className="size-4" />}
                <span>{isSubPending ? "Voir l'état de validation →" : currentUser ? "Activer mon Pass VIP Global →" : "Se Connecter & Débloquer →"}</span>
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="space-y-3 border-y border-border/40 py-4 bg-card/10 backdrop-blur-md rounded-2xl px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Format Filters */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => setFormatFilter('all')}
                  className={cn(
                    "px-3.5 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border",
                    formatFilter === 'all'
                      ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  Tous ({currentResourcesMap.length})
                </button>
                <button
                  onClick={() => setFormatFilter('prompt')}
                  className={cn(
                    "px-3.5 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                    formatFilter === 'prompt'
                      ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/20"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <Sparkles className="size-3.5" />
                  Prompts IA
                </button>
                <button
                  onClick={() => setFormatFilter('file')}
                  className={cn(
                    "px-3.5 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                    formatFilter === 'file'
                      ? "bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <FileText className="size-3.5" />
                  Fichiers &amp; Modèles
                </button>
                <button
                  onClick={() => setFormatFilter('bundle')}
                  className={cn(
                    "px-3.5 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                    formatFilter === 'bundle'
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400 text-white shadow-sm shadow-purple-500/20"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <Layers className="size-3.5" />
                  Packs Complets
                </button>
                <button
                  onClick={() => setFormatFilter('business-plan')}
                  className={cn(
                    "px-3.5 py-2 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                    formatFilter === 'business-plan'
                      ? "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-sm shadow-amber-500/20"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <BookOpen className="size-3.5" />
                  Business Plans
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:max-w-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Search className="size-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par mot-clé, prompt..."
                  className="w-full rounded-xl border border-border/80 bg-card/40 py-2 pl-10 pr-8 text-xs text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:bg-card/60"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category / Domain Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Filter className="size-3.5 text-primary" />
                  Domaine :
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-card/60 border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary cursor-pointer font-medium max-w-[280px] truncate"
                >
                  <option value="all">Tous les domaines ({currentResourcesMap.length})</option>
                  {RESOURCE_CATEGORIES.map(cat => {
                    const count = currentResourcesMap.filter(r => (r.sector?.fr || "").toLowerCase() === cat.toLowerCase()).length
                    return (
                      <option key={cat} value={cat}>
                        {cat} {count > 0 ? `(${count})` : ''}
                      </option>
                    )
                  })}
                </select>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Réinitialiser le domaine
                  </button>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground font-medium">
                {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''} trouvée{filteredResources.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Grid of Prompts, Files & Bundles */}
          {loadingResources ? (
            <div className="grid gap-8 md:grid-cols-2 pt-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-card/30 p-6 md:p-8 space-y-5 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-slate-200 rounded-full" />
                      <div className="h-5 w-28 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-28 bg-[#F5F8FF] rounded-2xl border border-slate-200/70" />
                  </div>
                  <div className="h-11 w-full bg-slate-200 rounded-xl" />
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
                const isFree = item.tier === "Gratuit" || (item.tier !== "Membre Premium" && item.tier !== "VIP")
                const isAccessible = isFree || isUnlocked
                const fileInfo = getFileInfo(item.fileUrl)

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card/30 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/50 shadow-sm text-left"
                  >
                    <div>
                      {/* Header Badges */}
                      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border",
                            item.hasText && item.hasFile
                              ? "bg-purple-500/10 text-purple-700 border-purple-500/30"
                              : item.hasFile
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          )}>
                            {item.hasText && item.hasFile 
                              ? "📦 Pack Prompt + Fichier" 
                              : item.hasFile 
                              ? "📁 Document / Modèle" 
                              : "📝 Prompt IA"}
                          </span>

                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border",
                            isFree
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          )}>
                            {isFree ? "Gratuit" : "Pass VIP"}
                          </span>
                        </div>

                        {sector && (
                          <span className="text-[10px] text-muted-foreground font-semibold bg-card/60 border border-border/60 rounded-full px-2.5 py-1">
                            {sector}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-heading text-xl font-bold text-[#0E1E3F] mb-2 text-left">
                        {title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-5 text-left">
                        {desc}
                      </p>

                      {/* Content Section: Prompt Text and/or File Box */}
                      {item.hasText ? (
                        <div className="space-y-3 mb-6">
                          {/* Prompt preview container */}
                          <div className="relative">
                            {!isAccessible ? (
                              <div className="rounded-xl bg-[#F7F9FC] border border-primary/30 p-4 max-h-60 overflow-hidden text-xs md:text-sm leading-relaxed font-mono whitespace-pre-wrap select-none pointer-events-none text-left relative">
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
                                  <Sparkles className="size-3 text-amber-700" />
                                  <span>Aperçu en clair (Avant-goût) :</span>
                                </div>
                                <div className="text-[#0E1E3F] font-bold opacity-100 pb-1 leading-snug">
                                  {content.slice(0, 150)}...
                                </div>
                                <div className="blur-[7px] opacity-30 select-none pointer-events-none text-slate-500 mt-1">
                                  {content.slice(150)}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl bg-[#F7F9FC] border border-border/60 p-4 max-h-56 overflow-y-auto text-xs leading-relaxed text-slate-600 font-mono whitespace-pre-wrap transition-all duration-300 scrollbar-thin text-left select-all">
                                {content}
                              </div>
                            )}

                            {!isAccessible && (
                              <div
                                onClick={() => {
                                  if (!currentUser) router.push("/login?redirect=/ressources")
                                  else setShowSubscriptionModal(true)
                                }}
                                className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-3 rounded-xl bg-gradient-to-t from-white via-white/80 to-transparent text-center cursor-pointer transition-colors group"
                              >
                                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 sm:px-6 py-3 rounded-xl shadow-sm border border-slate-300 group-hover:scale-[1.02] transition-transform text-center">
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
                                      <span className="text-[10px] opacity-80 sm:border-l sm:border-slate-300 sm:pl-2">Réf: {subscriptionInfo?.transactionRef || "Soumis"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1.5 font-black">
                                        <Crown className="size-4 shrink-0" />
                                        <span className="text-xs font-black">Débloquer Tous les Prompts &amp; Replays</span>
                                      </div>
                                      <span className="text-[10px] opacity-80 sm:border-l sm:border-slate-300 sm:pl-2">Dès {subscriptionInfo?.pricing?.price3mDisplay || "9 000 FCFA"}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* File-Only Document Card (No empty prompt box) */
                        <div className="relative rounded-2xl bg-gradient-to-br from-white to-[#F5F8FF] border border-blue-500/20 p-5 space-y-3 mb-6 overflow-hidden">
                          <div className="flex items-start gap-3.5">
                            <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                              <FileText className="size-6" />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                  Document Prêt à l&apos;Emploi
                                </span>
                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                                  {fileInfo.ext}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-[#0E1E3F] truncate">
                                {fileInfo.name}
                              </p>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Document complet vérifié par l&apos;équipe Le Guide IA, téléchargeable et personnalisable immédiatement.
                              </p>
                            </div>
                          </div>

                          {!isAccessible && (
                            <div
                              onClick={() => {
                                if (!currentUser) router.push("/login?redirect=/ressources")
                                else setShowSubscriptionModal(true)
                              }}
                              className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white backdrop-blur-[2px] cursor-pointer text-center group"
                            >
                              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-sm group-hover:scale-105 transition-transform">
                                <Lock className="size-3.5" />
                                <span>{!currentUser ? "Se connecter pour télécharger" : "Débloquer le fichier"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons section */}
                    {isAccessible && (
                      <div className="pt-2">
                        {item.hasText && item.hasFile ? (
                          /* DUAL BUTTONS for Text + File */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(item, content)}
                              className="w-full rounded-xl font-extrabold text-xs py-3 px-4 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 bg-[#F5F8FF] hover:bg-[#EEF3FF] text-[#0E1E3F] border border-slate-300 shadow-xs"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="size-4 text-emerald-600 stroke-[3]" />
                                  <span className="text-emerald-600">{t("resourcesPage.copied")}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-4 text-purple-600" />
                                  <span>{t("resourcesPage.copyPrompt")}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadFile(item)}
                              className="w-full rounded-xl font-extrabold text-xs py-3 px-4 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/20"
                            >
                              <Download className="size-4" />
                              <span>Télécharger ({fileInfo.ext})</span>
                            </button>
                          </div>
                        ) : item.hasText ? (
                          /* SINGLE BUTTON: Prompt only */
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(item, content)}
                            className={cn(
                              buttonVariants({
                                variant: copiedId === item.id ? "default" : "outline"
                              }),
                              "w-full rounded-xl font-extrabold text-xs py-3 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
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
                          /* SINGLE BUTTON: File only */
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(item)}
                            className="w-full rounded-xl font-extrabold text-xs py-3 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/20 glow-blue"
                          >
                            <Download className="size-4" />
                            <span>Télécharger le modèle ({fileInfo.ext})</span>
                          </button>
                        )}
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
