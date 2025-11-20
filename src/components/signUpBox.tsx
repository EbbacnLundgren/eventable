'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/client'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'

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

    // Kontrollera om användaren redan finns i auth/users
    // const { data: existingUser } = await supabase
    //   .from('users')
    //   .select('id')
    //   .eq('email', email)
    //   .single()

    // if (existingUser) {
    //   setMessage('This account already exists')
    //   setStatus('error')
    //   return
    // }

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

    // const { data: existing } = await supabase
    //   .from('users')
    //   .select('email')
    //   .eq('email', email)
    //   .single()

    // if (existing) {
    //   setMessage('This account already exists')
    //   setStatus('error')
    //   return
    // }

    // Skapa användaren via Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    )
    if (signUpError) {
      setMessage(signUpError.message)
      setStatus('error')
      return
    }

    // Hämta användarens ID
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    // await supabase.from('users').insert({    //insert till auth/users
    //   id: userId,
    //   email,
    //   created_at: new Date().toISOString(),
    //   first_name: '',
    //   last_name: '',
    //   avatar_url: '',
    //   phone_number: '',
    // })

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
    <div className="border p-6 rounded-xl shadow-md w-80 bg-white/80 backdrop-blur-md border-pink-200 text-gray-800">
      <h2 className="text-2xl font-bold mb-2 text-center text-pink-700">
        Create your Eventable account
      </h2>
      <p className="text-sm text-gray-700 text-center mb-4">
        Sign up to start planning, sharing, and celebrating events with friends.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black focus:ring-2 focus:ring-pink-400"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded text-black focus:ring-2 focus:ring-pink-400 w-full"
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

        <button
          type="submit"
          className="p-2 mt-2 rounded text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition font-semibold"
        >
          Sign up
        </button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-pink-200" />
        <span className="mx-2 text-sm text-gray-500">or</span>
        <hr className="flex-grow border-pink-200" />
      </div>

      <button
        onClick={() => signIn('google', { callbackUrl: '/main' })}
        className="px-4 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition font-medium"
      >
        Sign up with Google
      </button>

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
  )
}
