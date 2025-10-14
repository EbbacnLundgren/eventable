'use client'

import { useRouter } from 'next/navigation'

interface ProfileButtonProps {
  color: string // Tailwind-klass, t.ex. bg-purple-500
}

export default function ProfileButton({ color }: ProfileButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/profile-settings')}
      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${color}`}
    >
      {/* Ingen text, bara färgad knapp */}
    </button>
  )
}
