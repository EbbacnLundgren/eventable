import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import LayoutWrapper from '@/components/LayoutWrapper'
import Image from 'next/image'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Eventable',
  description: 'Plan your next event',
  keywords: ['events', 'calendar', 'event planner'],
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
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
            <div className="absolute inset-0 -z-10">
              <Image
                src="/images/background-picture.jpg"
                alt="Background"
                fill
                priority
                className="object-cover scale-x-[-1]"
              />

              {/* Overlay för mörkare topp*/}
              <div className="absolute top-0 left-0 w-full h-[25%] pointer-events-none">
                <div
                  className="w-full h-full"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(35, 106, 168, 0.73), rgba(249, 198, 244, 0))',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
            </div>
          </div>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
