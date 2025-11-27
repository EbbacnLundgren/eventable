// components/LayoutWrapper.tsx
'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Footer from './footer'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideLayout = pathname === '/' || pathname === '/login'

  return (
    <>
      {!hideLayout && <Sidebar />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        {!hideLayout && <Footer />}
      </div>
    </>
  )
}
