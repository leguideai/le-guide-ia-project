import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ressources & Prompts IA Gratuits | Business Plans Burkina Faso – Le Guide IA',
  description:
    'Téléchargez gratuitement nos modèles de Business Plans adaptés à l\'Afrique et copiez 100+ prompts IA optimisés pour ChatGPT, Claude et Gemini par Le Guide IA.',
  keywords: [
    'Prompts IA',
    'Prompts ChatGPT',
    'Prompts Claude',
    'Prompts Gemini',
    'Modèles business plan',
    'Business plan Burkina Faso',
    'Ressources IA gratuites',
    'Prompts IA gratuits',
    'Templates IA',
    'Le Guide IA ressources',
    'Prompts professionnels',
    'Prompts marketing IA',
    'Prompts RH IA',
    'Prompts vente IA',
    'Outils IA gratuits',
    'Bibliothèque prompts IA',
  ],
  alternates: {
    canonical: 'https://leguideia.ai/ressources',
  },
  openGraph: {
    title: 'Ressources & Prompts IA Gratuits | Le Guide IA',
    description:
      'Modèles de Business Plans adaptés aux secteurs porteurs et prompts IA optimisés prêts à employer.',
    url: 'https://leguideia.ai/ressources',
    siteName: 'Le Guide IA',
    images: [
      {
        url: 'https://leguideia.ai/og-image.jpg',
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
    images: ['https://leguideia.ai/og-image.jpg'],
  },
}

export default function RessourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
