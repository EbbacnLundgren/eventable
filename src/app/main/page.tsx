"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import EventSection from "@/components/eventsection"
import { uploadEventImage } from "@/lib/uploadEventImage"


interface Event {
  id: number
  name: string
  location: string
  date: string
  time: number
  image?: string
  //participants: Users
}

export default function MainPage() {
  const [events, setEvents] = useState<Event[]>([])
  const router = useRouter()
  
  const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    time: "",
    image: null as File | null,
    })

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()

      let imageUrl: string | null = null


      if (formData.image) {
        try {
          imageUrl = await uploadEventImage(formData.image, Date.now())
          console.log("Image uploaded:", imageUrl)
        } catch (error) {
          console.error("Image upload failed:", error)
          alert("Failed to upload image. Please try again.")
          return
        }
      }

      const insertData = {
        name: formData.name,
        location: formData.location,
        date: formData.date,
        time: formData.time ? Number(formData.time) : null, // convert empty string to null
        image: imageUrl, // can be null
      }

      console.log("Inserting event:", insertData)

    const { error } = await supabase.from("events").insert([insertData])

      if (error) {
        console.error("Error creating event:", error)
        alert("Failed to create event. Check console for details.")
        return
      }

      setFormData({ name: "", location: "", date: "", time: "", image: null })
      setShowForm(false)

    const { data: eventsData } = await supabase.from("events").select("*")
      if (eventsData) setEvents(eventsData)
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value, files } = e.target
      if (name === "image" && files) {
        setFormData((prev) => ({ ...prev, image: files[0] }))
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
  }


  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData, error: eventsError } = await supabase.from("events").select("*")
      if (eventsData) setEvents(eventsData)
    }

    fetchEvents()

  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white flex flex-col">
      {/* Top bar */}
      <Header/>
  

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center ">

        <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-fit text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-2 py-2.5 text-center me-2 mb-2"
          >+ Create Event
        </button>

        {showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <form
      onSubmit={handleSubmit}
      className="w-96 flex flex-col gap-3 p-6 rounded-lg 
             text-white bg-[#ffbcbf]/50 backdrop-blur-md 
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
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        name="time"
        placeholder="Time (hour)"
        value={formData.time}
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



        <h1 className="text-2xl font-bold mb-4">Welcome</h1>

        {/* Use UpcomingEvents component instead of <ul> */}
        <EventSection events={events} />
        
      </div>
    </main>

  )
}
