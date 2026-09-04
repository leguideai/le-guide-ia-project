import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Formation IA pour Entreprises & Dirigeants | Transformation Digitale B2B',
  description:
    'Accompagnement stratégique et formation sur mesure des équipes et cadres dirigeants pour intégrer l\'intelligence artificielle dans vos opérations. Audit de maturité IA, cas d\'usage métiers et gains mesurables de productivité.',
  keywords: [
    'Formation IA entreprise',
    'Formation IA dirigeants',
    'Transformation digitale IA Afrique',
    'Audit maturité IA',
    'IA générative B2B',
    'Automatisation processus entreprise',
    'Gouvernance IA Afrique',
    'Formation ChatGPT collaborateurs',
  ],
  alternates: {
    canonical: 'https://leguideai.com/entreprises',
  },
  openGraph: {
    title: 'Formation IA pour Entreprises & Dirigeants | Le Guide IA',
    description:
      'Boostez la performance de vos équipes grâce à l\'IA générative. Formations certifiantes intra-entreprise et coaching stratégique pour dirigeants.',
    url: 'https://leguideai.com/entreprises',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
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
    images: ['https://leguideai.com/Logo%20avatar.png'],
  },
}

export default function EntreprisesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
