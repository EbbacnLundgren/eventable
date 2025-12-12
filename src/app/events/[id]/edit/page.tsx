'use client'

import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/client'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { useRouter, useParams } from 'next/navigation'
import TimePicker from '@/components/timePicker'
import DynamicBackground from '@/components/DynamicBackground'
import DeleteEventButton from '@/components/DeleteButtonEvent'
import BackgroundPicker from '@/components/BackgroundPicker' // Updated component name to match Create
import ImageSelector from '@/components/ImageSelector' // New component
import DOMPurify from 'isomorphic-dompurify'
import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Dynamic import for the Rich Text Editor
const RichTextEditorClient = dynamic(
  () => import('@/components/RichTextEditorClient'),
  { ssr: false }
)

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  // State
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [eventUserId, setEventUserId] = useState<string>('')

  // Background & Style State
  const [bgColor, setBgColor] = useState<string>('#ffffff')
  const [moving, setMoving] = useState<boolean>(true)
  const [imageBaseColor, setImageBaseColor] = useState('#ffffff')
  const [labelColorClass, setLabelColorClass] = useState('text-gray-600')

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    description: '',
    image: null as File | null, // Changed to handle File object primarily
    rsvpDate: '',
    rsvpTime: '',
  })

  const [selectedImage, setSelectedImage] = useState<string>('')
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [showEndFields, setShowEndFields] = useState(false)
  const [showRSVPFields, setShowRSVPFields] = useState(false)

  // --- Helpers for Time ---
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

  // --- 1. Fetch Event Data on Load ---
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
        // Populate form
        setFormData({
          name: data.name ?? '',
          location: data.location ?? '',
          date: data.date ?? '',
          time: data.time ?? '',
          endDate: data.end_date ?? '',
          endTime: data.end_time ?? '',
          description: data.description ?? '',
          image: null, // We keep the file object null, we use selectedImage for preview
          rsvpDate: data.rsvp_date ?? '',
          rsvpTime: data.rsvp_time ?? '',
        })

        // UI State
        setSelectedImage(data.image ?? '')
        setShowEndFields(!!(data.end_date || data.end_time))
        setShowRSVPFields(!!(data.rsvp_date || data.rsvp_time))
        setEventUserId(data.user_id)

        // Background State
        setBgColor(data.background_color ?? '#ffffff')
        setImageBaseColor(data.background_color ?? '#ffffff') // Initialize base color
        setMoving(data.background_moving ?? true)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [id])

  // --- 2. Color Analysis Effect (From Create Event) ---
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
            const step = 4 * 2
            for (let i = 0; i < data.length; i += step) {
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              totalL += 0.2126 * r + 0.7152 * g + 0.0722 * b
            }
            const avg = totalL / (data.length / step)
            resolve(avg < 128 ? 'text-white' : 'text-gray-800')
          }
          img.onerror = () => resolve('text-gray-800')
        })
        return cls
      } catch {
        return 'text-gray-800'
      }
    }

    async function getBaseColor(url: string | null) {
      if (!url) return '#ffffff'
      return new Promise<string>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = url
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 1
          canvas.height = 1
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve('#ffffff')
          ctx.drawImage(img, 0, 0, 1, 1)
          const data = ctx.getImageData(0, 0, 1, 1).data
          const hex =
            '#' +
            ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2])
              .toString(16)
              .slice(1)
          resolve(hex)
        }
        img.onerror = () => resolve('#ffffff')
      })
    }

    ;(async () => {
      // Only run analysis if selectedImage changed.
      // Note: On initial load, we might want to respect the DB saved color,
      // but if the user changes the image, we want to update the color.
      if (selectedImage) {
        const cls = await getContrastClassForImage(selectedImage)
        if (!cancelled) setLabelColorClass(cls)

        // Only update base color if user picks a NEW image (logic can be refined based on preference)
        // For now, we update it to match the create experience
        const baseHex = await getBaseColor(selectedImage)
        if (!cancelled) {
          setImageBaseColor(baseHex)
          // Only override bgColor automatically if we are not loading for the first time
          // or if you prefer the Create Event behavior:
          // setBgColor(baseHex)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedImage])

  // --- Handlers ---
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('idle')
    setMessage('')

    // 1. Image Logic
    let imageUrl = selectedImage // Default to existing URL

    // If a new file was uploaded
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

    // 2. Validation
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

    const cleanDescription = DOMPurify.sanitize(formData.description)

    // 3. Update Supabase
    const { error } = await supabase
      .from('events')
      .update({
        name: formData.name,
        location: formData.location,
        date: formData.date,
        time: formData.time || null,
        end_date: formData.endDate || null,
        end_time: formData.endTime || null,
        description: cleanDescription,
        image: imageUrl,
        rsvp_date: formData.rsvpDate || null,
        rsvp_time: formData.rsvpTime || null,
        background_color: bgColor,
        background_moving: moving,
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

  // --- Render Loading ---
  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </main>
    )

  // --- Validation Checks ---
  const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.time)
  const isValidEndTime =
    formData.endTime === '' ||
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.endTime)
  const hasPartialEnd =
    (formData.endDate && !formData.endTime) ||
    (!formData.endDate && formData.endTime)

  // Is form valid enough to save?
  const isFormComplete =
    formData.name && formData.location && isValidTime && !hasPartialEnd

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <DynamicBackground
        imageUrl={selectedImage}
        colorOverride={bgColor || undefined}
        moving={moving}
      />

      {imageBaseColor && (
        <BackgroundPicker
          defaultColor={bgColor} // Use the current bgColor state
          defaultMoving={moving}
          onChange={(c) => setBgColor(c)}
          onToggleMoving={(m) => setMoving(m)}
        />
      )}

      {/* Back Button */}
      <Link
        href={`/events/${id}`}
        className="fixed top-4 left-8 z-50 flex items-center gap-1
             text-white hover:text-pink-200
             bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg"
      >
        <ArrowLeft size={20} />
        <span className="font-semibold">Back</span>
      </Link>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault()
        }}
        className="w-full max-w-2xl flex flex-col gap-2 p-8 rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl"
      >
        {/* IMAGE SELECTOR (New Component) */}
        <ImageSelector
          selectedImage={selectedImage}
          onImageSelect={(file, url) => {
            if (file) {
              setFormData((prev) => ({ ...prev, image: file }))
              if (url) {
                setSelectedImage(url)
                // Optionally update background color immediately on new image pick:
                // setBgColor(imageBaseColor)
              }
            } else if (url) {
              // Default image selected
              setSelectedImage(url)
              setFormData((prev) => ({ ...prev, image: null })) // Clear file if default picked
            }
          }}
        />

        <label className={`font-sans pt-1 ${labelColorClass}`}>
          Event name{' '}
          {touched.name && !formData.name && (
            <span className="text-red-500">*</span>
          )}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          onBlur={(e) =>
            setTouched((prev) => ({ ...prev, [e.target.name]: true }))
          }
          className={`text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border 
          ${touched.name && !formData.name ? 'border-red-500' : 'border-white/50'}
          focus:outline-none focus:ring-2 focus:ring-pink-400`}
          required
        />

        <label className={`font-sans pt-1 ${labelColorClass}`}>
          Start date and time
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            // Removed min date restriction for Edit, in case event is in past
            onChange={handleInputChange}
            className="text-black flex-1 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50"
            required
          />
          <TimePicker
            value={formData.time}
            onChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
          />
        </div>
        {formData.time && !isValidTime && (
          <p className="text-red-500 text-sm">
            Please enter a valid start time (HH:MM).
          </p>
        )}

        {/* End Date Toggle */}
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
            className="relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 
            hover:scale-105"
          >
            <div
              className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                showEndFields ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                showEndFields ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <label className={`font-sans pt-1 ${labelColorClass}`}>
            End date and time
          </label>
        </div>
        {showEndFields && (
          <div className="flex gap-2">
            <input
              type="date"
              name="endDate"
              min={formData.date}
              value={formData.endDate || ''}
              onChange={handleInputChange}
              className="text-black flex-1 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50"
            />
            <TimePicker
              value={formData.endTime || ''}
              onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
            />
          </div>
        )}
        {hasPartialEnd && (
          <p className="text-red-500 text-sm">
            Please provide both end date and end time.
          </p>
        )}
        {formData.endTime && !isValidEndTime && (
          <p className="text-red-500 text-sm">
            Please enter a valid end time (HH:MM).
          </p>
        )}

        <label className={`font-sans pt-1 ${labelColorClass} `}>
          Location{' '}
          {touched.location && !formData.location && (
            <span className="text-red-500">*</span>
          )}
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          onBlur={(e) =>
            setTouched((prev) => ({ ...prev, [e.target.name]: true }))
          }
          className={`text-black p-3 rounded-xl bg-white/40 backdrop-blur-md border 
          ${touched.location && !formData.location ? 'border-red-500' : 'border-white/50'}
          focus:outline-none focus:ring-2 focus:ring-pink-400`}
          required
        />

        <label className={`font-sans ${labelColorClass}`}>Description</label>

        <RichTextEditorClient
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
        />

        {/* RSVP Toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (showRSVPFields) {
                setFormData((prev) => ({
                  ...prev,
                  rsvpDate: '',
                  rsvpTime: '',
                }))
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
            className={`relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 ${
              showRSVPFields ? 'bg-green-500' : 'bg-gray-400'
            }`}
            aria-label="Toggle RSVP date and time"
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                showRSVPFields ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>

          <label className={`font-sans pt-2 ${labelColorClass}`}>
            RSVP date and time
          </label>
        </div>

        {showRSVPFields && (
          <div className="flex gap-2">
            <input
              type="date"
              name="rsvpDate"
              max={formData.date}
              value={formData.rsvpDate || ''}
              onChange={handleInputChange}
              className="text-black pt-1 flex-1 p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50"
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
          disabled={!isFormComplete}
          className={`group mx-auto w-fit inline-flex items-center justify-center font-semibold rounded-lg text-lg px-8 py-4 transition-all duration-300 ease-out border
            ${
              isFormComplete
                ? 'bg-white/80 border-black text-black hover:bg-gray-100 shadow-sm hover:shadow-md'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
        >
          Save Changes
        </button>

        <div className="mt-6 flex justify-center">
          {/* Kept the delete button as requested */}
          <DeleteEventButton eventUserId={eventUserId} eventId={Number(id)} />
        </div>

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
