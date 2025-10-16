'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { House, UserStar, CalendarDays, User, UserCog, LogOut } from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white shadow-lg flex flex-col items-center justify-between py-6 border-r border-gray-200 z-50">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/favicon.ico"
          alt="Logo"
          className="h-15 w-15 object-contain"
        />

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-8 mt-20">
          <Link href="/main" className="text-gray-500 hover:text-pink-500">
            <House className="h-8 w-8" />
          </Link>

          <Link href="/my-events" className="text-gray-500 hover:text-pink-500">
            <UserStar className="h-8 w-8" />
          </Link>

          <Link href="/calendar" className="text-gray-500 hover:text-pink-500">
            <CalendarDays className="h-8 w-8" />
          </Link>
        </nav>
      </div>

      {/* Profile Icon + Popup */}
      <div className="relative z-50">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-pink-100 transition"
        >
          <User className="h-6 w-6 text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute left-14 bottom-2 w-48 bg-white shadow-md rounded-lg border border-gray-200 py-2 z-[1000]">
            <Link
              href="/profile-settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50"
            >
              <UserCog className="h-5 w-5" />
              <span className="whitespace-nowrap">Account Settings</span>
            </Link>

            <button
              className="flex items-center gap-3 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="whitespace-nowrap">Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
