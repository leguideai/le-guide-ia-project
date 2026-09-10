export interface ResourceItem {
  id: string
  type: 'prompt' | 'business-plan' | 'exercise' | 'file' | 'bundle' | string
  bootcampId?: string
  bootcampName?: string
  title: { fr: string; en: string }
  desc: { fr: string; en: string }
  sector?: { fr: string; en: string }
  content: { fr: string; en: string }
  downloadUrl?: string
  videoUrl?: string
  fileSize?: string
  tier?: string
  fileUrl?: string
  hasText?: boolean
  hasFile?: boolean
  downloadsCount?: number

  // Exercise & Assignment specific fields
  exerciseType?: 'devoir-a-rendre' | 'cas-pratique' | 'qcm' | 'challenge' | 'fichier-entrainement'
  deadline?: string
  submissionStatus?: 'pending' | 'submitted' | 'graded'
  submissionUrl?: string
}

export const RESOURCE_CATEGORIES = [
  "Business Plan & Entrepreneuriat",
  "Direction, Leadership & Stratégie",
  "Productivité & Organisation",
  "Automatisation & No-Code",
  "Marketing Digital & Vente",
  "Étudiants, Mémoires & Recherche",
  "Finance, Comptabilité & Gestion",
  "Ressources Humaines & Recrutement",
  "Création de Contenu & Réseaux Sociaux",
  "Développement & Informatique",
  "Juridique & Conformité",
  "Relation Client & Support",
  "Autre"
] as const

export const resourcesData: ResourceItem[] = []
