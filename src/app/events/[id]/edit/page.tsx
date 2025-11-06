'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/client'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react'
import Link from 'next/link'
import TimePicker from '@/components/timePicker'
import DynamicBackground from '@/components/DynamicBackground'

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
    rsvpDate: '',
    rsvpTime: '',
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
          rsvpDate: data.rsvp_date ?? '',
          rsvpTime: data.rsvp_time ?? '',
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

  // checkar för create event knappen ska gå från grå till klickbar

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
        rsvp_date: formData.rsvpDate || null,
        rsvp_time: formData.rsvpTime || null,
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
    <main className="relative min-h-screen text-white py-10 px-6 flex items-center justify-center">
      <DynamicBackground imageUrl={selectedImage} />

      {/* Back button */}
      <Link
        href={`/events/${id}`}
        className="fixed top-4 left-4 text-white hover:text-pink-200 z-50 flex items-center gap-1"
      >
        <ArrowLeft size={26} />
        <span className="font-semibold"></span>
      </Link>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl flex flex-col gap-5 p-8 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl z-10"
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
              className="bg-white/40 hover:bg-white/60 text-black rounded-full p-2 backdrop-blur-md shadow-md transition"
            >
              <Shuffle size={20} />
            </button>
            <label className="bg-white/40 hover:bg-white/60 text-black rounded-full p-2 backdrop-blur-md cursor-pointer shadow-md transition">
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

        <label className="text-black font-medium">Event name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/80 border border-white/50"
          required
        />

        <label className="text-black font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/80 border border-white/50"
          required
        />

        <label className="text-black font-medium">Date and time</label>
        <div className="flex gap-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/80 border border-white/50"
            required
          />
          <TimePicker
            value={formData.time}
            onChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
          />
        </div>

        <label className="text-black font-medium">
          End date and time (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/80 border border-white/50"
          />
          <TimePicker
            value={formData.endTime}
            onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
          />
        </div>

        <label className="text-black font-medium">
          RSVP date and time (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            name="rsvpDate"
            value={formData.rsvpDate}
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/80 border border-white/50"
          />
          <TimePicker
            value={formData.rsvpTime}
            onChange={(v) => setFormData((prev) => ({ ...prev, rsvpTime: v }))}
          />
        </div>

        <label className="text-black font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/80 border border-white/50 resize-none"
        />

        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-lg hover:opacity-90 transition shadow-md mt-2"
        >
          Save Changes
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${
              status === 'success' ? 'text-green-200' : 'text-yellow-200'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
