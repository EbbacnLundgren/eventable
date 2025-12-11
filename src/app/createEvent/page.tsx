'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import TimePicker from '@/components/timePicker'
import { useSession } from 'next-auth/react'
import DynamicBackground from '@/components/DynamicBackground'
import ImageSelector from '@/components/ImageSelector' //Hanterar bildval
//import { ArrowLeft } from 'lucide-react'
//import Link from 'next/link'
import dynamic from 'next/dynamic'
import BackgroundPicker from '@/components/BackgroundPicker'
import DOMPurify from 'isomorphic-dompurify'

const RichTextEditorClient = dynamic(
  () => import('@/components/RichTextEditorClient'),
  { ssr: false } // bara körs på klienten
)

//import ImageCropper from '@/components/ImageAdjust'
//import ImageAdjust from '@/components/ImageAdjust' //Justare placering och zooma av bild

export default function CreateEventPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: getNextHour(),
    endDate: '',
    endTime: '',
    description: '',
    image: null as File | null,
    allowInviteesToInvite: false,
    rsvpDate: '',
    rsvpTime: '',
  })
  //const [selectedImage, setSelectedImage] = useState(defaultImages[0])
  const [selectedImage, setSelectedImage] = useState('/images/default1.jpg')
  const [showEndFields, setShowEndFields] = useState(false)
  const [showRSVPFields, setShowRSVPFields] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [labelColorClass, setLabelColorClass] = useState('text-gray-600')
  //Hantering av ImageAdjust-modal
  const [, setShowAdjust] = useState(false)
  const [, setTempImage] = useState<string | null>(null)
  const [bgColor, setBgColor] = useState<string>('')
  const [imageBaseColor, setImageBaseColor] = useState('#ffffff')
  const [moving, setMoving] = useState(true)

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
      const cls = await getContrastClassForImage(selectedImage)
      const baseHex = await getBaseColor(selectedImage)
      if (!cancelled) {
        setLabelColorClass(cls)
        setImageBaseColor(baseHex)
        setBgColor(baseHex) // <--- lägg till detta så bakgrunden alltid uppdateras
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedImage])

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  //denna fixar närmsta nästa timme för-inställt
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

    // förhindra cross-site scripting
    const cleanDescription = DOMPurify.sanitize(formData.description)

    // 3. Förbered data för insert
    const insertData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time || null,
      end_date: formData.endDate || null,
      end_time: formData.endTime || null,
      description: cleanDescription,
      image: imageUrl,
      user_id: userId,
      rsvp_date: formData.rsvpDate || null,
      rsvp_time: formData.rsvpTime || null,
      background_color: bgColor,
      background_moving: moving,
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

    if (formData.rsvpDate && formData.rsvpTime) {
      const rsvpDateTime = new Date(`${formData.rsvpDate}T${formData.rsvpTime}`)
      const eventStart = new Date(`${formData.date}T${formData.time}`)

      if (rsvpDateTime >= eventStart) {
        setMessage('RSVP deadline must be before the event start time.')
        setStatus('error')
        return
      }
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

  // checkar för create event knappen ska gå från grå till klickbar
  const isValidDate =
    formData.date &&
    new Date(formData.date) >= new Date(new Date().toDateString())
  const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.time)
  const isValidEndTime =
    formData.endTime === '' ||
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.endTime)

  const hasPartialEnd =
    (formData.endDate && !formData.endTime) ||
    (!formData.endDate && formData.endTime)

  const hasInvalidEnd =
    (formData.endDate && formData.endTime && !isValidEndTime) || hasPartialEnd

  const isFormComplete =
    formData.name &&
    formData.location &&
    isValidDate &&
    isValidTime &&
    !hasInvalidEnd

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <DynamicBackground
        imageUrl={selectedImage}
        colorOverride={bgColor || undefined}
        moving={moving}
      />

      {imageBaseColor && (
        <BackgroundPicker
          defaultColor="#ffffff"
          defaultMoving={true}
          onChange={(c) => setBgColor(c)}
          onToggleMoving={(m) => setMoving(m)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault()
        }}
        className="w-full max-w-2xl flex flex-col gap-2 p-8 rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-2xl"
      >
        {/* IMAGE SELECTOR */}
        <ImageSelector
          selectedImage={selectedImage}
          onImageSelect={(file, url) => {
            if (file) {
              // Användaren laddar upp egen fil → öppna ImageAdjust
              setTempImage(url)
              setShowAdjust(true)
              setFormData((prev) => ({ ...prev, image: file })) // spara filen, men previewen ändras inte än
              if (url) {
                setSelectedImage(url) //kanske inte bästa lösningen men helt plötsligt funkade inte bakgrunden att ändra? (men funkar med denna)
              }
            } else if (url) {
              // Default-bild → visa direkt
              setSelectedImage(url)
            }
          }}
        />

        {/* IMAGE ADJUST -- Funkar inte och jag får damp, måste ta en paus*/}
        {/* {showAdjust && tempImage && (
          <ImageAdjust
            imageUrl={tempImage}
            onCancel={() => {
              console.log('Cancel adjust, tempImage:', tempImage)
              setShowAdjust(false)
              setTempImage(null)
            }}
            onSave={(blob) => {
              const file = new File([blob], `adjusted-${Date.now()}.jpg`, { type: 'image/jpeg' })
              const url = URL.createObjectURL(blob)

              console.log('ImageAdjust onSave called')
              console.log('Blob:', blob)
              console.log('Generated File:', file)
              console.log('Generated URL:', url)

              // Viktigt: uppdatera både formData.image och selectedImage
              setFormData(prev => {
                console.log('Updating formData.image from', prev.image, 'to', file)
                return { ...prev, image: file }
              }) // den som skickas till Supabase
              setSelectedImage(url) // den som visas på eventkortet
              console.log('Updated selectedImage to', url)

              setShowAdjust(false)
              setTempImage(null)
            }}
          />
        )} */}

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
            min={new Date().toISOString().split('T')[0]}
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
                const defaultEndTime = addThreeHoursToTime(formData.time)
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
          {touched.name && !formData.name && (
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
    ${touched.name && !formData.name ? 'border-red-500' : 'border-white/50'}
    focus:outline-none focus:ring-2 focus:ring-pink-400`}
          required
        />

        <label className={`font-sans ${labelColorClass}`}>Description</label>
        {/* <textarea
          name="description"
          value={formData.description}
          onChange={(e) => {
            handleInputChange(e)
            e.target.style.height = 'auto'
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          rows={3}
          className="text-black p-3 pt-1 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none overflow-hidden"
          placeholder="Add a description..."
        /> */}

        <RichTextEditorClient
          value={formData.description}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
        />

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
                const defaultRSVPTime = addThreeHoursToTime(formData.time)
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
        {hasPartialEnd && (
          <p className="text-red-500 text-sm">
            Please provide both date and time.
          </p>
        )}
        {formData.rsvpTime && !isValidTime && (
          <p className="text-red-500 text-sm">
            Please enter a valid time (HH:MM).
          </p>
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
