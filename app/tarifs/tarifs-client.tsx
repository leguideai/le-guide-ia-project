"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { 
  Check, X, Sparkles, ArrowRight, Clock, ShieldCheck, 
  CheckCircle2, CreditCard, Smartphone, BookOpen, GraduationCap, 
  Building2, Star, Zap, Users, HelpCircle, ChevronDown, 
  ArrowUpRight, AlertCircle, Gift, Award, Lock, Play
} from "lucide-react"
import { Header } from "@/components/header"
import { GridBackground } from "@/components/grid-background"
import { CtaFooter } from "@/components/cta-footer"
import { ScrollToTop, WhatsAppFloat } from "@/components/whatsapp-float"
import { SubscriptionModal } from "@/components/subscription-modal"
import { SubscriptionPlan, DEFAULT_SUBSCRIPTION_PRICING, SubscriptionPricing } from "@/lib/subscriptions"
import { supabase } from "@/lib/supabase"
import { isCourseOpenForPublic } from "@/lib/courses-visibility"
import { useUserEnrollments } from "@/lib/user-enrollments"

function getOfferEndTimestamp(rawDate?: string | null): number | null {
  if (!rawDate || String(rawDate).trim() === "") return null
  const clean = String(rawDate).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }
  if (clean.includes("T00:00:00")) {
    const datePart = clean.split("T")[0]
    const [y, m, d] = datePart.split("-").map(Number)
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()
    return isNaN(endOfDay) ? null : endOfDay
  }
  const parsed = new Date(clean).getTime()
  return isNaN(parsed) ? null : parsed
}

