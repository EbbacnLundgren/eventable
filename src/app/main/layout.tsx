import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 ml-20 pl-5 pr-5">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
