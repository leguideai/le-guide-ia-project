import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ressources & Prompts IA Gratuits | Business Plans Burkina Faso – Le Guide IA',
  description:
    'Téléchargez gratuitement nos modèles de Business Plans adaptés à l\'Afrique et copiez 100+ prompts IA optimisés pour ChatGPT, Claude et Gemini par Le Guide IA.',
  keywords: [
    'prompts IA',
    'prompts ChatGPT',
    'modèles business plan',
    'business plan Burkina Faso',
    'ressources IA gratuites',
    'Claude prompts',
    'Gemini prompts',
    'Le Guide IA ressources',
  ],
  alternates: {
    canonical: 'https://leguideai.com/ressources',
  },
  openGraph: {
    title: 'Ressources & Prompts IA Gratuits | Le Guide IA',
    description:
      'Modèles de Business Plans adaptés aux secteurs porteurs et prompts IA optimisés prêts à employer.',
    url: 'https://leguideai.com/ressources',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Ressources & Prompts IA – Le Guide IA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ressources & Prompts IA Gratuits | Le Guide IA',
    description:
      'Téléchargez des modèles de Business Plans et copiez des prompts IA optimisés pour booster votre productivité.',
    images: ['https://leguideai.com/Logo%20avatar.png'],
  },
}

export default function RessourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