export function TarifsClient() {
  const { isEnrolledInCourse, isPendingInCourse } = useUserEnrollments()
  
  // Billing cycle for Cercle IA subscription (3 months vs 1 year)
  const [subCycle, setSubCycle] = useState<"3_months" | "1_year">("1_year")
  
  // Tier toggle for Bootcamp Pro: "offer" (avec décompte) vs "fondateur" (prix fondateur)
  const [proBootcampTier, setProBootcampTier] = useState<"offer" | "fondateur">("offer")

  // Tier toggle for Bootcamp Business: "offer" (avec décompte) vs "fondateur" (prix fondateur)
  const [bizBootcampTier, setBizBootcampTier] = useState<"offer" | "fondateur">("offer")
  
  // Subscription Modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [selectedSubPlan, setSelectedSubPlan] = useState<SubscriptionPlan>("1_year")
  
  // Dynamic courses from Supabase
  const [courses, setCourses] = useState<any[]>([])
  const [activeBootcamp, setActiveBootcamp] = useState<any>(null)
  const [businessBootcamp, setBusinessBootcamp] = useState<any>(null)
  
  // Pricing config
  const [subPricing, setSubPricing] = useState<SubscriptionPricing>(DEFAULT_SUBSCRIPTION_PRICING)
  
  // Countdown timer for active promo
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isOfferExpired, setIsOfferExpired] = useState(false)
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function loadInitialData() {
      // User session
      const { data: authData } = await supabase.auth.getUser()
      setCurrentUser(authData?.user || null)

      // Fetch dynamic subscription prices from settings
      try {
        const subRes = await fetch("/api/subscriptions")
        const subData = await subRes.json()
        if (subData?.pricing) {
          setSubPricing(subData.pricing)
        }
      } catch (_) {}

      // Fetch published courses
      try {
        const { data: cData } = await supabase
          .from("courses")
          .select("*")
          .order("sequence_order", { ascending: true })

        if (cData && cData.length > 0) {
          const publicCourses = cData.filter(isCourseOpenForPublic)
          setCourses(publicCourses)

          // Find Pro / Career bootcamp
          const pro = publicCourses.find(c => {
            const s = String(c.slug || "").toLowerCase()
            const t = String(c.title || "").toLowerCase()
            return (s.includes("pro") || s.includes("carriere") || s.includes("bootcamp-ia")) && !s.includes("business") && !t.includes("business")
          }) || publicCourses[0]
          setActiveBootcamp(pro)

          // Find Business bootcamp
          const biz = publicCourses.find(c => {
            const s = String(c.slug || "").toLowerCase()
            const t = String(c.title || "").toLowerCase()
            return s.includes("business") || s.includes("dirigeant") || t.includes("business") || t.includes("dirigeant")
          })
          setBusinessBootcamp(biz)
        }
      } catch (_) {}
    }

    loadInitialData()
  }, [])

  // Timer countdown
  useEffect(() => {
    const target = getOfferEndTimestamp(activeBootcamp?.offer_end_date)
    if (!target) {
      setIsOfferExpired(false)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) {
        setIsOfferExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setIsOfferExpired(false)
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [activeBootcamp?.offer_end_date])

  const openSubscription = (plan: SubscriptionPlan) => {
    setSelectedSubPlan(plan)
    setIsSubModalOpen(true)
  }

  // Helper to safely parse and clean any price field from DB or props
  const parsePrice = (val: any, fallback: number): number => {
    if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
      return fallback
    }
    if (typeof val === "number") {
      return isNaN(val) || val <= 0 ? fallback : val
    }
    const cleaned = String(val).replace(/[^0-9]/g, "")
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) || parsed <= 0 ? fallback : parsed
  }

  // Formatting helpers - strictly bulletproof against NaN
  const formatFCFA = (amount: number | string) => {
    if (amount === undefined || amount === null) return "0 FCFA"
    let num: number
    if (typeof amount === "number") {
      num = isNaN(amount) ? 0 : amount
    } else {
      const cleaned = String(amount).replace(/[^0-9]/g, "")
      num = parseInt(cleaned, 10) || 0
    }
    if (num <= 0) return "0 FCFA"
    return `${num.toLocaleString("fr-FR")} FCFA`
  }

  // Bootcamp prices (100% immune to NaN)
  const proPromoPrice = parsePrice(activeBootcamp?.price, 99000)
  const proOriginalPrice = parsePrice(activeBootcamp?.original_price, 149000)

  const rawBizPrice = parsePrice(businessBootcamp?.price, 149000)
  const rawBizOriginal = parsePrice(businessBootcamp?.original_price, 199000)
  
  const bizPromoPrice = rawBizOriginal > rawBizPrice 
    ? rawBizPrice 
    : (rawBizPrice <= 150000 ? rawBizPrice : 149000)
  const bizOriginalPrice = rawBizOriginal > rawBizPrice 
    ? rawBizOriginal 
    : (rawBizPrice > 150000 ? rawBizPrice : 199000)

  // Comparison matrix items grouped by domain (comparing 3 core paid offerings)
  const COMPARISON_SECTIONS = [
    {
      domain: "Masterclasses & Événements Hebdomadaires",
      features: [
        {
          name: "Accès aux Masterclasses Google Meet du dimanche en direct",
          desc: "Sessions interactives de 1h30 animées par Alfred Dah chaque dimanche",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Questions / Réponses ouvertes en direct",
          desc: "Possibilité d'interagir et poser vos questions pendant la session",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Accès illimité aux Replays HD des Masterclasses",
          desc: "Toutes les rediffusions vidéo des masterclasses passées et futures",
          vip: "Illimité",
          pro: "1 an inclus",
          biz: "1 an inclus",
        },
        {
          name: "Prolongation Membres VIP en direct (1h exclusive)",
          desc: "Échange privé et coaching avancé le dernier dimanche du mois (16h30 - 17h30)",
          vip: true,
          pro: true,
          biz: true,
        },
      ]
    },
    {
      domain: "Bibliothèque de Prompts & Boîte à Outils",
      features: [
        {
          name: "Bibliothèque complète +100 Prompts Métiers prêts à l'emploi",
          desc: "Marketing, Vente, Rédaction, RH, Juridique, Finance, Automatisation",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Modèles complets de Business Plans africains",
          desc: "Matrices Word/Excel adaptées aux secteurs porteurs en Afrique francophone",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Mises à jour mensuelles de nouveaux prompts & matrices",
          desc: "Enrichissement continu de la bibliothèque chaque mois",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Veille IA Stratégique hebdomadaire (chaque lundi)",
          desc: "Synthèse exclusive d'outils, cas d'usage concrets et opportunités",
          vip: true,
          pro: true,
          biz: true,
        },
      ]
    },
    {
      domain: "Formation Intensive & Pratique en Direct (Bootcamps)",
      features: [
        {
          name: "Cohorte intensive en direct avec Alfred Dah",
          desc: "Formation accélérée interactive de 14 heures réparties sur 6 sessions",
          vip: false,
          pro: "6 sessions (14h)",
          biz: "6 sessions + Masterclass Dirigeants",
        },
        {
          name: "Ateliers sur ChatGPT, Claude, Gemini, Make et Canva IA",
          desc: "Manipulation concrète d'outils professionnels sur des cas réels",
          vip: false,
          pro: true,
          biz: true,
        },
        {
          name: "Automatisation de processus métiers (Make / n8n / Zapier)",
          desc: "Création de workflows autonomes pour démultiplier votre productivité",
          vip: false,
          pro: "Workflows standards",
          biz: "Workflows avancés & CRM",
        },
        {
          name: "Masterclass Exécutive spéciale Dirigeants & Chefs d'Entreprise",
          desc: "Gouvernance, audit IA, retour sur investissement et stratégie d'entreprise",
          vip: false,
          pro: false,
          biz: true,
        },
        {
          name: "Audit & Diagnostic de maturité IA sur vos processus",
          desc: "Analyse personnalisée des opportunités d'automatisation de votre activité",
          vip: false,
          pro: false,
          biz: true,
        },
        {
          name: "Accès à vie aux enregistrements de votre cohorte",
          desc: "Revoir les cours du bootcamp à tout moment sans limite de temps",
          vip: false,
          pro: true,
          biz: true,
        },
      ]
    },
    {
      domain: "Réseau, Communauté & Accompagnement",
      features: [
        {
          name: "Groupe privé VIP WhatsApp restreint",
          desc: "Échanges privilégiés de proximité entre membres actifs du Cercle IA",
          vip: true,
          pro: true,
          biz: true,
        },
        {
          name: "Salon privé WhatsApp de cohorte d'entraide",
          desc: "Émulation quotidienne, feedbacks sur vos exercices et networking",
          vip: false,
          pro: true,
          biz: true,
        },
        {
          name: "Revue de CV format ATS & Optimisation de profil LinkedIn IA",
          desc: "Positionnement professionnel valorisant vos compétences IA sur le marché",
          vip: false,
          pro: true,
          biz: true,
        },
        {
          name: "Coaching stratégique individuel et feedback sur vos projets",
          desc: "Accompagnement VIP sur mesure par Alfred Dah",
          vip: false,
          pro: "Collectif",
          biz: "Individuel dédié",
        },
      ]
    },
    {
      domain: "Certifications & Avantages Financiers",
      features: [
        {
          name: "Certificat officiel de réussite Le Guide IA vérifiable",
          desc: "Attestation officielle avec ID unique pour valoriser votre parcours",
          vip: false,
          pro: "Certificat Pro",
          biz: "Certificat Exécutif Dirigeant",
        },
        {
          name: "100% Déductible du prix du Bootcamp sous 6 mois",
          desc: "Le montant de votre abonnement VIP est soustrait du prix de votre formation",
          vip: "Garantie 6 mois",
          pro: "Déjà inclus",
          biz: "Déjà inclus",
        },
        {
          name: "Abonnement VIP au Cercle IA offert (valeur 29 000 FCFA)",
          desc: "1 an d'accès complet à tous les replays et prompts offert sans surcoût",
          vip: "Offre standard",
          pro: "1 an offert",
          biz: "1 an offert",
        },
        {
          name: "Facture officielle ou devis proforma d'entreprise",
          desc: "Prise en charge par votre employeur ou déductible des charges",
          vip: true,
          pro: true,
          biz: true,
        },
      ]
    },
  ]

  const FAQ_ITEMS = [
    {
      q: "Comment fonctionnent les tarifs des Bootcamps (Offre Promo vs Tarif Standard) ?",
      a: "Pour chaque cohorte, nous proposons deux niveaux de tarification transparents :\n• L'Offre Promo (avec compte à rebours) : Un tarif préférentiel temporaire (99 000 FCFA pour le Bootcamp Carrière et 149 000 FCFA pour le Bootcamp Business). Il ne s'agit pas d'un prix définitif : cette offre est soumise à une date limite stricte indiquée par le décompteur en temps réel sur la page.\n• Le Tarif Standard Officiel : C'est le prix régulier définitif de la formation (149 000 FCFA pour Carrière et 199 000 FCFA pour Business). Dès que le compte à rebours atteint zéro ou que les places allouées à la promo sont épuisées, les inscriptions basculent automatiquement et irréversiblement au tarif standard officiel."
    },
    {
      q: "Que se passe-t-il lorsque le compte à rebours de l'Offre Promo expire ?",
      a: "Dès que le délai expire (chronomètre à 0j 0h 0m 0s), l'accès à la réduction de 50 000 FCFA est immédiatement clôturé. Le bouton de réservation bascule alors sur le Tarif Standard officiel (149 000 FCFA pour le Bootcamp Carrière et 199 000 FCFA pour le Bootcamp Business). Pour bénéficier du tarif préférentiel, il est indispensable de finaliser votre inscription avant l'échéance du décompte."
    },
    {
      q: "Quel Bootcamp choisir entre le parcours Carrière et le parcours Business ?",
      a: "• Le Bootcamp IA & Carrière (actuellement à 99 000 FCFA en offre promo temporaire au lieu de 149 000 FCFA au tarif standard) s'adresse aux salariés, cadres, consultants et freelances souhaitant automatiser leurs tâches, gagner 2 à 3 heures par jour, maîtriser ChatGPT, Claude, Make, optimiser leur CV au format ATS et booster leur employabilité.\n• Le Bootcamp IA & Business (actuellement à 149 000 FCFA en offre promo temporaire au lieu de 199 000 FCFA au tarif standard) est conçu pour les entrepreneurs, fondateurs de startups et directeurs d'entreprises : il inclut la masterclass exécutive, l'audit de maturité IA de leur organisation, les business models IA, les workflows de prospection et un coaching stratégique personnalisé."
    },
    {
      q: "Comment fonctionne la déduction à 100% de l'Abonnement VIP sur le Bootcamp ?",
      a: "C'est notre garantie sans risque : si vous souscrivez au Pass VIP Le Cercle IA (9 000 FCFA pour 3 mois ou 29 000 FCFA pour 1 an) et décidez ensuite de rejoindre un Bootcamp IA dans un délai de 6 mois, la totalité des sommes déjà versées pour votre abonnement est intégralement déduite du prix de votre inscription au Bootcamp (qu'elle soit en offre promo ou au tarif standard). Votre abonnement ne vous coûte donc rien !"
    },
    {
      q: "Quelle est la différence entre l'Abonnement Le Cercle IA et les Bootcamps certifiants ?",
      a: "L'Abonnement Le Cercle IA est une adhésion continue en auto-formation : il donne un accès illimité à tous les Replays HD des masterclasses passées et futures, à la bibliothèque de plus de 100 prompts métiers et à 1h de coaching mensuel privé chaque dernier dimanche du mois. Les Bootcamps sont des formations intensives certifiantes de 14h en direct live (6 sessions interactives) avec apprentissage pas à pas, corrections directes de vos projets par Alfred Dah, livrables concrets et certificat officiel vérifiable."
    },
    {
      q: "Quels sont les modes de paiement acceptés pour les abonnements et formations ?",
      a: "Nous acceptons les paiements directs par Mobile Money : Wave et Orange Money via notre numéro officiel unique +226 75 75 72 73 (bénéficiaire Sanson Alfred Dah). Pour les paiements internationaux et la diaspora, les cartes bancaires (Visa, Mastercard) sont prises en charge via Stripe. Pour les entreprises, nous émettons également des factures proforma pour virement bancaire."
    },
    {
      q: "Les replays des sessions sont-ils limités dans le temps ?",
      a: "Non ! Pour les participants inscrits aux Bootcamps, l'accès aux enregistrements complets de leur cohorte est garanti à vie dans leur Espace Membre. Pour les abonnés au Cercle IA, l'accès à tous les replays des masterclasses passées et à venir est illimité pendant toute la durée de validité de leur abonnement (3 mois ou 1 an)."
    },
    {
      q: "Est-ce qu'une facture officielle est délivrée pour ma société ?",
      a: "Oui, un reçu détaillé ainsi qu'une facture officielle avec identification fiscale peuvent être émis pour chaque souscription ou formation, ce qui vous permet de vous faire rembourser par votre entreprise ou de déduire la dépense de vos charges professionnelles."
    }
  ]

  return (
    <main className="relative min-h-screen text-foreground overflow-x-hidden bg-[#090d16]">
      <GridBackground />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 md:pt-16 md:pb-12 px-4 sm:px-6 md:px-8 border-b border-border/40 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-gradient-to-tr from-primary/25 via-purple-600/15 to-[#D4AF37]/15 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-5 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="size-3.5 animate-pulse text-amber-300" />
            <span>GRILLE TARIFAIRE OFFICIELLE · 3 FORMULES CLAIRES</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] w-full text-center">
            Investissez dans vos compétences IA avec une <span className="bg-gradient-to-r from-primary via-purple-300 to-[#D4AF37] bg-clip-text text-transparent">transparence absolue</span>
          </h1>

          <p className="text-sm sm:text-base md:text-sm text-slate-300 w-full text-center max-w-2xl mx-auto leading-relaxed">
            Choisissez la formule adaptée à vos objectifs : boîte à outils continue avec l'abonnement VIP, ou formation intensive certifiante en direct live avec tarif promotionnel temporaire ou tarif standard.
          </p>

        </div>
      </section>

      {/* Main 3 Pricing Cards Grid */}
      <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8" id="grille-tarifs">
        
        {/* Exact 3 Cards Grid */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          
          {/* CARD 1: Abonnement « Le Cercle IA » avec Toggle des prix intégré */}
          <div className="rounded-3xl border-2 border-purple-500 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-purple-950/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-bl-xl shadow-sm">
              BOÎTE À OUTILS CONTINUE
            </div>

            <div className="space-y-6">
              
              {/* Card Header */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/40">
                  PASS REPLAYS & PROMPTS
                </span>
                <h3 className="font-heading text-2xl font-black text-white">Le Cercle IA</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tous les replays HD des masterclasses + plus de 100 prompts et matrices prêts à l'emploi en accès illimité.
                </p>
              </div>

              {/* Price Toggle Switcher on the Card */}
              <div className="bg-slate-900/90 border border-purple-500/40 p-1.5 rounded-2xl space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setSubCycle("3_months")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      subCycle === "3_months"
                        ? "bg-purple-600 text-white shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>3 Mois</span>
                  </button>
                  <button
                    onClick={() => setSubCycle("1_year")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                      subCycle === "1_year"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>1 An</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Display */}
              <div className="space-y-1 text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl sm:text-4xl font-black text-white">
                    {subCycle === "3_months" ? "9 000 FCFA" : "29 000 FCFA"}
                  </span>
                  <span className="text-xs text-purple-300 font-bold">
                    {subCycle === "3_months" ? "/ 3 mois" : "/ 1 an"}
                  </span>
                </div>
              </div>

              {/* Feature List */}
              <div className="border-t border-border/60 pt-5 space-y-3 text-xs text-slate-200 text-left">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Accès illimité à TOUS les Replays HD</strong> des masterclasses passées et futures</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Bibliothèque complète +100 Prompts</strong> métiers opérationnels</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Modèles complets de Business Plans</strong> adaptés au contexte africain</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Prolongation Membres 1h en direct</strong> avec Alfred Dah (dernier dimanche du mois)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Veille IA stratégique</strong> envoyée chaque lundi</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Groupe privé WhatsApp</strong> restreint (max 30 membres)</span>
                </div>
                
                {/* Deduction Guarantee Highlight */}
                <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-[11px] text-amber-200 font-semibold space-y-1 mt-3">
                  <div className="flex items-center gap-1 font-extrabold text-amber-300">
                    <Sparkles className="size-3.5" />
                    <span>100% DÉDUCTIBLE DU BOOTCAMP</span>
                  </div>
                  <p className="leading-tight text-[10.5px]">
                    Votre abonnement est intégralement déduit si vous rejoignez un Bootcamp dans les 6 mois !
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => openSubscription(subCycle)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <span>Souscrire au Pass ({subCycle === "3_months" ? "9 000 FCFA" : "29 000 FCFA"})</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: Bootcamp IA & Carrière (Certifiant Pro) */}
          <div className="rounded-3xl border-2 border-primary glow-blue bg-slate-950 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 bg-primary text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-bl-xl shadow-sm">
              LE PROGRAMME INTENSIF
            </div>

            <div className="space-y-6">
              
              {/* Card Header */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/20 px-2.5 py-1 rounded-md border border-primary/40">
                  FORMATION INTENSIVE EN DIRECT
                </span>
                <h3 className="font-heading text-2xl font-black text-white">Bootcamp IA & Carrière</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  14h de formation live sur 6 sessions interactives pour automatiser vos tâches et propulser votre carrière.
                </p>
              </div>

              {/* Price Toggle Switcher for Bootcamp Pro */}
              <div className="bg-slate-900/90 border border-primary/40 p-1.5 rounded-2xl">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setProBootcampTier("offer")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      proBootcampTier === "offer"
                        ? "bg-primary text-slate-950 shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Clock className="size-3.5 shrink-0" />
                    <span>Offre Promo</span>
                  </button>
                  <button
                    onClick={() => setProBootcampTier("fondateur")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      proBootcampTier === "fondateur"
                        ? "bg-slate-800 text-white border border-white/20 shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="size-3.5 shrink-0" />
                    <span>Tarif Standard</span>
                  </button>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-2 text-left pt-1">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-heading text-3xl sm:text-4xl font-black text-white">
                    {proBootcampTier === "offer"
                      ? formatFCFA(isOfferExpired ? proOriginalPrice : proPromoPrice)
                      : formatFCFA(proOriginalPrice)}
                  </span>
                  {proBootcampTier === "offer" && !isOfferExpired && (
                    <span className="text-sm line-through text-slate-400 font-bold">
                      {formatFCFA(proOriginalPrice)}
                    </span>
                  )}
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                    proBootcampTier === "offer" && !isOfferExpired
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}>
                    {proBootcampTier === "offer" && !isOfferExpired ? "Offre Promo Temporaire" : "Tarif Standard Officiel"}
                  </span>
                </div>
                
                {proBootcampTier === "offer" ? (
                  !isOfferExpired && timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
                    <div className="space-y-1.5">
                      <div className="py-2.5 px-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
                        <Clock className="size-4 animate-pulse text-amber-400 shrink-0" />
                        <span>Fin de l'offre : <strong className="text-white">{timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong></span>
                      </div>
                     
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="size-4 text-amber-400 shrink-0" />
                      <span>Offre promo échue — Le tarif standard officiel de {formatFCFA(proOriginalPrice)} s'applique désormais.</span>
                    </div>
                  )
                ) : (
                  <></>
                )}
              </div>

              {/* Feature List */}
              <div className="border-t border-border/60 pt-5 space-y-3 text-xs text-slate-200 text-left">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">14h de formation en direct live</strong> (6 sessions interactives)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Cas pratiques sur cas réels</strong> : ChatGPT, Claude, Gemini, Canva IA</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Automatisation de tâches</strong> avec Make / n8n sans coder</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Accompagnement & corrections directes</strong> par Alfred Dah</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Replays HD accessibles à vie</strong> dans votre espace membre</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Optimisation de votre CV format ATS</strong> et profil LinkedIn IA</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Certificat Officiel vérifiable</strong> Le Guide IA</span>
                </div>

                {/* VIP bonus box */}
                <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-[11px] text-sky-200 font-semibold space-y-1 mt-3">
                  <div className="flex items-center gap-1 font-extrabold text-primary">
                    <Gift className="size-3.5" />
                    <span>CADEAU INCLUS (VALEUR 29 000 FCFA)</span>
                  </div>
                  <p className="text-[10.5px]">1 an d'accès VIP complet au Cercle IA offert avec votre inscription !</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={`/checkout/${activeBootcamp?.slug || "bootcamp-ia-pro"}${
                  proBootcampTier === "fondateur" || isOfferExpired ? "?tier=standard" : "?tier=offer"
                }`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-primary/25"
              >
                <span>
                  {proBootcampTier === "offer" && !isOfferExpired
                    ? `Profiter de l'Offre Promo (${formatFCFA(proPromoPrice)})`
                    : `S'inscrire au Tarif Standard (${formatFCFA(proOriginalPrice)})`}
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* CARD 3: Bootcamp IA & Business / Dirigeants */}
          <div className="rounded-3xl border-2 border-[#D4AF37] glow-gold bg-slate-950 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-bl-xl shadow-sm">
              EXCLUSIVE MANAGERS & DIRIGEANTS
            </div>

            <div className="space-y-6">
              
              {/* Card Header */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ECC86B] bg-[#D4AF37]/20 px-2.5 py-1 rounded-md border border-[#D4AF37]/40">
                  LEADERSHIP & ENTREPRENEURIAT
                </span>
                <h3 className="font-heading text-2xl font-black text-white">Bootcamp IA & Business</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour chefs d'entreprise, fondateurs et dirigeants : intégrez l'IA au cœur de vos opérations et créez un avantage compétitif durable.
                </p>
              </div>

              {/* Price Toggle Switcher for Bootcamp Business */}
              <div className="bg-slate-900/90 border border-[#D4AF37]/40 p-1.5 rounded-2xl">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setBizBootcampTier("offer")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      bizBootcampTier === "offer"
                        ? "bg-[#D4AF37] text-slate-950 shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Clock className="size-3.5 shrink-0" />
                    <span>Offre Promo</span>
                  </button>
                  <button
                    onClick={() => setBizBootcampTier("fondateur")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      bizBootcampTier === "fondateur"
                        ? "bg-slate-800 text-white border border-white/20 shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="size-3.5 shrink-0" />
                    <span>Tarif Standard</span>
                  </button>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-2 text-left pt-1">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-heading text-3xl sm:text-4xl font-black text-white">
                    {bizBootcampTier === "offer"
                      ? formatFCFA(isOfferExpired ? bizOriginalPrice : bizPromoPrice)
                      : formatFCFA(bizOriginalPrice)}
                  </span>
                  {bizBootcampTier === "offer" && !isOfferExpired && (
                    <span className="text-sm line-through text-slate-400 font-bold">
                      {formatFCFA(bizOriginalPrice)}
                    </span>
                  )}
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                    bizBootcampTier === "offer" && !isOfferExpired
                      ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#ECC86B]"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}>
                    {bizBootcampTier === "offer" && !isOfferExpired ? "Offre Promo Temporaire" : "Tarif Standard Officiel"}
                  </span>
                </div>
                
                {bizBootcampTier === "offer" ? (
                  !isOfferExpired && timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
                    <div className="space-y-1.5">
                      <div className="py-2.5 px-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-mono font-bold flex items-center gap-2">
                        <Clock className="size-4 animate-pulse text-[#D4AF37] shrink-0" />
                        <span>Fin de l'offre : <strong className="text-white">{timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong></span>
                      </div>
                    
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="size-4 text-[#D4AF37] shrink-0" />
                      <span>Offre promo échue — Le tarif standard officiel de {formatFCFA(bizOriginalPrice)} s'applique désormais.</span>
                    </div>
                  )
                ) : (
                 <></>
                )}
              </div>

              {/* Feature List */}
              <div className="border-t border-border/60 pt-5 space-y-3 text-xs text-slate-200 text-left">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Tout le programme Carrière inclus</strong> (14h de sessions live)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Masterclass Exécutive Dirigeants</strong> & Stratégie d'Entreprise</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Audit de maturité IA</strong> et diagnostic sur vos processus métiers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Workflows de prospection & CRM</strong> Make / n8n / Agents IA</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Modèles de Business Plans investisseurs</strong> & pitch decks IA</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Revue de gouvernance & sécurité</strong> des données sensibles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="font-medium"><strong className="text-white">Certificat Exécutif Dirigeant</strong> officiel Le Guide IA</span>
                </div>

                {/* Gold bonus box */}
                <div className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3 text-[11px] text-[#F3E5AB] font-semibold space-y-1 mt-3">
                  <div className="flex items-center gap-1 font-extrabold text-[#D4AF37]">
                    <Award className="size-3.5" />
                    <span>COACHING & 1 AN VIP INCLUS</span>
                  </div>
                  <p className="text-[10.5px]">Revue stratégique personnalisée de vos livrables + 1 an de Pass Cercle IA offert.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={`/checkout/${businessBootcamp?.slug || "bootcamp-ia-business"}${
                  bizBootcampTier === "fondateur" || isOfferExpired ? "?tier=standard" : "?tier=offer"
                }`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-[#D4AF37]/25"
              >
                <span>
                  {bizBootcampTier === "offer" && !isOfferExpired
                    ? `Profiter de l'Offre Promo (${formatFCFA(bizPromoPrice)})`
                    : `S'inscrire au Tarif Standard (${formatFCFA(bizOriginalPrice)})`}
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Discrete B2B Banner underneath the 3 cards */}
        <div className="rounded-2xl border border-border/80 bg-slate-900/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-white">
                Besoin d'une formation sur-mesure pour vos équipes ou votre entreprise ?
              </h4>
              <p className="text-xs text-muted-foreground">
                Sessions intra-entreprise, diagnostic de maturité digitale et facturation avec devis proforma en 24h.
              </p>
            </div>
          </div>
          <Link
            href="/entreprises"
            className="px-5 py-2.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold text-xs transition-all shrink-0 inline-flex items-center gap-1.5"
          >
            <span>Espace Entreprises (B2B)</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

      </section>

      {/* Feature Comparison Matrix (Domain by Domain comparing the 3 cards) */}
      <section className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 bg-slate-950/70 border-t border-border/60">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="space-y-2 text-center w-full">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20 inline-flex">
              TABLEAU COMPARATIF DÉTAILLÉ
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white w-full text-center">
              Que recevez-vous concrètement selon votre formule ?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 w-full text-center max-w-3xl mx-auto">
              Comparez les services inclus par domaine d'expertise entre l'Abonnement Le Cercle IA et nos deux Bootcamps intensifs (Offre Promo temporaire vs Tarif Standard officiel).
            </p>
          </div>

          {/* Desktop Matrix Table */}
          <div className="rounded-3xl border border-border/80 bg-card/30 overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-border/80 bg-slate-900/90 text-white">
                    <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-2/5">
                      Services & Livrables Inclus
                    </th>
                    <th className="p-5 text-center text-xs font-extrabold uppercase tracking-wider w-1/5 text-purple-300 bg-purple-950/30">
                      <div>Pass Cercle IA</div>
                      <div className="text-[10px] font-normal text-purple-300/80 mt-1">9 000 ou 29 000 FCFA</div>
                    </th>
                    <th className="p-5 text-center text-xs font-extrabold uppercase tracking-wider w-1/5 text-primary bg-primary/10">
                      <div>Bootcamp Carrière</div>
                      <div className="text-[10px] font-normal text-sky-300 mt-1">Promo: 99 000 · Std: 149 000 FCFA</div>
                    </th>
                    <th className="p-5 text-center text-xs font-extrabold uppercase tracking-wider w-1/5 text-[#ECC86B] bg-[#D4AF37]/10">
                      <div>Bootcamp Business</div>
                      <div className="text-[10px] font-normal text-amber-300 mt-1">Promo: 149 000 · Std: 199 000 FCFA</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {COMPARISON_SECTIONS.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      {/* Section Header Row */}
                      <tr className="bg-slate-900/60">
                        <td colSpan={4} className="py-3 px-5 text-xs font-black uppercase tracking-wider text-slate-300 bg-white/5">
                          {section.domain}
                        </td>
                      </tr>

                      {/* Feature Rows */}
                      {section.features.map((feat, fIdx) => (
                        <tr key={fIdx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 sm:px-5">
                            <p className="font-bold text-slate-100">{feat.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{feat.desc}</p>
                          </td>

                          {/* VIP column */}
                          <td className="p-4 text-center bg-purple-950/15">
                            {typeof feat.vip === "boolean" ? (
                              feat.vip ? (
                                <CheckCircle2 className="size-4 text-purple-400 mx-auto" />
                              ) : (
                                <span className="text-slate-600">—</span>
                              )
                            ) : (
                              <span className="font-bold text-purple-300">{feat.vip}</span>
                            )}
                          </td>

                          {/* Pro Bootcamp column */}
                          <td className="p-4 text-center bg-primary/5">
                            {typeof feat.pro === "boolean" ? (
                              feat.pro ? (
                                <CheckCircle2 className="size-4 text-primary mx-auto" />
                              ) : (
                                <span className="text-slate-600">—</span>
                              )
                            ) : (
                              <span className="font-bold text-primary">{feat.pro}</span>
                            )}
                          </td>

                          {/* Business Bootcamp column */}
                          <td className="p-4 text-center bg-[#D4AF37]/5">
                            {typeof feat.biz === "boolean" ? (
                              feat.biz ? (
                                <CheckCircle2 className="size-4 text-[#D4AF37] mx-auto" />
                              ) : (
                                <span className="text-slate-600">—</span>
                              )
                            ) : (
                              <span className="font-bold text-[#ECC86B]">{feat.biz}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 bg-card/5 border-t border-border/60">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="space-y-2 text-center w-full">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-flex">
              QUESTIONS FRÉQUENTES & MODALITÉS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white w-full text-center">
              Tout ce que vous devez savoir sur nos tarifs & offres promotionnelles
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 w-full text-center max-w-2xl mx-auto leading-relaxed">
              Clarifications détaillées sur les offres promo à durée limitée avec compte à rebours, les tarifs standards officiels et nos garanties.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-card/40 overflow-hidden backdrop-blur-md transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-border/40 pt-3 whitespace-pre-line">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-3">
            <h4 className="font-heading text-sm font-bold text-white">
              Une question spécifique sur les tarifs ou votre mode de paiement ?
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Notre équipe vous répond directement sur WhatsApp pour vérifier la disponibilité de l'offre promotionnelle ou vous accompagner dans votre inscription.
            </p>
            <a
              href="https://wa.me/22675757273?text=Bonjour%20Alfred,%20j'ai%20une%20question%20sur%20les%20tarifs%20et%20le%20paiement"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <span>Discuter avec l'équipe sur WhatsApp</span>
              <ArrowUpRight className="size-4" />
            </a>
          </div>

        </div>
      </section>

      {/* Footer */}
      <CtaFooter />

      {/* Floating Elements */}
      <ScrollToTop />
      <WhatsAppFloat />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        user={currentUser}
        initialPlan={selectedSubPlan}
        sourceContext="dashboard"
      />
    </main>
  )
}
