// app/profile-settings/layout.tsx
import { ReactNode } from 'react'

export default function ProfileSettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 ml-20">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
