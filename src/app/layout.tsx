import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import MovingBackground from '@/components/MovingBackground'
import LayoutWrapper from '@/components/LayoutWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Eventable',
  description: 'Plan your next event',
  keywords: ['events', 'calendar', 'event planner'],
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/favicon.ico' },
  ],
  openGraph: {
    title: 'Eventable',
    description: 'The best event planner website',
    url: 'https://eventableproject.vercel.app/',
    siteName: 'Eventable',
    locale: 'en-US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="fixed inset-0 -z-10">
            <MovingBackground />
          </div>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
