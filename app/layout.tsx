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

export const metadataBase = new URL('https://leguideia.ai')

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
    // Brand keywords
    'Le Guide IA',
    'LeGuideIA',
    'le guide ia',
    'le guide IA',
    'leguideai',
    'Alfred Dah',
    'Alfred Dah IA',
    'Alfred Dah formation',
    'Alfred Dah intelligence artificielle',
    // Service keywords
    'Formation intelligence artificielle',
    'Formation IA',
    'Formation IA en ligne',
    'Formation IA Afrique',
    'Formation IA certifiante',
    'Formation IA gratuite',
    'Bootcamp IA',
    'Bootcamp intelligence artificielle',
    'Masterclass IA',
    'Masterclass IA gratuite',
    'Masterclass intelligence artificielle',
    'Cours IA en ligne',
    'Apprendre intelligence artificielle',
    // Tool keywords
    'Formation ChatGPT',
    'Apprendre ChatGPT',
    'Formation Claude IA',
    'Formation Gemini',
    'Formation Canva IA',
    'Prompt Engineering',
    'Prompt engineering formation',
    'Prompts IA',
    'Prompts ChatGPT',
    'Automatisation IA',
    'Automatisation IA entreprise',
    'IA générative',
    'IA générative formation',
    // Geographic keywords
    'Formation IA Burkina Faso',
    'Formation IA Côte d\'Ivoire',
    'Formation IA Sénégal',
    'Formation IA Cameroun',
    'Formation IA Mali',
    'Formation IA Togo',
    'Formation IA Bénin',
    'Formation IA Congo',
    'Formation IA Guinée',
    'Formation IA Niger',
    'Formation IA Gabon',
    'IA Afrique francophone',
    'IA diaspora africaine',
    'Formation IA diaspora',
    'Intelligence artificielle Afrique',
    // B2B keywords
    'Formation IA entreprise',
    'Transformation digitale IA',
    'Transformation digitale Afrique',
    'IA pour dirigeants',
    'IA pour entrepreneurs',
    'IA pour professionnels',
    'Productivité IA',
    'Certification IA',
    'Certificat IA',
  ],
  authors: [{ name: 'Alfred Dah - Le Guide IA', url: 'https://leguideia.ai' }],
  metadataBase,
  publisher: 'Le Guide IA',
  verification: {
    google: 'gyjctmFrz-g1vy-5Mfq5F3ZHC1gxz8q0Bgtaf-mRI20',
  },
  alternates: {
    canonical: 'https://leguideia.ai',
    languages: {
      'fr-FR': 'https://leguideia.ai',
      fr: 'https://leguideia.ai',
    },
  },
  openGraph: {
    title: 'Le Guide IA — Formations & Bootcamps en Intelligence Artificielle',
    description:
      'Maîtrisez l\'IA générative pratique : ChatGPT, Claude, Gemini, Automatisation. Formations certifiantes animées par Alfred Dah pour professionnels, entrepreneurs et entreprises.',
    url: 'https://leguideia.ai',
    siteName: 'Le Guide IA',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['fr'],
    images: [
      {
        url: 'https://leguideia.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Le Guide IA – Formations Intelligence Artificielle avec Alfred Dah',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Guide IA — Formations & Bootcamps en Intelligence Artificielle',
    description:
      'Formations certifiantes, Masterclasses gratuites et Bootcamps intensifs en IA avec Alfred Dah. Boostez votre productivité et vos compétences.',
    images: ['https://leguideia.ai/og-image.jpg'],
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
                  '@id': 'https://leguideia.ai/#organization',
                  name: 'Le Guide IA',
                  url: 'https://leguideia.ai',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://leguideia.ai/Logo%20avatar.png',
                  },
                  sameAs: [
                    'https://www.linkedin.com/in/alfreddah/',
                    'https://www.youtube.com/@leguideai',
                    'https://www.facebook.com/share/1crb38psK1/?mibextid=wwXIfr',
                  ],
                },
                {
                  '@type': 'EducationalOrganization',
                  '@id': 'https://leguideia.ai/#edu-organization',
                  name: 'Le Guide IA',
                  alternateName: ['LeGuideIA', 'Le Guide IA Formation', 'LGIA'],
                  url: 'https://leguideia.ai',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://leguideia.ai/Logo%20avatar.png',
                  },
                  founder: {
                    '@id': 'https://leguideia.ai/#person',
                  },
                  areaServed: [
                    {
                      '@type': 'Country',
                      name: 'United States',
                    },
                    {
                      '@type': 'Place',
                      name: "Afrique de l'Ouest",
                    },
                    {
                      '@type': 'Place',
                      name: "Afrique de l'Est",
                    },
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    availableLanguage: ['French', 'English'],
                  },
                  sameAs: [
                    'https://www.linkedin.com/in/alfreddah/',
                    'https://www.youtube.com/@leguideai',
                    'https://www.facebook.com/share/1crb38psK1/?mibextid=wwXIfr',
                  ],
                },
                {
                  '@type': 'Person',
                  '@id': 'https://leguideia.ai/#person',
                  name: 'Alfred Dah',
                  givenName: 'Alfred',
                  familyName: 'Dah',
                  alternateName: ['Sanson Alfred Tanguy Dah', 'Alfred Dah IA', 'Alfred Dah Le Guide IA'],
                  jobTitle: 'Expert IA & Fondateur de Le Guide IA',
                  description: 'Fondateur de Le Guide IA. Plus de 24 ans d\'expérience professionnelle en transformation digitale, audit de systèmes d\'information et gouvernance IA.',
                  image: 'https://leguideia.ai/profile_alfred.jpg',
                  url: 'https://leguideia.ai',
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
                    '@id': 'https://leguideia.ai/#organization',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://leguideia.ai/#website',
                  url: 'https://leguideia.ai',
                  name: 'Le Guide IA',
                  description:
                    'Plateforme leader de formation en Intelligence Artificielle en Afrique et Diaspora. Bootcamps, Masterclasses gratuites et certifications.',
                  publisher: {
                    '@id': 'https://leguideia.ai/#organization',
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://leguideia.ai/ressources?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Course',
                  '@id': 'https://leguideia.ai/#course',
                  name: 'Bootcamp IA & Carrière Certifiant',
                  description:
                    'Formation pratique et intensive en ligne pour maîtriser ChatGPT, Claude, Gemini, l\'automatisation et Canva IA avec des cas professionnels concrets.',
                  provider: {
                    '@id': 'https://leguideia.ai/#organization',
                  },
                  url: 'https://leguideia.ai/bootcamp',
                  hasCourseInstance: {
                    '@type': 'CourseInstance',
                    courseMode: 'online',
                    courseWorkload: 'PT15H',
                    instructor: {
                      '@id': 'https://leguideia.ai/#person',
                    },
                  },
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Bootcamp IA Pro',
                      price: '99000',
                      priceCurrency: 'XOF',
                      availability: 'https://schema.org/InStock',
                      url: 'https://leguideia.ai/bootcamp',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Bootcamp IA Business & Dirigeants',
                      price: '199000',
                      priceCurrency: 'XOF',
                      availability: 'https://schema.org/InStock',
                      url: 'https://leguideia.ai/bootcamp',
                    },
                  ],
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    reviewCount: '127',
                    bestRating: '5',
                    worstRating: '1',
                  },
                  review: [
                    {
                      '@type': 'Review',
                      author: {
                        '@type': 'Person',
                        name: 'Salamata Ouedraogo',
                        jobTitle: 'Senior Education Specialist',
                      },
                      reviewRating: {
                        '@type': 'Rating',
                        ratingValue: '5',
                        bestRating: '5',
                      },
                      reviewBody: "J'ai eu la chance de suivre les formations animées par Alfred Dah dans le cadre du GUIDE IA. Alfred est un formateur très pratique, qui privilégie l'application concrète des concepts plutôt que la théorie abstraite. Chaque session était orientée vers des cas réels, des démonstrations claires et des exercices directement utiles dans le quotidien professionnel.",
                      datePublished: '2026-07-15',
                    },
                    {
                      '@type': 'Review',
                      author: {
                        '@type': 'Person',
                        name: 'Alain SEHR SEHR, M.Sc., SFPC',
                      },
                      reviewRating: {
                        '@type': 'Rating',
                        ratingValue: '5',
                        bestRating: '5',
                      },
                      reviewBody: "Alfred Dah est l'un des formateurs les plus inspirants qu'il m'ait été donné de rencontrer. Au-delà du contenu technique d'excellence, il sait pousser chaque participant à dépasser ses limites et à appliquer concrètement l'IA. J'ai terminé ce Bootcamp avec une confiance renouvelée et des compétences immédiatement activables. Une recommandation absolue !",
                      datePublished: '2026-08-01',
                    },
                    {
                      '@type': 'Review',
                      author: {
                        '@type': 'Person',
                        name: 'W. Nadine Mariam YODA',
                        jobTitle: 'Executive Officer | Senior Business Advisor',
                      },
                      reviewRating: {
                        '@type': 'Rating',
                        ratingValue: '5',
                        bestRating: '5',
                      },
                      reviewBody: "J'ai participé au Bootcamp organisé par Alfred Dah et cette formation a déjà transformé ma manière de travailler. J'ai particulièrement apprécié son professionnalisme, sa générosité dans le partage des connaissances et son souci de voir les autres grandir. Je recommande très fortement LE GUIDE IA à tous ceux qui veulent faire de l'IA un tremplin professionnel ou d'affaires.",
                      datePublished: '2026-08-10',
                    },
                  ],
                },
                {
                  '@type': 'EducationEvent',
                  '@id': 'https://leguideia.ai/#masterclass-event',
                  name: 'Masterclass IA Interactive en Direct',
                  description:
                    'Session hebdomadaire gratuite en direct animée par Alfred Dah sur Google Meet. Démonstrations d\'outils IA, prompting avancé et Q&A interactif.',
                  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  location: {
                    '@type': 'VirtualLocation',
                    url: 'https://leguideia.ai/masterclass',
                  },
                  organizer: {
                    '@id': 'https://leguideia.ai/#organization',
                  },
                  performer: {
                    '@id': 'https://leguideia.ai/#person',
                  },
                  isAccessibleForFree: true,
                  offers: {
                    '@type': 'Offer',
                    name: 'Place Gratuite Masterclass',
                    price: '0',
                    priceCurrency: 'XOF',
                    availability: 'https://schema.org/InStock',
                    url: 'https://leguideia.ai/masterclass',
                  },
                },
                {
                  '@type': 'FAQPage',
                  '@id': 'https://leguideia.ai/#faq',
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
