'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/client'
import { Camera, Bell, Shield, Globe, LogOut, Trash2 } from 'lucide-react'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  })

  // Hantera uppladdning av profilbild
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfileImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => alert('Profile saved!')
  const handleChangePassword = () => alert('Password reset requested')
  const handleDeleteAccount = () => alert('Account deletion initiated')
  const handleLogout = () => alert('Logged out')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8">
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
              <img
                src={profileImage}
                alt="Profile"
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
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
          >
            Save Changes
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell /> Notifications
          </h2>

          {['email', 'push', 'sms'].map((type) => (
            <div key={type} className="flex items-center justify-between">
              <div className="capitalize">{type} Notifications</div>
              <input
                type="checkbox"
                checked={notifications[type as keyof typeof notifications]}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [type]: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-pink-500"
              />
            </div>
          ))}
        </div>

        {/* Account */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield /> Account Settings
          </h2>
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
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Change Password
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Delete Account
          </button>
        </div>

        {/* Language */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe /> Language
          </h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Logout */}
        <div className="bg-white shadow rounded-lg p-6">
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
