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
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUser(data.user as unknown as SupabaseUser)
    }
    fetchUser()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setMessage(error.message)
    else router.push('/main')
  }

  return (
    <div className="border p-6 rounded shadow-md w-80 bg-white/70 backdrop-blur-md border-pink-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Log in</h2>

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
          className="p-2 rounded text-white bg-[#1B0D6B]/70 hover:bg-[#1B0D6B]/90"
        >
          Log in
        </button>
      </form>

      <p className="mt-3 text-sm text-gray-800">
        Don’t have an account?{' '}
        <Link
          href="/signup"
          className="text-pink-600 hover:text-pink-700 underline font-semibold"
        >
          Create one
        </Link>
      </p>

      <hr className="my-4 border-pink-200" />

      <button
        onClick={() => signIn('google', { callbackUrl: '/main' })}
        className="px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition"
      >
        Log in with Google
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  )
}
