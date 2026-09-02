export interface ResourceItem {
  id: string
  type: 'prompt' | 'business-plan' | 'exercise'
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

  // Exercise & Assignment specific fields
  exerciseType?: 'devoir-a-rendre' | 'cas-pratique' | 'qcm' | 'challenge' | 'fichier-entrainement'
  deadline?: string
  submissionStatus?: 'pending' | 'submitted' | 'graded'
  submissionUrl?: string
}

export const resourcesData: ResourceItem[] = []
