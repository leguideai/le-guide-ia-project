export interface FormationStat {
  label: string
  value: string
}

export interface FormationTestimonial {
  quote: string
  author_name: string
  author_role?: string
  avatar_initials?: string
  rating?: number
}

export interface FormationCategory {
  id: string
  slug: string
  label: string
  icon?: string
  order_index?: number
  is_active?: boolean
}

export interface FormationItem {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  badge?: "Best-seller" | "Forte demande" | "Nouveau" | "Prospection" | "Recommandé" | string
  tool_icon: "claude" | "chatgpt" | "notebook" | "linkedin" | "make" | "python" | "gemini" | string
  category_slug?: string
  thumbnail?: string
  instructor?: string
  rating?: number
  reviews_count?: string
  duration: string
  modules_count: string
  prompts_count: string
  price: number
  original_price?: string
  currency?: string
  features: string[]
  stats: FormationStat[]
  testimonial?: FormationTestimonial
  video_preview_url?: string
  order_index?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export const DEFAULT_FORMATION_CATEGORIES: FormationCategory[] = []

export const DEFAULT_FORMATIONS: FormationItem[] = []

