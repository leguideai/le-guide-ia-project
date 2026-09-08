import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs & Abonnements IA | Bootcamps, Replays & Prompts — Le Guide IA',
  description:
    'Découvrez tous nos tarifs en toute transparence : abonnement pour les replays des Masterclasses et la bibliothèque de prompts, bootcamps intensifs certifiants en direct, et formations sur-mesure pour entreprises.',
  keywords: [
    'Tarifs Le Guide IA',
    'Prix Bootcamp IA',
    'Tarif formation intelligence artificielle',
    'Abonnement IA',
    'Prix abonnement Le Cercle IA',
    'Accès replays Masterclass IA',
    'Bibliothèque prompts IA prix',
    'Formation ChatGPT prix',
    'Formation IA Afrique tarif',
    'Tarif bootcamp Alfred Dah',
    'Formation IA certifiante prix',
    'Formation IA entreprise devis',
    'Tarif formation Claude IA',
    'Tarif formation Gemini',
    'Formation IA pas cher',
    'Abonnement prompts ChatGPT',
  ],
  alternates: {
    canonical: 'https://leguideai.com/tarifs',
  },
  openGraph: {
    title: 'Tarifs & Abonnements IA — Bootcamps, Replays & Prompts | Le Guide IA',
    description:
      'Consultez nos tarifs officiels clairs et sans frais cachés : pass replays & prompts dès 3 000 FCFA/mois, bootcamps certifiants en direct et offres B2B.',
    url: 'https://leguideai.com/tarifs',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tarifs et Abonnements — Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs & Abonnements IA | Le Guide IA',
    description:
      'Tous nos tarifs : abonnements replays & prompts, bootcamps intensifs certifiants et formations sur-mesure.',
    images: ['https://leguideai.com/og-image.jpg'],
  },
}

export default function TarifsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
