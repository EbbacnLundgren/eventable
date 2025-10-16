// app/profile-settings/layout.tsx
import Header from '@/components/header'
import { ReactNode } from 'react'

export default function ProfileSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
