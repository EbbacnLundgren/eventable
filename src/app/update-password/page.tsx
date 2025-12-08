'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token') || access_token
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token })
      }
    }
  }, [])

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setStatus('idle')

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

    if (!passwordRegex.test(password)) {
      setMessage(
        'Password must be at least 8 characters long and include a number, a letter, and a special character.'
      )
      setStatus('error')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else {
      await supabase.auth.signOut()
      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Link
        href={`/`}
        className="fixed top-4 left-4 z-50 flex items-center gap-1
             text-white hover:text-pink-200
             bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold"></span>
      </Link>

      <div className="flex flex-col items-center">
        <div
          className="
            border px-10 py-8 rounded-2xl shadow-lg w-full max-w-md
            bg-white/80 backdrop-blur-xl border-pink-200 text-gray-800
          "
        >
          <h1 className="text-4xl font-extrabold text-center text-pink-600 drop-shadow-sm tracking-tight mb-1">
            Eventable
          </h1>

          <p className="text-gray-700 text-center font-medium -mt-1 mb-6">
            Set a new password
          </p>

          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                New password
              </label>

              <input
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full p-2 rounded-xl border border-gray-300 text-black 
                  focus:outline-none focus:ring-2 focus:ring-blue-400 
                  focus:border-transparent transition
                "
                required
              />
            </div>

            <button
              type="submit"
              className="
                w-full p-2 mt-2 rounded-xl border border-pink-400 font-semibold transition
                bg-gradient-to-r from-pink-500 to-pink-600
                hover:from-pink-600 hover:to-pink-700 text-white
              "
            >
              Update password
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
        </div>
      </div>
    </main>
  )
}
