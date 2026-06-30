import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { LanguageProvider } from '@/lib/language-context'

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
  title: 'Bootcamp IA en ligne – Formation Intelligence Artificielle | Le Guide IA',
  description:
    'Rejoignez le Bootcamp LE GUIDE IA PRO : 10 sessions intensives en français pour maîtriser l\'IA. 24 juillet – 2 août 2026. 99 000 FCFA offre fondateur.',
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
  publisher: { name: 'Le Guide IA' },
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
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Bootcamp IA en ligne – Formation Intelligence Artificielle | Le Guide IA',
    description:
      'Rejoignez le Bootcamp LE GUIDE IA PRO : 10 sessions intensives en français pour maîtriser l\'IA. 24 juillet – 2 août 2026. 99 000 FCFA offre fondateur.',
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
    title: 'Bootcamp IA en ligne – Formation Intelligence Artificielle | Le Guide IA',
    description:
      'Rejoignez le Bootcamp LE GUIDE IA PRO : 10 sessions intensives en français pour maîtriser l\'IA. 24 juillet – 2 août 2026. 99 000 FCFA offre fondateur.',
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
    <html lang="fr" className={`${jakarta.variable} ${geistMono.variable}`}>
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
      <body className="font-sans antialiased bg-background">
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

        {/* Schema.org Event/Course JSON-LD */}
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
                    'Rejoignez le Bootcamp LE GUIDE IA PRO : 10 sessions intensives en français pour maîtriser l\'IA. 24 juillet – 2 août 2026.',
                  publisher: {
                    '@id': 'https://leguideai.com/#organization',
                  },
                },
                {
                  '@type': 'Course',
                  '@id': 'https://leguideai.com/#course',
                  name: 'Bootcamp LE GUIDE IA PRO',
                  description: '10 sessions intensives en direct pour maîtriser ChatGPT, Claude, Gemini et Canva IA.',
                  provider: {
                    '@type': 'Organization',
                    name: 'Le Guide IA',
                    url: 'https://leguideai.com',
                  },
                },
                {
                  '@type': 'CourseInstance',
                  courseMode: 'online',
                  startDate: '2026-07-24',
                  endDate: '2026-08-02',
                  courseWorkload: 'PT15H',
                  instructor: {
                    '@type': 'Person',
                    name: 'Alfred Dah',
                  },
                },
              ],
            }),
          }}
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
