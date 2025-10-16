'use client'

import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

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

    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else {
      await supabase.auth.signOut()
      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
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
            Set a new password
          </h2>
          <p className="text-sm text-gray-700 text-center mb-4">
            Enter your new password below.
          </p>

          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-pink-400"
              required
            />
            <button
              type="submit"
              className="p-2 rounded text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition font-semibold"
            >
              Update password
            </button>
          </form>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
          )}
        </div>
      </div>
    </main>
  )
}
