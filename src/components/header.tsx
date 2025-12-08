'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Plus } from 'lucide-react'
import { User, UserCog, LogOut, UserStar, CalendarDays } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10) // trigga blur om man scrollar mer än 10px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }

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

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    // <header className="w-full flex justify-between items-center p-4 text-white">
    //<header className="fixed top-0 left-0 w-full flex justify-between items-center p-4 text-white z-50">
    <header
      className={`fixed top-0 left-0 w-full flex justify-between items-center p-4 text-white z-50
    transition-all duration-300
    ${scrolled ? 'bg-white/20 backdrop-blur-md' : 'bg-transparent'}`}
    >
      {/* Left: Image button to main */}
      <button
        onClick={() => router.push('/main')}
        className="p-0 cursor-pointer transition-transform duration-200 hover:scale-105 rounded-md overflow-hidden"
        style={{ width: '350px', height: '70px' }}
      >
        <Image
          src="/tenth-version.png"
          alt="Go to Main"
          width={350}
          height={50}
          className="object-cover w-full h-full"
          style={{ transform: 'translateY(-15px)' }}
        />
      </button>

      {/* Spacer pushes icons to the right */}
      <div className="ml-auto flex items-center gap-6">
        {/* Friends and Calendar */}
        <nav className="flex items-center gap-3">
          <Link
            href="/friends"
            className={`
              relative flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300
              ${scrolled ? 'bg-blue-900/50 hover:bg-blue-900/70' : 'bg-transparent hover:bg-blue-900/70'}
            `}
          >
            <UserStar className="h-6 w-6 text-white transition-colors duration-300" />
          </Link>

          <Link
            href="/calendar"
            className={`
              relative flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300
              ${scrolled ? 'bg-blue-900/50 hover:bg-blue-900/70' : 'bg-transparent hover:bg-blue-900/70'}
            `}
          >
            <CalendarDays className="h-6 w-6 text-white transition-colors duration-300" />
          </Link>
        </nav>

        {/* Right: Create Event + Profile */}
        <div className="ml-auto flex items-center gap-4">
          {/* Create Event button */}
          <Link
            href="/createEvent"
            className="group w-fit inline-flex items-center text-black bg-white 
             shadow-lg font-semibold rounded-lg text-lg px-6 py-3 
             transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
          >
            <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
            Create Event
          </Link>

          {/* Profile button with popup */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="h-12 w-12 flex items-center justify-center rounded-full
                 bg-white bg-opacity-20 backdrop-blur-md
                 hover:bg-white hover:bg-opacity-30 transition"
            >
              <User className="h-6 w-6 text-white" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-48
                   bg-white bg-opacity-90 backdrop-blur-xl
                   border border-white border-opacity-20
                   rounded-lg shadow-md py-2 z-[1000]"
              >
                <Link
                  href="/profile-settings"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 transition-colors"
                >
                  <UserCog className="h-5 w-5" />
                  <span className="whitespace-nowrap">Account Settings</span>
                </Link>

                <button
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                  onClick={async () => {
                    setShowMenu(false)
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
        </div>
      </div>
    </header>
  )
}
