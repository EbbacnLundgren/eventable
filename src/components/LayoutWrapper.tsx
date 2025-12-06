// components/LayoutWrapper.tsx
'use client'
import { usePathname } from 'next/navigation'
//import Footer from './footer'
import Header from './header'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || ''
  const hideLayout =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/events/') ||
    pathname === '/createEvent' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/update-password'

  return (
    <>
      {/* {!hideLayout && <Sidebar />} */}
      {!hideLayout && (
        <div className="flex flex-col min-h-screen">
          {' '}
          {/* ml-24 för att ge plats åt sidebar */}
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      )}
      {hideLayout && <main className="flex-1">{children}</main>}
    </>
  )
}
