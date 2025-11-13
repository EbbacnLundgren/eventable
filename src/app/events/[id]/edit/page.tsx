'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/client'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, Shuffle } from 'lucide-react'
import Link from 'next/link'
import TimePicker from '@/components/timePicker'
import DynamicBackground from '@/components/DynamicBackground'
import DeleteEventButton from '@/components/DeleteButtonEvent'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [eventUserId, setEventUserId] = useState<string>('')

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [showEndFields, setShowEndFields] = useState(false)
  const [showRSVPFields, setShowRSVPFields] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [labelColorClass, setLabelColorClass] = useState('text-gray-600')

  const defaultImages = [
    '/images/default1.jpg',
    '/images/default2.jpg',
    '/images/default3.jpg',
    '/images/default4.jpg',
  ]

  useEffect(() => {
    console.log('FormData:', formData)
  }, [formData])

  useEffect(() => {
    let cancelled = false

    async function getContrastClassForImage(url: string | null) {
      if (!url) return 'text-gray-800'

      try {
        const cls = await new Promise<string>((resolve) => {
          const img = new Image()

          img.crossOrigin = 'Anonymous'
          img.src = url

          img.onload = () => {
            const canvas = document.createElement('canvas')
            const size = 40
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve('text-gray-800')
            ctx.drawImage(img, 0, 0, size, size)
            const data = ctx.getImageData(0, 0, size, size).data

            let totalL = 0
            const step = 4 * 2 // sample every 2nd pixel to speed up
            for (let i = 0; i < data.length; i += step) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              // relative luminance (Rec. 709)
              const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
              totalL += lum
            }
            const samples = data.length / step
            const avg = totalL / Math.max(1, samples)
            // threshold ~128 (0-255) - dark background -> white text
            resolve(avg < 128 ? 'text-white' : 'text-gray-800')
          }

          img.onerror = () => resolve('text-gray-800')
        })

        return cls
      } catch {
        return 'text-gray-800'
      }
    }

    ; (async () => {
      const cls = await getContrastClassForImage(selectedImage)
      if (!cancelled) setLabelColorClass(cls)
    })()

    return () => {
      cancelled = true
    }
  }, [selectedImage])

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
        setShowEndFields(!!(data.end_date || data.end_time))
        setShowRSVPFields(!!(data.rsvp_date || data.rsvp_time))
        setEventUserId(data.user_id)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

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

  function getNextHour() {
    const now = new Date()
    if (now.getMinutes() > 0) {
      now.setHours(now.getHours() + 1)
    }
    now.setMinutes(0, 0, 0)
    return now.toTimeString().slice(0, 5)
  }

  function addThreeHoursToTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    date.setHours(date.getHours() + 3)

    const newHours = date.getHours().toString().padStart(2, '0')
    const newMinutes = date.getMinutes().toString().padStart(2, '0')

    return `${newHours}:${newMinutes}`
  }

  // checkar för create event knappen ska gå från grå till klickbar

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

  // Form validation (same rules as createEvent)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isValidDate =
    formData.date &&
    new Date(formData.date) >= new Date(new Date().toDateString())
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.time)
  const isValidEndTime =
    formData.endTime === '' ||
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.endTime)

  const hasPartialEnd =
    (formData.endDate && !formData.endTime) ||
    (!formData.endDate && formData.endTime)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasInvalidEnd =
    (formData.endDate && formData.endTime && !isValidEndTime) || hasPartialEnd

  return (
    <main className="relative min-h-screen text-white py-10 px-6 flex items-center justify-center">
      <DynamicBackground imageUrl={selectedImage} />

      <Link
        href={`/events/${id}`}
        className="fixed top-4 left-4 z-50 flex items-center gap-1
             text-white hover:text-pink-200
             bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold"></span>
      </Link>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl flex flex-col gap-5 p-8 rounded-3xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl z-10"
      >
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          {selectedImage ? (
            <img
              key={selectedImage}
              src={selectedImage}
              alt="Event banner"
              className="object-cover w-full h-full transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}

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
          onBlur={(e) =>
            setTouched((prev) => ({ ...prev, [e.target.name]: true }))
          }
          className="text-black p-3 rounded-xl bg-white/80 border border-white/50"
          required
        />

        <label className="text-black font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          onBlur={(e) =>
            setTouched((prev) => ({ ...prev, [e.target.name]: true }))
          }
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

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (showEndFields) {
                setFormData((prev) => ({
                  ...prev,
                  endDate: '',
                  endTime: '',
                }))
                setShowEndFields(false)
              } else {
                const defaultEndDate = formData.date
                const defaultEndTime = addThreeHoursToTime(
                  formData.time || getNextHour()
                )
                setFormData((prev) => ({
                  ...prev,
                  endDate: defaultEndDate,
                  endTime: defaultEndTime,
                }))
                setShowEndFields(true)
              }
            }}
            aria-label="Toggle end date and time"
            className="relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 hover:scale-105"
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${showEndFields ? 'bg-green-500' : 'bg-gray-400'
                }`}
            />
            <span
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${showEndFields ? 'translate-x-5' : 'translate-x-1'
                }`}
            />
          </button>
          <label className="text-black font-medium">End date and time</label>
        </div>
        {showEndFields && (
          <div className="flex gap-2">
            <input
              type="date"
              name="endDate"
              //max={formData.date}
              value={formData.endDate || ''}
              onChange={handleInputChange}
              className="text-black flex-1 p-3 rounded-xl bg-white/80 border border-white/50"
            />
            <TimePicker
              value={formData.endTime || ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
            />
          </div>
        )}

        <label className="text-black font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="text-black p-3 rounded-xl bg-white/80 border border-white/50 resize-none"
        />

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (showRSVPFields) {
                setFormData((prev) => ({ ...prev, rsvpDate: '', rsvpTime: '' }))
                setShowRSVPFields(false)
              } else {
                const defaultRSVPDate = formData.date
                const defaultRSVPTime = addThreeHoursToTime(
                  formData.time || getNextHour()
                )
                setFormData((prev) => ({
                  ...prev,
                  rsvpDate: defaultRSVPDate,
                  rsvpTime: defaultRSVPTime,
                }))
                setShowRSVPFields(true)
              }
            }}
            className={`relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 ${showRSVPFields ? 'bg-green-500' : 'bg-gray-400'
              }`}
            aria-label="Toggle RSVP date and time"
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${showRSVPFields ? 'translate-x-5' : 'translate-x-1'
                }`}
            />
          </button>

          <label className="text-black font-medium">RSVP date and time</label>
        </div>
        {showRSVPFields && (
          <div className="flex gap-2">
            <input
              type="date"
              name="rsvpDate"
              max={formData.date}
              value={formData.rsvpDate || ''}
              onChange={handleInputChange}
              className="text-black flex-1 p-3 rounded-xl bg-white/80 border border-white/50"
            />
            <TimePicker
              value={formData.rsvpTime || ''}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, rsvpTime: v }))
              }
            />
          </div>
        )}

        <button
          type="submit"
          className="group mx-auto w-fit inline-flex items-center justify-center font-semibold rounded-lg text-lg px-8 py-4 transition-all duration-300 ease-out
    text-white bg-gradient-to-r from-pink-500 to-orange-400 shadow-lg hover:scale-105 hover:shadow-2xl"
        >
          Save Changes
        </button>

        <div className="mt-6 flex justify-center">
          <DeleteEventButton eventUserId={eventUserId} eventId={Number(id)} />
        </div>

        {message && (
          <p
            className={`text-center text-sm mt-2 ${status === 'success' ? 'text-green-200' : 'text-yellow-200'
              }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
