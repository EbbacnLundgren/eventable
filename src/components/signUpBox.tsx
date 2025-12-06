'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import { signIn } from 'next-auth/react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function SignupBox() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setStatus('idle')

    // Kontrollera om användaren redan finns i google_users
    const { data: existingUser } = await supabase
      .from('google_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      setMessage('This account already exists')
      setStatus('error')
      return
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

    if (!passwordRegex.test(password)) {
      setMessage(
        'Password must be at least 8 characters long and include a number, a letter, and a special character.'
      )
      setStatus('error')
      return
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    )
    if (signUpError) {
      setMessage(signUpError.message)
      setStatus('error')
      return
    }

    const userId = signUpData.user?.id

    if (userId) {
      const { error: insertError } = await supabase
        .from('google_users')
        .upsert({
          id: userId,
          email,
          created_at: new Date().toISOString(),
          first_name: '',
          last_name: '',
          avatar_url: '',
          phone_nbr: '',
        })

      if (insertError) {
        console.error(
          'Fel vid skapande av användare i google_users:',
          insertError
        )
      } else {
        console.log('Användare tillagd i google_users')
      }
    }

    setMessage(
      'Account created. Please check your email to verify your account.'
    )
    setStatus('success')
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative">
      {/* Tillbaka-knapp – ligger UTANFÖR kortet */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1
                 text-white hover:text-pink-200
                 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft size={20} />
      </Link>
      <div className="border px-12 py-10 rounded-2xl shadow-lg w-full max-w-md bg-white/80 backdrop-blur-xl border-pink-200">
        <h1 className="text-5xl font-extrabold text-center text-pink-600 drop-shadow-sm tracking-tight mb-2">
          Eventable
        </h1>
        <p className="text-gray-700 text-center font-medium mb-4">
          Create your account to start planning, sharing, and celebrating events
          with friends!
        </p>

        <p className="mb-3 text-sm text-gray-800 text-center pb-3">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-pink-600 hover:text-pink-700 underline font-semibold"
          >
            Sign in
          </Link>
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/main' })}
          className="relative flex items-center justify-center px-4 py-2 border border-pink-500 rounded-xl bg-white text-black w-full hover:bg-pink-50 transition font-semibold"
        >
          <FcGoogle className="absolute left-4 w-5 h-5" />
          Sign up with Google
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

          <button
            type="submit"
            className={`
      w-full p-2 mt-2 rounded-xl border border-pink-400 font-semibold transition
      ${
        !email || !password
          ? 'bg-pink-500/40 text-white cursor-not-allowed'
          : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white'
      }
    `}
            disabled={!email || !password}
          >
            Sign up
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm text-center ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}
          >
            {message}
          </p>
        )}

        <p className="mt-4 text-sm text-center text-gray-800">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-pink-600 hover:text-pink-700 underline font-semibold"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
