import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales et informations éditoriales de la plateforme Le Guide IA.',
  alternates: {
    canonical: 'https://leguideai.com/mentions-legales',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
