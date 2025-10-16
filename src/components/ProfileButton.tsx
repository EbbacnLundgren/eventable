'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

interface ProfileButtonProps {
  color: string
  image?: string
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ color, image }) => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/profile-settings')}
      className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
    >
      {image ? (
        <img src={image} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${color}`} />
      )}
    </button>
  )
}

export default ProfileButton
