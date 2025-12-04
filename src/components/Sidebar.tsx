'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import {
  House,
  UserStar,
  CalendarDays,
  User,
  UserCog,
  LogOut,
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // --- Close popup when clicking outside ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-24 flex flex-col items-center justify-between py-6 z-50
                 border border-white  bg-white bg-opacity-50 border-opacity-20
                 bg-white bg-opacity-20 backdrop-blur-xl
                 shadow-lg"
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={60}
          height={60}
          className="object-contain"
        />

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-8 mt-20">
          <Link
            href="/main"
            className="text-gray-500 hover:text-pink-500 transition-colors duration-200"
          >
            <House className="h-8 w-8" />
          </Link>

          <Link
            href="/friends"
            className="text-gray-500 hover:text-pink-500 transition-colors duration-200"
          >
            <UserStar className="h-8 w-8" />
          </Link>

          <Link
            href="/calendar"
            className="text-gray-500 hover:text-pink-500 transition-colors duration-200"
          >
            <CalendarDays className="h-8 w-8" />
          </Link>
        </nav>
      </div>

      {/* Profile Icon + Popup */}
      <div className="relative z-50">
        <button
          ref={buttonRef}
          onClick={() => setShowMenu(!showMenu)}
          className="h-12 w-12 flex items-center justify-center rounded-full
                     bg-white bg-opacity-20 backdrop-blur-md bg-white bg-opacity-30
                     border border-white border-opacity-20
                     hover:bg-white hover:bg-opacity-30 transition"
        >
          <User className="h-6 w-6 text-gray-600" />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute left-14 bottom-2 w-48
                       bg-white bg-opacity-90 backdrop-blur-xl
                       border border-white border-opacity-20
                       rounded-lg shadow-md py-2 z-[1000]"
          >
            <Link
              href="/profile-settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 transition-colors"
            >
              <UserCog className="h-5 w-5" />
              <span className="whitespace-nowrap">Account Settings</span>
            </Link>

            <button
              className="flex items-center gap-3 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
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
