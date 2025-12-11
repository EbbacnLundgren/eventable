import { ReactNode } from 'react'

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center ">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  )
}
