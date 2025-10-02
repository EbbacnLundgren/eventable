import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white">
      <h1 className="text-2xl font-bold">Eventable!</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/') // back to login
        }}
      >
        Logout
      </button>
    </header>
  )
}
