'use client'
import { useState, FormEvent, ChangeEvent } from 'react'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'

interface Event {
  id: number
  name: string
  location: string
  date: string
  time: number | null
  description?: string
  image?: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    description: '',
    image: null as File | null,
    user_id: '',
  })
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    setStatus('idle')

    let imageUrl: string | null = null

    // Ladda upp bild om vald
    if (formData.image) {
      try {
        imageUrl = await uploadEventImage(formData.image, Date.now())
      } catch (error) {
        console.error('Image upload failed:', error)
        setMessage('Failed to upload image. Please try again.')
        setStatus('error')
        return
      }
    }

    // Förbered data för insert
    const insertData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time !== '' ? Number(formData.time) : null,
      description: formData.description,
      image: imageUrl,
    }

    const { error } = await supabase
      .from('events')
      .insert([insertData])
      .select()
      .single<Event>()

    if (error) {
      console.error('Error creating event:', error)
      setMessage('Failed to create event. Check console for details.')
      setStatus('error')
      return
    }

    setStatus('success')
    setMessage('Event created successfully! Redirecting...')
    setTimeout(() => router.push('/main'), 1500)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, files } = e.target
    if (name === 'image' && files) {
      setFormData((prev) => ({ ...prev, image: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-3 p-6 rounded-xl 
                   text-black bg-white/80 backdrop-blur-md border border-pink-200 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center text-pink-700 mb-2">
          Create a New Event
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Event name"
          value={formData.name}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />
        <div className="flex gap-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="border p-2 rounded flex-1"
            required
          />
          <input
            type="number"
            name="time"
            inputMode="numeric"
            placeholder="Hour (0–23)"
            value={formData.time}
            onChange={handleInputChange}
            className="border p-2 rounded flex-1"
            min={0}
            max={23}
          />
        </div>
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleInputChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-semibold mt-2"
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
