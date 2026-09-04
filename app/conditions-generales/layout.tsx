import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente et d\'Utilisation',
  description: 'Conditions générales de vente (CGV) et d\'utilisation des formations et services de Le Guide IA.',
  alternates: {
    canonical: 'https://leguideai.com/conditions-generales',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ConditionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
