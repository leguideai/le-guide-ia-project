import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Formation IA, Développement Web & Mobile pour Entreprises | Solutions B2B',
  description:
    'Solutions digitales B2B par Le Guide IA : Développement de sites web modernes et applications mobiles iOS & Android sur-mesure, formations intra-entreprise en intelligence artificielle, audits de maturité IA et automatisation des processus.',
  keywords: [
    'Développement site web entreprise',
    'Développement application mobile entreprise',
    'Création application mobile iOS Android',
    'Développement web sur mesure Afrique',
    'Refonte site web entreprise',
    'Formation IA entreprise',
    'Formation IA dirigeants',
    'Transformation digitale IA Afrique',
    'Audit maturité IA',
    'IA générative B2B',
    'Automatisation processus entreprise',
    'Gouvernance IA Afrique',
    'Formation ChatGPT collaborateurs',
    'IA pour PME',
    'IA pour grands groupes',
    'Coaching IA dirigeants',
    'Intégration IA entreprise',
    'Google Workspace IA',
    'Gemini entreprise',
    'Copilot entreprise',
    'Formation IA intra-entreprise',
    'Conseil IA Afrique',
    'Transformation digitale PME',
  ],
  alternates: {
    canonical: 'https://leguideia.ai/entreprises',
  },
  openGraph: {
    title: 'Formation IA pour Entreprises & Dirigeants | Le Guide IA',
    description:
      'Boostez la performance de vos équipes grâce à l\'IA générative. Formations certifiantes intra-entreprise et coaching stratégique pour dirigeants.',
    url: 'https://leguideia.ai/entreprises',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideia.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formation IA Entreprises & Dirigeants — Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formation IA pour Entreprises & Dirigeants | Le Guide IA',
    description:
      'Accompagnement et formation IA sur mesure pour équipes et comités de direction. Développez l\'avantage concurrentiel de votre entreprise.',
    images: ['https://leguideia.ai/og-image.jpg'],
  },
}

export default function EntreprisesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
