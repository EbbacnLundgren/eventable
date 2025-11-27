import { ReactNode } from 'react'

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 ml-20 p-5">{children}</div>
    </div>
  )
}
