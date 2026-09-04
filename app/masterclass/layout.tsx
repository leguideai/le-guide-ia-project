import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masterclass IA Gratuite en Direct | Sessions Hebdomadaires & Replays',
  description:
    'Participez chaque dimanche à 1h30 de Masterclass IA interactive animée par Alfred Dah sur Google Meet. Démonstrations pratiques, cas réels, prompting et accès au groupe WhatsApp.',
  keywords: [
    'Masterclass IA gratuite',
    'Formation IA en direct',
    'Webinaire IA Afrique',
    'Google Meet IA direct',
    'Alfred Dah Masterclass',
    'Apprendre ChatGPT en direct',
    'Replays Masterclass IA',
    'Groupe WhatsApp apprenants IA',
  ],
  alternates: {
    canonical: 'https://leguideai.com/masterclass',
  },
  openGraph: {
    title: 'Masterclass IA Gratuite en Direct | Le Guide IA',
    description:
      'Chaque dimanche, découvrez les meilleurs cas d\'usage et outils IA en direct avec Alfred Dah. Réservez votre place gratuite dès maintenant.',
    url: 'https://leguideai.com/masterclass',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Masterclass IA Gratuite en Direct — Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masterclass IA Gratuite en Direct | Le Guide IA',
    description:
      '1h30 de formation intensive et interactive en direct sur Google Meet chaque dimanche avec Alfred Dah. 100% gratuit.',
    images: ['https://leguideai.com/Logo%20avatar.png'],
  },
}

export default function MasterclassLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
