'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setStatus('idle')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setMessage(error.message)
      setStatus('error')
    } else {
      setMessage(
        'Check your email for a password reset link. Be aware that this might take a few minutes.'
      )
      setStatus('success')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative px-4">
      {/* Tillbaka-knapp – ligger UTANFÖR kortet */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1
                 text-white hover:text-pink-200
                 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft size={20} />
      </Link>

      <div className="border px-12 py-10 rounded-2xl shadow-lg w-full max-w-md min-w-[500px] min-h-[300px] bg-white/80 backdrop-blur-xl border-pink-200">
        <h1 className="text-5xl font-extrabold text-center text-pink-600 drop-shadow-sm tracking-tight mb-1">
          Eventable
        </h1>

        <p className="text-gray-700 text-center font-medium -mt-1 pb-3">
          Reset your password
        </p>

        <form
          onSubmit={handleReset}
          className="flex flex-col gap-4 w-full pt-5"
        >
          {/* Email */}
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
              placeholder="Enter your e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            className={`
              w-full p-2 mt-2 rounded-xl border border-pink-400 font-semibold transition
              bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white
            `}
          >
            Send reset link
          </button>
        </form>

        {message && (
          <p
            className={`
              mt-4 text-center text-sm
              ${status === 'success' ? 'text-green-600' : 'text-red-500'}
            `}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-center text-gray-800">
          Remember your password?{' '}
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
