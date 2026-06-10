import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadataBase = new URL('https://leguideai.com')

export const metadata: Metadata = {
  title: {
    default: 'Le Guide IA — L\'IA pratique pour l\'Afrique francophone',
    template: '%s | Le Guide IA',
  },
  description:
    'Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini, Canva IA, productivité et business. Rejoignez le Challenge IA gratuit de 5 jours et passez au Bootcamp PRO.',
  keywords: [
    'IA',
    'intelligence artificielle',
    'Afrique francophone',
    'formation IA',
    'bootcamp IA',
    'ChatGPT',
    'Claude',
    'Gemini',
    'Canva IA',
    'challenge IA',
    'formation en ligne',
    'productivité',
  ],
  authors: [{ name: 'Le Guide IA', url: 'https://leguideai.com' }],
  metadataBase,
  authors: [{ name: 'Le Guide IA', url: 'https://leguideai.com' }],
  publisher: { name: 'Le Guide IA' },
  verification: {
    google: 'gyjctmFrz-g1vy-5Mfq5F3ZHC1gxz8q0Bgtaf-mRI20',
  },
  themeColor: '#0f172a',
  alternates: {
    canonical: 'https://leguideai.com',
    languages: {
      'fr-FR': 'https://leguideai.com',
      fr: 'https://leguideai.com',
    },
  },
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Le Guide IA — L\'IA pratique pour l\'Afrique francophone',
    description:
      'Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini et Canva IA. Rejoignez le Challenge IA gratuit de 5 jours et passez au Bootcamp PRO.',
    url: 'https://leguideai.com',
    siteName: 'Le Guide IA',
    type: 'website',
    locale: 'fr_FR',
    localeAlternates: ['fr'],
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Le Guide IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Guide IA — L\'IA pratique pour l\'Afrique francophone',
    description:
      'Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini et Canva IA. Rejoignez le Challenge IA gratuit de 5 jours et passez au Bootcamp PRO.',
    images: ['https://leguideai.com/Logo%20avatar.png'],
    site: '@leguideia',
    creator: '@leguideia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: '/site.webmanifest',
  themeColor: '#0f172a',
  icons: {
    icon: '/Logo%20avatar.png',
    apple: '/Logo%20avatar.png',
    shortcut: '/Logo%20avatar.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://leguideai.com/#organization',
                  name: 'Le Guide IA',
                  url: 'https://leguideai.com',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://leguideai.com/Logo%20avatar.png',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://leguideai.com/#website',
                  url: 'https://leguideai.com',
                  name: 'Le Guide IA',
                  description:
                    'Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini, Canva IA, productivité et business.',
                  publisher: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                },
                {
                  '@type': 'WebPage',
                  '@id': 'https://leguideai.com/#webpage',
                  url: 'https://leguideai.com',
                  inLanguage: 'fr-FR',
                  name: 'Le Guide IA — L\'IA pratique pour l\'Afrique francophone',
                  description:
                    'Le Guide IA aide l’Afrique francophone à maîtriser l’intelligence artificielle : ChatGPT, Claude, Gemini, Canva IA, productivité et business.',
                  isPartOf: {
                    '@id': 'https://leguideai.com/#website',
                  },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    {
                      '@type': 'ListItem',
                      position: 1,
                      name: 'Accueil',
                      item: 'https://leguideai.com',
                    },
                  ],
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
