'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/client'
import Link from 'next/link'
import Image from 'next/image'

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
      setMessage('Check your email for a password reset link.')
      setStatus('success')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-100">
      <div className="flex flex-col items-center">
        <Image
          src="/images/icon.png"
          alt="Eventable logo"
          width={200}
          height={200}
          unoptimized
          className="mb-4 mix-blend-multiply rounded-full drop-shadow-[0_0_35px_rgba(255,192,203,0.7)]"
        />
        <div className="border p-6 rounded-xl shadow-md w-80 bg-white/80 backdrop-blur-md border-pink-200 text-gray-800">
          <h2 className="text-xl font-bold mb-2 text-center text-pink-700">
            Reset your password
          </h2>
          <p className="text-sm text-gray-700 text-center mb-4">
            Enter your email address and we’ll send you a reset link.
          </p>

          <form onSubmit={handleReset} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-pink-400"
              required
            />
            <button
              type="submit"
              className="p-2 rounded text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition font-semibold"
            >
              Send reset link
            </button>
          </form>

          {message && (
            <p
              className={`mt-3 text-center text-sm ${
                status === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-sm text-center text-gray-800">
            Remembered your password?{' '}
            <Link
              href="/login"
              className="text-pink-600 hover:text-pink-700 underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
