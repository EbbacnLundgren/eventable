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
    //pathname.startsWith('/events/') ||
    //pathname === '/createEvent' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/update-password'

  return (
    <>
      {!hideLayout && (
        // s<div className="flex flex-col min-h-screen">
        <div className="flex flex-col min-h-screen relative">
          {' '}
          <Header />
          {/* <main className="flex-1">{children}</main> */}
          <main className="flex-1 pt-[70px]">{children}</main>
        </div>
      )}
      {hideLayout && <main className="flex-1">{children}</main>}
    </>
  )
}
