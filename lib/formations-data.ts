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

export const DEFAULT_FORMATION_CATEGORIES: FormationCategory[] = [
  { id: "cat-claude", slug: "claude", label: "Claude & Code", icon: "claude", order_index: 1, is_active: true },
  { id: "cat-chatgpt", slug: "chatgpt", label: "ChatGPT & Make", icon: "chatgpt", order_index: 2, is_active: true },
  { id: "cat-notebook", slug: "notebook", label: "NotebookLM & Gemini", icon: "notebook", order_index: 3, is_active: true },
  { id: "cat-linkedin", slug: "linkedin", label: "LinkedIn & Prospection", icon: "linkedin", order_index: 4, is_active: true },
]

export const DEFAULT_FORMATIONS: FormationItem[] = [
  {
    id: "formation-claude-ia",
    slug: "maitriser-claude-ia",
    title: "Maîtriser Claude 3.7 & Claude Code",
    tagline: "Déléguez enfin le travail complexe qui vous prend des heures",
    description: "La formation complète pour exploiter toute la puissance de Claude : Claude Chatbot, Claude Code, Claude Cowork et Artifacts. Transformez Claude en collaborateur d'élite sans aucune compétence technique préalable.",
    badge: "Forte demande",
    tool_icon: "claude",
    category_slug: "claude",
    thumbnail: "/images/formation_claude_thumb.jpg",
    instructor: "Alfred Dah · Expert IA & Code",
    rating: 4.9,
    reviews_count: "245 avis",
    duration: "12h de vidéo",
    modules_count: "29 leçons",
    prompts_count: "50+ skills & templates",
    price: 49000,
    original_price: "89 000 FCFA",
    currency: "FCFA",
    features: [
      "Claude Chatbot : Prompting ultra-avancé, projets et automatisation quotidienne",
      "Claude Code : Déléguez vos tâches techniques et scripts sans coder",
      "Claude Cowork : Travaillez en direct sur vos fichiers, PDF et bases de données",
      "Claude Artifacts & Design : Générez des dashboards et applications visuelles en 1 clic"
    ],
    stats: [
      { label: "Parties complètes", value: "4" },
      { label: "Leçons vidéo HD", value: "29" },
      { label: "De contenu pratique", value: "12h+" }
    ],
    testimonial: {
      quote: "Des exemples concrets qu'on peut appliquer tout de suite dans son travail. Le contenu est régulièrement actualisé avec les dernières nouveautés de Claude.",
      author_name: "David Fraisse",
      author_role: "Consultant Stratégie & IA",
      avatar_initials: "DF",
      rating: 5
    },
    order_index: 1,
    is_active: true
  },
  {
    id: "formation-automatiser-chatgpt",
    slug: "automatiser-chatgpt",
    title: "Automatiser ChatGPT & Make",
    tagline: "Gagnez plus de 10h par semaine immédiatement en pilotant l'IA",
    description: "Maîtrisez toutes les fonctionnalités avancées de ChatGPT et connectez-le à vos outils préférés via Make et Zapier pour créer des assistants autonomes qui travaillent 24h/24.",
    badge: "Best-seller",
    tool_icon: "chatgpt",
    category_slug: "chatgpt",
    thumbnail: "/images/formation_chatgpt_thumb.jpg",
    instructor: "Alfred Dah · Expert Automatisation",
    rating: 4.9,
    reviews_count: "310 avis",
    duration: "15h de contenu",
    modules_count: "25 modules",
    prompts_count: "150+ prompts premium",
    price: 39000,
    original_price: "79 000 FCFA",
    currency: "FCFA",
    features: [
      "Création de contenu, rédaction d'emails stratégiques et synthèse de documents lourds",
      "Prompt engineering de niveau expert (méthode CARTEL, chaînage de pensée)",
      "Création de GPTs sur-mesure et agents conversationnels spécialisés",
      "Bonus exclusif : Workflows d'automatisation Make prêts à importer"
    ],
    stats: [
      { label: "Modules vidéo", value: "25" },
      { label: "De pratique guidée", value: "15h" },
      { label: "Prompts testés", value: "150+" }
    ],
    testimonial: {
      quote: "Cette formation m'a fait gagner un temps précieux dès la première semaine. Mes tâches répétitives sont désormais automatisées.",
      author_name: "Amadou Traoré",
      author_role: "Responsable Marketing Digital",
      avatar_initials: "AT",
      rating: 5
    },
    order_index: 2,
    is_active: true
  },
  {
    id: "formation-notebooklm-gemini",
    slug: "notebooklm-gemini-facile",
    title: "NotebookLM & Gemini Pro Facile",
    tagline: "Maîtrisez les outils d'analyse documentaire les plus puissants de 2026",
    description: "Ne perdez plus votre temps à lire des rapports interminables. Confiez vos PDF, cours et bilans à NotebookLM et transformez-les en synthèses, podcasts audio et présentations en quelques secondes.",
    badge: "Nouveau",
    tool_icon: "notebook",
    category_slug: "notebook",
    thumbnail: "/images/formation_notebook_thumb.jpg",
    instructor: "Alfred Dah · Expert Documentaire",
    rating: 4.9,
    reviews_count: "180 avis",
    duration: "8h de contenu",
    modules_count: "12 modules",
    prompts_count: "Outil studio inclus",
    price: 29000,
    original_price: "59 000 FCFA",
    currency: "FCFA",
    features: [
      "Comptes-rendus de réunion en 3 minutes et rapports de 100 pages synthétisés",
      "Méthode d'audit et d'extraction documentaire sans hallucination",
      "Audio Overview : Génération de podcasts et briefings vocaux en 1 clic",
      "Intégration Gemini 2.0 Pro et création de Gems personnalisés"
    ],
    stats: [
      { label: "Modules ciblés", value: "12" },
      { label: "Workflows PDF", value: "3" },
      { label: "Gagnées / semaine", value: "10h" }
    ],
    testimonial: {
      quote: "NotebookLM était sous-estimé jusqu'à ce que je suive cette formation. C'est devenu mon copilote quotidien pour mes synthèses.",
      author_name: "Christine Aucher",
      author_role: "Directrice des Opérations",
      avatar_initials: "CA",
      rating: 5
    },
    order_index: 3,
    is_active: true
  },
  {
    id: "formation-prospection-linkedin",
    slug: "prospection-linkedin-ia",
    title: "Prospection Commerciale IA & LinkedIn",
    tagline: "Faites de LinkedIn votre machine à générer des clients qualifiés",
    description: "Une méthode simple et reproductible pour identifier des prospects chauds, rédiger des messages ultra-personnalisés grâce à l'IA et convertir en y passant moins de 2h par semaine.",
    badge: "Prospection",
    tool_icon: "linkedin",
    category_slug: "linkedin",
    thumbnail: "/images/formation_linkedin_thumb.jpg",
    instructor: "Alfred Dah · Stratégie B2B & IA",
    rating: 4.9,
    reviews_count: "195 avis",
    duration: "7h de contenu",
    modules_count: "10 modules",
    prompts_count: "Scripts & checklists",
    price: 39000,
    original_price: "69 000 FCFA",
    currency: "FCFA",
    features: [
      "Profil LinkedIn optimisé pour la conversion commerciale (checklist 12 points)",
      "Identification des décideurs et signaux d'achat faibles avec l'IA",
      "Séquences de messages ciblées avec 70% de taux de réponse garanti",
      "Automatisation douce pour prospecter en continu sans risquer de ban"
    ],
    stats: [
      { label: "Prospects / jour", value: "4" },
      { label: "Taux de réponse", value: "70%" },
      { label: "Par semaine", value: "<2h" }
    ],
    testimonial: {
      quote: "J'ai signé 2 nouveaux contrats dès le premier mois en appliquant les séquences de messages rédigées avec l'IA. Remarquable !",
      author_name: "Fanny Sessou",
      author_role: "Fondatrice d'Agence",
      avatar_initials: "FS",
      rating: 5
    },
    order_index: 4,
    is_active: true
  }
]
