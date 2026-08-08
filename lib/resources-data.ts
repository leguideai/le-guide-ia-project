export interface ResourceItem {
  id: string
  type: 'prompt' | 'business-plan' | 'exercise' | 'bonus-video'
  bootcampId?: string
  bootcampName?: string
  title: { fr: string; en: string }
  desc: { fr: string; en: string }
  sector?: { fr: string; en: string }
  content: { fr: string; en: string }
  downloadUrl?: string
  videoUrl?: string
  fileSize?: string

  // Exercise & Assignment specific fields
  exerciseType?: 'devoir-a-rendre' | 'cas-pratique' | 'qcm' | 'challenge' | 'fichier-entrainement'
  deadline?: string
  submissionStatus?: 'pending' | 'submitted' | 'graded'
  submissionUrl?: string
}

export const resourcesData: ResourceItem[] = [
  {
    id: "prompt-linkedin",
    type: "prompt",
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    title: {
      fr: "Optimisation de profil LinkedIn Pro & ATS",
      en: "Pro LinkedIn Profile & ATS Optimization"
    },
    desc: {
      fr: "Un prompt pour réécrire votre titre professionnel, votre résumé (Infos) et valoriser vos compétences pour attirer des recruteurs et clients.",
      en: "A prompt to rewrite your professional headline, about section, and highlight your skills to attract recruiters and clients."
    },
    content: {
      fr: `Agis en tant qu'expert en personal branding et rédacteur LinkedIn professionnel. Je vais te donner mon CV et mes objectifs de carrière. Ton rôle est de rédiger :
1. Trois options de titres professionnels (headlines) percutants (max 220 caractères chacun), incluant des mots-clés ATS et ma proposition de valeur.
2. Une section "Infos" (About) rédigée à la première personne, captivante dès les 3 premières lignes, structurée avec des puces pour mes compétences clés, et se terminant par un appel à l'action clair (CTA).
3. Une liste de 5 compétences stratégiques à ajouter à mon profil.

Voici mon profil et mes objectifs :
[INSERER VOTRE CV OU DESCRIPTION DE CARRIERE ET VOS OBJECTIFS ICI]`,
      en: `Act as a personal branding expert and professional LinkedIn copywriter.`
    }
  },
  {
    id: "prompt-marketing-b2b",
    type: "prompt",
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    title: {
      fr: "Email de prospection commerciale B2B",
      en: "B2B Sales Outbound Email"
    },
    desc: {
      fr: "Générez des e-mails de prospection froide ultra-personnalisés, concis et axés sur la valeur pour maximiser vos taux d'ouverture et de réponse.",
      en: "Generate ultra-personalized, concise, and value-focused cold outbound emails to maximize your open and response rates."
    },
    content: {
      fr: `Rédige un email de prospection froide B2B concis (moins de 150 mots) destiné à [TITRE DE LA CIBLE, ex: Directeur Marketing] chez [NOM DE L'ENTREPRISE].
L'objectif est de lui proposer notre service de [VOTRE SERVICE, ex: automatisation IA] pour résoudre son problème de [PROBLEME CIBLE, ex: perte de temps sur la saisie de données].`,
      en: `Write a concise B2B cold outbound email.`
    }
  },
  {
    id: "ex-excel-data",
    type: "exercise",
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    exerciseType: "devoir-a-rendre",
    deadline: "Dimanche 6 Septembre 2026 à 23h59 GMT",
    submissionStatus: "pending",
    title: {
      fr: "Devoir à Rendre : Analyse de Données Financières d'Entreprise",
      en: "Assignment: Financial Data Analysis Project"
    },
    desc: {
      fr: "Projet pratique obligatoire à soumettre : importez le jeu de données Excel de 1 000 ventes dans ChatGPT, générez les graphiques financiers et soumettez votre rapport.",
      en: "Mandatory project to submit: import 1,000 sales rows into ChatGPT, generate financial charts and submit your report."
    },
    content: {
      fr: `📌 DEVOIR À RENDRE (DATE LIMITE : 6 SEPTEMBRE 2026 À 23H59 GMT)

Consignes de l'exercice :
1. Télécharger le fichier Fichiers_Exercice_Excel_IA.xlsx.
2. Analyser les données avec ChatGPT Advanced Data Analysis.
3. Rédiger une synthèse PDF de 2 pages avec 3 graphiques (Chiffre d'affaires mensuel, Top 5 produits, Coûts).
4. Soumettre votre fichier PDF via le bouton "Soumettre ma réponse".`,
      en: `ASSIGNMENT TO TURN IN (DEADLINE: SEPTEMBER 6, 2026)`
    },
    downloadUrl: "/images/initiation_free_thumb.jpg",
    fileSize: "2.4 MB",
    submissionUrl: "https://wa.me/22605050577?text=Bonjour%20Alfred%2C%20voici%20mon%20devoir%20d%27Analyse%20de%20Donnees%20Excel%20IA"
  },
  {
    id: "ex-make-blueprint",
    type: "exercise",
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    exerciseType: "cas-pratique",
    deadline: "Mardi 8 Septembre 2026 à 19h00 GMT",
    submissionStatus: "pending",
    title: {
      fr: "Cas Pratique : Workflow de Prospection Automatisée sur Make.com",
      en: "Case Study: Automated Outreach Workflow on Make.com"
    },
    desc: {
      fr: "Configurez le scénario Make.com fourni, activez les Webhooks d'emails et effectuez un test d'envoi en direct.",
      en: "Configure the provided Make.com scenario, enable email Webhooks, and perform a live sending test."
    },
    content: {
      fr: `💼 CAS PRATIQUE DE WORKFLOW

Étapes à valider :
- Importation du Blueprint JSON dans votre compte Make.com.
- Connexion de votre compte Gmail & API OpenAI.
- Capture d'écran du scénario exécuté avec succès.`,
      en: `PRACTICAL WORKFLOW CASE STUDY`
    },
    downloadUrl: "/images/bootcamp_business_thumb.jpg",
    fileSize: "1.1 MB",
    submissionUrl: "https://wa.me/22605050577?text=Bonjour%20Alfred%2C%20voici%20ma%20capture%20du%20workflow%20Make.com"
  },
  {
    id: "bonus-midjourney",
    type: "bonus-video",
    bootcampId: "bootcamp-pro-2",
    bootcampName: "Bootcamp IA Pro 2",
    title: {
      fr: "Vidéo Bonus : Masterclass Midjourney v6 & Photoréalisme",
      en: "Bonus Video: Midjourney v6 Photorealism Masterclass"
    },
    desc: {
      fr: "Tutoriel exclusif de 45 minutes pour générer des visuels publicitaires hyper-réalistes et maîtriser les paramètres --ar, --stylize et --cref.",
      en: "Exclusive 45-minute tutorial to generate hyper-realistic ad visuals."
    },
    content: {
      fr: `TUTORIEL VIDÉO EXCLUSIF — MIDJOURNEY V6 EN PRATIQUE`,
      en: `EXCLUSIVE VIDEO TUTORIAL — MIDJOURNEY V6 IN PRACTICE`
    },
    videoUrl: "https://www.youtube.com/embed/L_LUpnjgPso"
  },
  {
    id: "bp-agence-ia",
    type: "business-plan",
    bootcampId: "bootcamp-business-exec",
    bootcampName: "Bootcamp IA Business & Exec",
    title: {
      fr: "Business Plan — Agence de Services & Automatisations IA",
      en: "Business Plan — AI Automation & Services Agency"
    },
    sector: {
      fr: "Services Numériques B2B",
      en: "B2B Digital Services"
    },
    desc: {
      fr: "Plan d'affaires stratégique complet pour lancer une agence d'intégration IA pour PME : offre de services, tarification retainer et projections financières.",
      en: "Complete strategic business plan to launch an AI integration agency for SMEs."
    },
    content: {
      fr: `BUSINESS PLAN TYPE — AGENCE DE SERVICES IA EN AFRIQUE DE L'OUEST`,
      en: `BUSINESS PLAN TEMPLATE — AI SERVICES AGENCY IN WEST AFRICA`
    },
    downloadUrl: "/templates/Business_Plan_Agence_IA_Template.docx"
  },
  {
    id: "bp-aviculture",
    type: "business-plan",
    bootcampId: "initiation-free",
    bootcampName: "Initiation IA & ChatGPT",
    title: {
      fr: "Modèle de Business Plan - Aviculture Moderne",
      en: "Business Plan Template - Modern Poultry Farming"
    },
    desc: {
      fr: "Structure complète d'un projet d'élevage de poulets de chair et pondeuses au Burkina Faso.",
      en: "Complete business plan structure for a broiler and layer poultry farm in Burkina Faso."
    },
    content: {
      fr: `STRUCTURE DU BUSINESS PLAN - AVICULTURE AU BURKINA FASO`,
      en: `BUSINESS PLAN STRUCTURE - POULTRY FARMING IN BURKINA FASO`
    },
    downloadUrl: "/templates/Business_Plan_Aviculture_Burkina_Faso_Template.docx"
  }
]
