import Header from '@/components/header'
import Footer from '@/components/footer'
import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Header syns på alla main-sidor */}
      <main className="flex-1">{children}</main>
      <Footer /> {/* Footer syns på alla main-sidor */}
    </div>
  )
}
