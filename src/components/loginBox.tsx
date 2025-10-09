'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

interface SupabaseUser {
  id: string
  email: string | null
  [key: string]: unknown
}

export default function LoginBox() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // --- Redirect if already logged in (Supabase or NextAuth) ---
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user || session) {
        router.push('/main')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, session])

  // --- Loading state while checking user ---
  if (loading) {
    return (
      <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30 text-center text-white">
        Checking session...
      </div>
    )
  }

  // --- Handle manual login ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/main')
    }
  }

  return (
    <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30">
      <h2 className="text-xl font-bold mb-4 text-white">Log in</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="p-2 rounded text-white bg-[#1B0D6B]/50 hover:bg-[#1B0D6B]/70"
        >
          Log in
        </button>
      </form>

      {message && <p className="mt-2 text-red-500">{message}</p>}

      <p className="mt-3 text-sm text-white">
        Don’t have an account?{' '}
        <Link
          href="/signup"
          className="text-blue-200 hover:text-blue-300 underline font-semibold"
        >
          Create one
        </Link>
      </p>

      <hr className="my-4 border-white/40" />

      <button
        onClick={() => signIn('google', { callbackUrl: '/main' })}
        className="px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition"
      >
        Log in with Google
      </button>
    </div>
  )
}
