import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { LanguageProvider } from '@/lib/language-context'
import { PerformancePatch } from '@/components/performance-patch'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import { GlobalProfileCompletionModal } from '@/components/global-profile-completion-modal'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadataBase = new URL('https://leguideai.com')

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Le Guide IA — Formations, Bootcamps & Masterclasses Intelligence Artificielle',
    template: '%s | Le Guide IA',
  },
  description:
    'Plateforme leader de formation en Intelligence Artificielle en Afrique et Diaspora. Maîtrisez ChatGPT, Claude, Gemini et l\'automatisation avec Alfred Dah. Formations certifiantes, Bootcamps intensifs et Masterclasses gratuites.',
  keywords: [
    'Le Guide IA',
    'Alfred Dah',
    'Formation intelligence artificielle Afrique',
    'Bootcamp IA',
    'Formation ChatGPT',
    'Masterclass IA gratuite',
    'Prompt Engineering',
    'Intelligence artificielle Burkina Faso',
    'Formation IA Côte d\'Ivoire',
    'Formation IA Sénégal',
    'Automatisation IA entreprise',
    'Claude IA',
    'Gemini IA',
    'Formation IA certifiante',
    'IA diaspora africaine',
  ],
  authors: [{ name: 'Alfred Dah - Le Guide IA', url: 'https://leguideai.com' }],
  metadataBase,
  publisher: 'Le Guide IA',
  verification: {
    google: 'gyjctmFrz-g1vy-5Mfq5F3ZHC1gxz8q0Bgtaf-mRI20',
  },
  alternates: {
    canonical: 'https://leguideai.com',
    languages: {
      'fr-FR': 'https://leguideai.com',
      fr: 'https://leguideai.com',
    },
  },
  openGraph: {
    title: 'Le Guide IA — Formations & Bootcamps en Intelligence Artificielle',
    description:
      'Maîtrisez l\'IA générative pratique : ChatGPT, Claude, Gemini, Automatisation. Formations certifiantes animées par Alfred Dah pour professionnels, entrepreneurs et entreprises.',
    url: 'https://leguideai.com',
    siteName: 'Le Guide IA',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['fr'],
    images: [
      {
        url: 'https://leguideai.com/Logo%20avatar.png',
        width: 1200,
        height: 630,
        alt: 'Le Guide IA – Formations Intelligence Artificielle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Guide IA — Formations & Bootcamps en Intelligence Artificielle',
    description:
      'Formations certifiantes, Masterclasses gratuites et Bootcamps intensifs en IA avec Alfred Dah. Boostez votre productivité et vos compétences.',
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
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

  return (
    <html lang="fr" className={`${jakarta.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager (GTM) */}
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}

        {/* Google Analytics (GA4) */}
        {gaTrackingId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`} strategy="afterInteractive" />
            <Script id="ga-script" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaTrackingId}');`}
            </Script>
          </>
        )}

        {/* Meta Pixel */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${metaPixelId}');fbq('track', 'PageView');`}
          </Script>
        )}

        {/* Microsoft Clarity */}
        {clarityProjectId && (
          <Script id="clarity-script" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityProjectId}");`}
          </Script>
        )}
      </head>
      <body className="font-sans antialiased bg-background" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Schema.org Event/Course/FAQ JSON-LD */}
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
                  sameAs: [
                    'https://www.linkedin.com/in/alfreddah/',
                    'https://www.youtube.com/@leguideai',
                    'https://www.facebook.com/share/1crb38psK1/?mibextid=wwXIfr',
                  ],
                },
                {
                  '@type': 'Person',
                  '@id': 'https://leguideai.com/#person',
                  name: 'Alfred Dah',
                  givenName: 'Alfred',
                  familyName: 'Dah',
                  alternateName: ['Sanson Alfred Tanguy Dah', 'Alfred Dah IA', 'Alfred Dah Le Guide IA'],
                  jobTitle: 'Expert IA & Fondateur de Le Guide IA',
                  description: 'Fondateur de Le Guide IA. Plus de 24 ans d\'expérience professionnelle en transformation digitale, audit de systèmes d\'information et gouvernance IA.',
                  image: 'https://leguideai.com/profile_alfred.jpg',
                  url: 'https://leguideai.com',
                  sameAs: ['https://www.linkedin.com/in/alfreddah/'],
                  knowsAbout: [
                    'Intelligence Artificielle',
                    'Prompt Engineering',
                    'ChatGPT',
                    'Claude',
                    'Gemini',
                    'Transformation Digitale',
                    'Gouvernance des Systèmes d\'Information'
                  ],
                  worksFor: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://leguideai.com/#website',
                  url: 'https://leguideai.com',
                  name: 'Le Guide IA',
                  description:
                    'Plateforme leader de formation en Intelligence Artificielle en Afrique et Diaspora. Bootcamps, Masterclasses gratuites et certifications.',
                  publisher: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://leguideai.com/ressources?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Course',
                  '@id': 'https://leguideai.com/#course',
                  name: 'Bootcamp IA & Carrière Certifiant',
                  description:
                    'Formation pratique et intensive en ligne pour maîtriser ChatGPT, Claude, Gemini, l\'automatisation et Canva IA avec des cas professionnels concrets.',
                  provider: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                  url: 'https://leguideai.com/bootcamp',
                  hasCourseInstance: {
                    '@type': 'CourseInstance',
                    courseMode: 'online',
                    courseWorkload: 'PT15H',
                    instructor: {
                      '@id': 'https://leguideai.com/#person',
                    },
                  },
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Bootcamp IA Pro',
                      price: '99000',
                      priceCurrency: 'XOF',
                      availability: 'https://schema.org/InStock',
                      url: 'https://leguideai.com/bootcamp',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Bootcamp IA Business & Dirigeants',
                      price: '199000',
                      priceCurrency: 'XOF',
                      availability: 'https://schema.org/InStock',
                      url: 'https://leguideai.com/bootcamp',
                    },
                  ],
                },
                {
                  '@type': 'EducationEvent',
                  '@id': 'https://leguideai.com/#masterclass-event',
                  name: 'Masterclass IA Interactive en Direct',
                  description:
                    'Session hebdomadaire gratuite en direct animée par Alfred Dah sur Google Meet. Démonstrations d\'outils IA, prompting avancé et Q&A interactif.',
                  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  location: {
                    '@type': 'VirtualLocation',
                    url: 'https://leguideai.com/masterclass',
                  },
                  organizer: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                  performer: {
                    '@id': 'https://leguideai.com/#person',
                  },
                  isAccessibleForFree: true,
                  offers: {
                    '@type': 'Offer',
                    name: 'Place Gratuite Masterclass',
                    price: '0',
                    priceCurrency: 'XOF',
                    availability: 'https://schema.org/InStock',
                    url: 'https://leguideai.com/masterclass',
                  },
                },
                {
                  '@type': 'FAQPage',
                  '@id': 'https://leguideai.com/#faq',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'Qu\'est-ce qui différencie ce Bootcamp d\'une formation YouTube gratuite ?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Ce Bootcamp est 100% interactif avec Alfred Dah. Il inclut des exercices pratiques modélisés pour des cas réels africains et de la diaspora, un accompagnement personnalisé en direct, et un groupe d\'entraide privé WhatsApp pour pérenniser vos acquis.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Je n\'ai jamais utilisé l\'IA. Est-ce que je peux suivre le Bootcamp ?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Oui, tout à fait. Nous démarrons avec le mindset et les bases professionnelles du prompting avant d\'aborder des cas avancés. La formation est conçue pour être progressive et accessible.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Est-ce que les sessions sont enregistrées si je rate un live ?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Oui. Toutes les sessions sont enregistrées et les replays sont disponibles sous 12h dans votre espace membre.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Quel est le tarif de l\'offre Promo et quand expire-t-elle ?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Le tarif Promo est de 99 000 FCFA (environ 174 USD). Cette offre exclusive expire le 20 août 2026 à minuit GMT. Le tarif passera ensuite au prix normal de 149 000 FCFA (environ 262 USD).',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
        <LanguageProvider>
          <PerformancePatch />
          <AnalyticsTracker />
          <GlobalProfileCompletionModal />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
