'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

interface SupabaseUser {
  id: string
  email: string | null
  [key: string]: unknown
}

export default function LoginBox() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded text-black w-full"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-center mt-1 flex flex-col items-center gap-2">
          <button
            type="submit"
            onClick={() => router.push('/main')}
            className="p-2 mt-2 rounded text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition font-semibold"
          >
            Log in
          </button>

          <Link
            href="/reset-password"
            className="text-sm text-pink-600 hover:text-pink-700 underline center"
          >
            Forgot your password?
          </Link>
        </div>
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
