'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'

export default function LoginBox() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const { data: session } = useSession()
  const [showPassword, setShowPassword] = useState(false)

  // När användaren loggar in med Google, skapa/updatera rad i google_users
  useEffect(() => {
    const createGoogleUserIfMissing = async () => {
      if (!session?.user?.email) return

      const email = session.user.email

      // 1. Finns redan en rad i google_users? Gör ingenting.
      const { data: existing, error: gErr } = await supabase
        .from('google_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (gErr) {
        console.error('Error checking google_users:', gErr)
        return
      }

      if (existing) {
        // Rad finns redan → rör inte avatar_url
        return
      }

      // 2. Finns ingen rad → skapa EN gång, med Google-bild som startvärde
      const { error: insertError } = await supabase
        .from('google_users')
        .insert({
          email,
          first_name: session.user.name?.split(' ')[0] || '',
          last_name: session.user.name?.split(' ')[1] || '',
          avatar_url: session.user.image || '',
          created_at: new Date().toISOString(),
          phone_nbr: '',
        })

      if (insertError) {
        console.error('Error inserting google_user:', insertError)
      }
    }

    createGoogleUserIfMissing()
  }, [session])

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
    <div className="border px-10 py-8 rounded-2xl shadow-lg w-full max-w-md bg-white/80 backdrop-blur-xl border-pink-200">
      {/* <Image
        src="/images/icon.png"
        alt="Eventable logo"
        width={100}
        height={100}
        unoptimized
        className="mx-auto mb-4 mix-blend-multiply rounded-full drop-shadow-[0_0_35px_rgba(255,192,203,0.7)]"
      /> */}

      <h1 className="text-5xl font-extrabold text-center text-pink-600 drop-shadow-sm tracking-tight">
        Eventable
      </h1>
      <p className="text-gray-700 text-center font-medium -mt-1 pb-3">
        Log in to your account
      </p>

      <p className="mb-3 text-sm text-gray-800 text-center pb-3">
        Don’t have an account?{' '}
        <Link
          href="/signup"
          className="text-pink-600 hover:text-pink-700 underline font-semibold"
        >
          Create one
        </Link>
      </p>

      <button
        onClick={() => signIn('google', { callbackUrl: '/main' })}
        className="relative flex items-center justify-center px-4 py-2 border border-pink-500 rounded-xl bg-white text-black w-full hover:bg-pink-50 transition font-semibold"
      >
        <FcGoogle className="absolute left-4 w-5 h-5" />
        Log in with Google
      </button>

      <div className="flex items-center gap-4 w-full p-5">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-xl border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />
        </div>

        <div className="flex flex-col relative">
          <label
            htmlFor="password"
            className="mb-1 text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-xl border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-center mt-1 flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={!email || !password}
            className={`
              w-full p-2 mt-2 rounded-xl border border-pink-400 font-semibold transition
              ${
                !email || !password
                  ? 'bg-pink-500/40 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white'
              }
            `}
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

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  )
}
