export type SubscriptionPlan = "3_months" | "1_year" | "bootcamp_vip"
export type SubscriptionStatus = "active" | "pending" | "expired" | "cancelled"

export interface SubscriptionItem {
  id: string
  user_id?: string | null
  email: string
  full_name: string
  whatsapp?: string | null
  country?: string | null
  plan: SubscriptionPlan
  plan_label: string
  planLabel?: string
  amount: number
  currency: string
  status: SubscriptionStatus
  payment_method: string
  transaction_ref: string
  receipt_url?: string | null
  starts_at: string
  expires_at: string
  days_remaining?: number
  created_at: string
  notes?: any
}

export interface SubscriptionPricing {
  price3m: number
  price1y: number
  price3mDisplay: string
  price1yDisplay: string
}

export const DEFAULT_SUBSCRIPTION_PRICING: SubscriptionPricing = {
  price3m: 9000,
  price1y: 29000,
  price3mDisplay: "9 000 FCFA",
  price1yDisplay: "29 000 FCFA"
}

export function formatPriceFCFA(val: number | string): string {
  const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, ""), 10) || 0
  return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`
}

export function calculateSubscriptionExpiry(plan: SubscriptionPlan, startDate: Date = new Date()): Date {
  const expiry = new Date(startDate.getTime())
  if (plan === "3_months") {
    expiry.setDate(expiry.getDate() + 90) // 90 jours
  } else if (plan === "1_year") {
    expiry.setDate(expiry.getDate() + 365) // 365 jours
  } else if (plan === "bootcamp_vip") {
    expiry.setDate(expiry.getDate() + 365) // 1 an offert avec le bootcamp
  }
  return expiry
}

export function getDaysRemaining(expiresAtStr?: string | null): number {
  if (!expiresAtStr) return 0
  const expiresAt = new Date(expiresAtStr).getTime()
  const now = Date.now()
  const diffMs = expiresAt - now
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Avantages officiels de l'Abonnement "Le Cercle IA" (Issus du schéma du dispositif)
export const CERCLE_IA_BENEFITS = [
  {
    id: "veille",
    title: "Veille IA Hebdomadaire",
    badge: "Chaque Lundi",
    shortDesc: "Sélection stratégique d'actualités et cas d'usage concrets envoyée chaque lundi.",
    fullDesc: "Synthèse exclusive des dernières innovations IA, nouveaux outils et opportunités applicables directement à vos projets."
  },
  {
    id: "prompts",
    title: "Bibliothèque de Prompts & Business Plans",
    badge: "Enrichie Chaque Mois",
    shortDesc: "Accès illimité aux prompts métiers et modèles d'entreprise prêts à l'emploi.",
    fullDesc: "Une nouvelle série de prompts opérationnels et de matrices stratégiques ajoutée chaque mois."
  },
  {
    id: "replays",
    title: "Replays de toutes les Masterclasses",
    badge: "Accès Privé 100% HD",
    shortDesc: "Toutes les rediffusions privées des masterclasses du dimanche en illimité.",
    fullDesc: "Alors que le direct est ouvert à tous, les replays intégraux sont réservés exclusivement aux membres."
  },
  {
    id: "prolongation",
    title: "Prolongation Membres en Direct",
    badge: "Dernier Dimanche du Mois (16h30 - 17h30)",
    shortDesc: "1h d'échange privilégié et questions/réponses en direct avec Alfred Dah.",
    fullDesc: "À la fin de la masterclass mensuelle, le public sort et les membres du Cercle restent pour une session privée d'approfondissement."
  },
  {
    id: "groupe",
    title: "Groupe Privé & Communauté Fermée",
    badge: "Max 30 Places",
    shortDesc: "Réseau exclusif d'échange et d'entraide entre professionnels et entrepreneurs IA.",
    fullDesc: "Plafond strict de 30 membres pour garantir des interactions qualitatives et un accompagnement de proximité."
  },
  {
    id: "deduction",
    title: "100% Déductible du Prix du Bootcamp",
    badge: "Garantie 6 Mois",
    shortDesc: "Le montant de votre abonnement est déduit à 100% si vous rejoignez un Bootcamp.",
    fullDesc: "L'abonnement ne coûte donc rien à celui qui poursuit : vos cotisations réduisent directement le tarif de votre formation avancée."
  }
]

