import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bootcamp IA & Carrière Certifiant | Formation Intensive en Ligne',
  description:
    'Devenez autonome et hautement productif avec l\'intelligence artificielle. 6 sessions intensives en direct animées par Alfred Dah, cas pratiques professionnels, groupe WhatsApp privé et certificat officiel.',
  keywords: [
    'Bootcamp IA',
    'Formation IA certifiante',
    'Formation ChatGPT Afrique',
    'Prompt Engineering certifié',
    'Formation intelligence artificielle Burkina Faso',
    'Formation IA Côte d\'Ivoire',
    'Certificat officiel IA',
    'Bootcamp IA Alfred Dah',
    'Automatisation IA travail',
  ],
  alternates: {
    canonical: 'https://leguideai.com/bootcamp',
  },
  openGraph: {
    title: 'Bootcamp IA & Carrière Certifiant | Le Guide IA',
    description:
      'Passez de spectateur à acteur de la révolution IA. Formation accélérée en ligne avec accompagnement direct par Alfred Dah.',
    url: 'https://leguideai.com/bootcamp',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Bootcamp IA & Carrière Certifiant — Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bootcamp IA & Carrière Certifiant | Le Guide IA',
    description:
      'Formation intensive en direct pour maîtriser ChatGPT, Claude, Gemini et l\'automatisation des tâches professionnelles. Certificat officiel.',
    images: ['https://leguideai.com/Logo%20avatar.png'],
  },
}

export default function BootcampLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
