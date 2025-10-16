import Header from '@/components/header'
import Sidebar from '@/components/Sidebar'
import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-20">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
