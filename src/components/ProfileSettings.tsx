'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { supabase } from '@/lib/client'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Hämta profil när session finns
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return

      try {
        const { data: profile, error } = await supabase
          .from('google_users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error)
          return
        }

        if (profile) {
          setUserId(profile.id)
          setFirstName(profile.first_name ?? '')
          setLastName(profile.last_name ?? '')
          setPhone(profile.phone_nbr ?? '')
          setEmail(profile.email ?? session.user.email ?? '')

          // VIKTIGT: använd avatar_url om den finns, inget startsWith eller fallback här
          setProfileImage(
            profile.avatar_url ?? session.user.image ?? '/placeholder.svg'
          )
        } else {
          setEmail(session.user.email ?? '')
          setProfileImage(session.user.image ?? '/placeholder.svg')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      }
    }

    fetchUser()
  }, [session])

  // Ladda upp avatar
  // ----------------------------
  // Ändra bara denna funktion
  // ----------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('--- handleImageUpload called ---')

    if (!e.target.files?.[0]) {
      console.log('No file selected')
      return
    }
    const file = e.target.files[0]
    console.log('Selected file:', file)

    if (!userId) {
      console.log('No userId, cannot upload')
      return
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = fileName

      console.log('fileName:', fileName)
      console.log('filePath:', filePath)

      // valfritt: ta bort gamla varianter
      await supabase.storage
        .from('avatars')
        .remove([`${userId}.jpeg`, `${userId}.png`, `${userId}.jpg`])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image')
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const cacheBustedUrl = `${urlData.publicUrl}?t=${Date.now()}`
      console.log('Public URL:', cacheBustedUrl)

      // 1) uppdatera bilden i UI direkt
      setProfileImage(cacheBustedUrl)

      // 2) spara samma URL i DB, så den överlever reload
      const { error: updateError } = await supabase
        .from('google_users')
        .update({ avatar_url: cacheBustedUrl })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update avatar_url in DB:', updateError)
        alert('Image uploaded, but failed to save in profile')
      } else {
        alert('Image uploaded successfully!')
      }
    } catch (err) {
      console.error('Unexpected error uploading file:', err)
      alert('Failed to upload image')
    }

    console.log('--- handleImageUpload finished ---')
  }

  // Spara profil
  const handleSaveProfile = async () => {
    if (!userId) return alert('User not logged in')

    try {
      const { error } = await supabase
        .from('google_users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_nbr: phone,
          avatar_url: profileImage,
        })
        .eq('id', userId)

      if (error) throw error
      alert('Profile saved!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    }
  }

  if (!session?.user) {
    return <div>Please log in to access profile settings.</div>
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-gray-800">
          Manage your account settings and preferences
        </p>

        {/* Profilkort */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Image
                src={profileImage}
                alt="Profile"
                width={40}
                height={40}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-200 group-hover:ring-pink-400 transition-all"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-900"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-800"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-800"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSaveProfile}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white shadow rounded-lg p-6 flex justify-center">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
