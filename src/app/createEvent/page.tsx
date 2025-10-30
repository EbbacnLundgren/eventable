'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import TimePicker from '@/components/timePicker'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react'
import Link from 'next/link'
//import MovingBackground from '@/components/MovingBackground'
import { Pencil } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    description: '',
    image: null as File | null,
    allowInviteesToInvite: false,
  })
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const { data: session } = useSession()

  const defaultImages = [
    '/images/default1.jpg',
    '/images/default2.jpg',
    '/images/default3.jpg',
    '/images/default4.jpg',
    '/images/default5.jpg',
  ]

  const [selectedImage, setSelectedImage] = useState(defaultImages[0])

  function handleRandomize() {
    let random = selectedImage
    while (random === selectedImage) {
      random = defaultImages[Math.floor(Math.random() * defaultImages.length)]
    }
    setSelectedImage(random)
    setFormData((prev) => ({ ...prev, image: null }))
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      const url = URL.createObjectURL(file)
      setSelectedImage(url)
    }
  }

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    setStatus('idle')

    // 1) Försök Supabase Auth först (samma som i MainPage)
    let userId: string | null = null

    // 1) Hämta email från Supabase Auth eller NextAuth
    let email: string | null = null
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()
    if (supabaseUser?.email) email = supabaseUser.email
    else if (session?.user?.email) email = session.user.email

    if (!email) {
      setMessage('You must be logged in to create an event.')
      setStatus('error')
      return
    }

    // 2) Försök använda google_users.id först (matchar MainPage & invites)
    const { data: gUser } = await supabase
      .from('google_users')
      .select('id')
      .eq('email', email)
      .single()

    if (gUser?.id) {
      userId = gUser.id
    } else if (supabaseUser?.id) {
      // fallback till Supabase UID om ingen google_users-rad finns
      userId = supabaseUser.id
    }

    if (!userId) {
      setMessage('You must be logged in to create an event.')
      setStatus('error')
      return
    }

    // 2. Hantera bild (antingen uppladdad eller default)
    let imageUrl: string | null = null

    if (formData.image) {
      // User uploaded their own file
      try {
        imageUrl = await uploadEventImage(formData.image, Date.now())
      } catch (error) {
        console.error('Image upload failed:', error)
        setMessage('Failed to upload image. Please try again.')
        setStatus('error')
        return
      }
    } else if (selectedImage) {
      // User picked a default image
      imageUrl = selectedImage
    }

    // 3. Förbered data för insert
    const insertData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time || null,
      end_date: formData.endDate || null,
      end_time: formData.endTime || null,
      description: formData.description,
      image: imageUrl,
      user_id: userId,
    }

    //dubbelkolla ås tiden stämmer (inte i dåtiden)
    const now = new Date()
    const startDateTime = new Date(
      `${formData.date}T${formData.time || '00:00'}`
    )
    const endDateTime =
      formData.endDate || formData.endTime
        ? new Date(
            `${formData.endDate || formData.date}T${formData.endTime || formData.time || '00:00'}`
          )
        : null

    if (startDateTime < now) {
      setMessage('That date has already been.')
      setStatus('error')
      return
    }

    if (endDateTime && endDateTime < startDateTime) {
      setMessage('End time cannot be before start time.')
      setStatus('error')
      return
    }

    // 4. Spara i databasen
    const { error } = await supabase.from('events').insert([insertData])

    if (error) {
      console.error('Error creating event:', error)
      setMessage('Failed to create event.')
      setStatus('error')
      return
    }

    // 5. Om lyckat
    setStatus('success')
    setMessage('Event created successfully! Redirecting...')
    setTimeout(() => router.push('/main'), 1500)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-pink-100 p-6">
      <DynamicBackground imageUrl={selectedImage} />
      <Link
        href="/main"
        className="fixed top-4 left-4 text-pink-600 hover:text-pink-800 z-50"
        aria-label="Back to main page"
      >
        <ArrowLeft size={26} />
      </Link>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault()
        }}
        className="w-full max-w-2xl flex flex-col gap-5 p-8 rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl"
      >
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <img
            key={selectedImage}
            src={selectedImage}
            alt="Event banner"
            className="object-cover w-full h-full transition-all duration-300"
          />

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center justify-center w-10 h-10 rounded-full 
             bg-gradient-to-r from-pink-500 to-orange-400 text-white 
             shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
              title="Randomize image"
            >
              <Shuffle size={20} />
            </button>
            <label
              className="flex items-center justify-center w-10 h-10 rounded-full 
             bg-gradient-to-r from-pink-500 to-orange-400 text-white 
             shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
              title="Upload image"
            >
              <ImageIcon size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/*
        <h2 className="font-sans text-2xl font-bold text-center text-gray-800">
          Create Event
        </h2>

        <div className="flex flex-col gap-3">
          <label className="font-sans text-gray-600">Event name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          /> */}

        <div className="flex flex-col gap-3">
          <div className="flex justify-center w-full">
            <div className="relative inline-flex items-center">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="font-sans text-3xl font-bold text-center bg-transparent 
       text-gray-800 focus:outline-none focus:ring-0 border-none pr-0"
                required
              />
              {formData.name === '' && (
                <span className="absolute inset-0 flex justify-center items-center pointer-events-none text-gray-600 font-bold text-3xl">
                  Event name
                  <Pencil size={18} className="ml-2 text-gray-500 opacity-70" />
                </span>
              )}
            </div>
          </div>

          <label className="font-sans text-gray-600">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <label className="font-sans text-gray-600">Date and time</label>
          <div className="flex gap-2">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="text-black flex-1 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50"
              required
            />
            <TimePicker
              value={formData.time}
              onChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
            />
          </div>

          <label className="font-sans text-gray-600">
            End date and time (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="text-black flex-1 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50"
            />
            <TimePicker
              value={formData.endTime}
              onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
            />
          </div>

          <label className="font-sans text-gray-600">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="allowInviteesToInvite"
            checked={formData.allowInviteesToInvite}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                allowInviteesToInvite: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-pink-500"
          />
          <label
            htmlFor="allowInviteesToInvite"
            className="font-sans text-gray-600"
          >
            Allow invitees to invite others
          </label>
        </div>

        <button
          type="submit"
          className="group mx-auto w-fit inline-flex items-center justify-center text-white bg-gradient-to-r from-pink-500 to-orange-400 
             shadow-lg font-semibold rounded-lg text-lg px-8 py-4 
             transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
        >
          Create Event
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${
              status === 'success' ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
