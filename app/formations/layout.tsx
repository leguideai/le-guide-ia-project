import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalogue des Formations IA Certifiantes | Le Guide IA',
  description:
    'Explorez l\'ensemble de nos formations certifiantes et programmes accélérés en Intelligence Artificielle. Modules pratiques de l\'initiation à l\'expertise avancée.',
  keywords: [
    'Catalogue formation IA',
    'Cours intelligence artificielle en ligne',
    'Formation IA certifiante Afrique',
    'Apprendre l\'IA',
    'Parcours métiers IA',
    'Prompt engineering cours',
    'Certifications IA reconnues',
  ],
  alternates: {
    canonical: 'https://leguideai.com/formations',
  },
  openGraph: {
    title: 'Catalogue des Formations IA Certifiantes | Le Guide IA',
    description:
      'Formations pratiques pour booster votre carrière et vos revenus grâce à l\'intelligence artificielle.',
    url: 'https://leguideai.com/formations',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Catalogue Formations IA — Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catalogue des Formations IA Certifiantes | Le Guide IA',
    description:
      'Trouvez la formation IA adaptée à vos objectifs professionnels avec Le Guide IA.',
    images: ['https://leguideai.com/Logo%20avatar.png'],
  },
}

export default function FormationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
