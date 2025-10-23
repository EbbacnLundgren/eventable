import { useState } from 'react'
import { uploadEventImage } from '@/lib/uploadEventImage'
import { supabase } from '@/lib/client'
//import { useRouter } from 'next/navigation'

interface Event {
  id: number
  name: string
  location: string
  date: string
  time: number
  description?: string
  image?: string
  //participants: Users
}

interface props {
  showForm: boolean
  setShowForm: (show: boolean) => void
  addEvent: (event: Event) => void
}

export default function CreateEventForm({
  showForm,
  setShowForm,
  addEvent,
}: props) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    description: '',
    image: null as File | null,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let imageUrl: string | null = null

    if (formData.image) {
      try {
        imageUrl = await uploadEventImage(formData.image, Date.now())
        console.log('Image uploaded:', imageUrl)
      } catch (error) {
        console.error('Image upload failed:', error)
        alert('Failed to upload image. Please try again.')
        return
      }
    }

    const insertData = {
      name: formData.name,
      location: formData.location,
      date: formData.date,
      time: formData.time || null,
      description: formData.description,
      image: imageUrl,
    }

    console.log('Inserting event:', insertData)

    const { data, error } = await supabase
      .from('events')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Check console for details.')
      return
    }

    if (data) {
      addEvent(data as Event)
    }

    setFormData({
      name: '',
      location: '',
      date: '',
      time: '',
      description: '',
      image: null,
    })
    setShowForm(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, files } = e.target
    if (name === 'image' && files) {
      setFormData((prev) => ({ ...prev, image: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  if (!showForm) return null

  return (
    <>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="w-96 flex flex-col gap-3 p-6 rounded-lg 
                       text-black bg-[#ffbcbf]/50 backdrop-blur-md 
                       border border-white/30 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-2">Create Event</h2>

            <input
              type="text"
              name="name"
              placeholder="Event Name"
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
                placeholder="Time (hour)"
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
              min={0}
              max={23}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded"
            />

            <div className="flex justify-between mt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
