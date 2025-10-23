'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import TimePicker from '@/components/timePicker'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    description: '',
    image: null as File | null,
  })
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const { data: session } = useSession()

  const defaultImages = [
    '/images/default1.jpg',
    '/images/default2.jpg',
    '/images/default3.jpg',
    '/images/default4.jpg',
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

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()

    if (supabaseUser?.id) {
      userId = supabaseUser.id
    }
    // 2) Annars, om NextAuth-session finns, plocka från google_users
    else if (session?.user?.email) {
      const { data: googleUser, error } = await supabase
        .from('google_users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (googleUser && !error) {
        userId = googleUser.id
      }
    }

    if (!userId) {
      setMessage('Invalid user')
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
      time: formData.time !== '' ? Number(formData.time) : null,
      description: formData.description,
      image: imageUrl,
      user_id: userId, // ← användarens UID
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
      <Link
        href="/main"
        className="fixed top-4 left-4 text-pink-600 hover:text-pink-800 z-50"
        aria-label="Back to main page"
      >
        <ArrowLeft size={26} />
      </Link>

      <form
        onSubmit={handleSubmit}
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
              className="bg-purple-200 hover:bg-purple-300 text-black rounded-full p-2 backdrop-blur-md shadow-md transition"
              title="Randomize image"
            >
              <Shuffle size={20} />
            </button>
            <label
              className="bg-purple-200 hover:bg-purple-300 text-black rounded-full p-2 backdrop-blur-md cursor-pointer shadow-md transition"
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

        <h2 className="font-serif text-2xl font-bold text-center text-pink-800">
          Create Event
        </h2>

        <div className="flex flex-col gap-3">
          <label className="font-serif text-purple-600">Event name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <label className="font-serif text-purple-600">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />

          <label className="font-serif text-purple-600">Date and time</label>
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

          <label className="font-serif text-purple-600">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-semibold mt-2"
        >
          Create Event
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
