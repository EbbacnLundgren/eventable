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

  const [profileImage, setProfileImage] = useState<string>('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return

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

        if (profile.avatar_url) {
          setProfileImage(profile.avatar_url + '?t=' + Date.now())
        } else if (session.user.image) {
          setProfileImage(session.user.image)
        } else {
          setProfileImage('')
        }
      } else {
        setEmail(session.user.email ?? '')
        setProfileImage('')
      }
    }

    fetchUser()
  }, [session])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]

    if (!userId) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = fileName

      await supabase.storage
        .from('avatars')
        .remove([`${userId}.jpeg`, `${userId}.png`, `${userId}.jpg`])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error(uploadError)
        alert('Failed to upload image')
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const cleanUrl = urlData.publicUrl
      const cacheBusted = cleanUrl + '?t=' + Date.now()

      setProfileImage(cacheBusted)

      const { error: updateError } = await supabase
        .from('google_users')
        .update({ avatar_url: cleanUrl })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update avatar_url:', updateError)
        alert('Image uploaded but failed to save in DB')
        return
      }

      alert('Image uploaded successfully!')
    } catch (err) {
      console.error(err)
      alert('Unexpected error')
    }
  }

  // SAVE PROFILE
  const handleSaveProfile = async () => {
    if (!userId) return alert('User not logged in')

    try {
      const { error } = await supabase
        .from('google_users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_nbr: phone,
        })
        .eq('id', userId)

      if (error) throw error

      alert('Profile saved!')
    } catch (error) {
      console.error(error)
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

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 ring-4 ring-pink-200" />
              )}
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
                <label className="block text-sm font-medium text-gray-900">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  value={email}
                  disabled
                  className="mt-1 w-full border border-gray-300 rounded px-2 py-1 bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSaveProfile}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Save Changes
            </button>
          </div>
        </div>

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
