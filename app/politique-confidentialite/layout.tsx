import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité et Protection des Données',
  description: 'Politique de confidentialité et engagements de protection des données personnelles sur Le Guide IA.',
  alternates: {
    canonical: 'https://leguideai.com/politique-confidentialite',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PolitiqueConfidentialiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
