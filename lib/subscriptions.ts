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
  price3m: 10000,
  price1y: 30000,
  price3mDisplay: "10 000 FCFA",
  price1yDisplay: "30 000 FCFA"
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
