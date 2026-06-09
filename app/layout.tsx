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

export const metadata: Metadata = {
  title: 'Le Guide IA — L\'IA pratique pour l\'Afrique francophone',
  description:
    'Maîtrisez l\'intelligence artificielle (ChatGPT, Claude, Gemini, Canva IA) avec Le Guide IA. Rejoignez le Challenge IA gratuit de 5 jours et passez au Bootcamp PRO.',
  icons: {
    icon: '/Logo%20avatar.png',
    apple: '/Logo%20avatar.png',
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
        {children}
      </body>
    </html>
  )
}
