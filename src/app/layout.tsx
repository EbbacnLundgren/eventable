import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import LayoutWrapper from '@/components/LayoutWrapper'
//import Iridescence from '@/components/Iridescence'
//import MetallicBackground from '@/components/MetallicBackground' // NY FIL
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
                className="object-cover"
              />
            </div>
          </div>
          {/* <MetallicBackground />  */}
          {/* <Iridescence
            color={[1.0, 0.7, 0.9]}
            mouseReact={false}
            amplitude={0.1}
            speed={0.4}
          /> */}
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
