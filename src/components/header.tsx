'use client' // behövs för interaktivitet

import { useRouter } from 'next/navigation'
import ProfileButton from './ProfileButton'

export default function Header() {
  const router = useRouter()

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white">
      {/* Klickbar titel som leder till main */}
      <button
        onClick={() => router.push('/main')}
        className="text-2xl font-bold bg-transparent hover:underline"
      >
        Eventable!
      </button>

      {/* Profile-knapp */}
      <ProfileButton color="bg-purple-500" />
    </header>
  )
}



/**
 * 
 * <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
        >
          Logout
        </button>
 */