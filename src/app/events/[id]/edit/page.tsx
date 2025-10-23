'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/client'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react'
import Link from 'next/link'
import TimePicker from '@/components/timePicker'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    description: '',
    image: '' as string | File,
  })
  const [selectedImage, setSelectedImage] = useState<string>('')

  const defaultImages = [
    '/images/default1.jpg',
    '/images/default2.jpg',
    '/images/default3.jpg',
    '/images/default4.jpg',
  ]

  // --- 1) Ladda befintligt event ---
  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (error || !data) {
        setMessage('Failed to load event.')
        setStatus('error')
      } else {
        setFormData({
          name: data.name ?? '',
          location: data.location ?? '',
          date: data.date ?? '',
          time: data.time ?? '',
          endDate: data.end_date ?? '',
          endTime: data.end_time ?? '',
          description: data.description ?? '',
          image: data.image ?? '',
        })
        setSelectedImage(data.image ?? defaultImages[0])
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

  // --- 2) Hantera input ---
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))
      setSelectedImage(URL.createObjectURL(file))
    }
  }

  function handleRandomize() {
    let random = selectedImage
    while (random === selectedImage) {
      random = defaultImages[Math.floor(Math.random() * defaultImages.length)]
    }
    setSelectedImage(random)
    setFormData((prev) => ({ ...prev, image: random }))
  }

  // --- 3) Uppdatera event ---
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('idle')
    setMessage('')

    let imageUrl = typeof formData.image === 'string' ? formData.image : null

    if (formData.image instanceof File) {
      try {
        imageUrl = await uploadEventImage(formData.image, Date.now())
      } catch (err) {
        console.error('Upload failed:', err)
        setMessage('Failed to upload image')
        setStatus('error')
        return
      }
    }

    const startDateTime = new Date(
      `${formData.date}T${formData.time || '00:00'}`
    )
    const endDateTime =
      formData.endDate || formData.endTime
        ? new Date(
            `${formData.endDate || formData.date}T${formData.endTime || formData.time || '00:00'}`
          )
        : null

    if (endDateTime && endDateTime < startDateTime) {
      setMessage('End time cannot be before start time.')
      setStatus('error')
      return
    }

    //console.log('Submitting changes:', formData)

    const { error } = await supabase
      .from('events')
      .update({
        name: formData.name,
        location: formData.location,
        date: formData.date,
        time: formData.time || null,
        end_date: formData.endDate || null, // ändrat
        end_time: formData.endTime || null, // ändrat
        description: formData.description,
        image: imageUrl,
      })
      .eq('id', Number(id))

    if (error) {
      console.error('Error updating event:', error)
      setMessage('Failed to update event.')
      setStatus('error')
      return
    }

    setStatus('success')
    setMessage('Event updated successfully!')
    setTimeout(() => router.push(`/events/${id}`), 1000)
  }

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </main>
    )

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-pink-100 p-6">
      <Link
        href={`/events/${id}`}
        className="fixed top-4 left-4 text-pink-600 hover:text-pink-800 z-50"
      >
        <ArrowLeft size={26} />
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-5 p-8 rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl"
      >
        {/* Image */}
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
            >
              <Shuffle size={20} />
            </button>
            <label className="bg-purple-200 hover:bg-purple-300 text-black rounded-full p-2 backdrop-blur-md cursor-pointer shadow-md transition">
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
          Edit Event
        </h2>

        <label className="font-serif text-purple-600">Event name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/40 border border-white/50"
          required
        />

        <label className="font-serif text-purple-600">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/40 border border-white/50"
          required
        />

        <label className="font-serif text-purple-600">Date and time</label>
        <div className="flex gap-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/40 border border-white/50"
            required
          />
          <TimePicker
            value={formData.time}
            onChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
          />
        </div>

        <label className="font-serif text-purple-600">
          End date and time (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/40 border border-white/50"
          />
          <TimePicker
            value={formData.endTime}
            onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
          />
        </div>

        <label className="font-serif text-purple-600">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/40 border border-white/50 resize-none"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-semibold mt-2"
        >
          Save Changes
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
