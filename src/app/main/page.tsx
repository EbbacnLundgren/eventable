"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"

interface Event {
  id: number
  name: string
  location: string
  date: string
  time: number
  //participants: Users
}

export default function MainPage() {
  const [events, setEvents] = useState<Event[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {

      const { data: eventsData, error: eventsError } = await supabase.from("events").select("*")
      if (eventsData) setEvents(eventsData)
    }

    fetchEvents()
  }, [router])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>

      <button
        className="mb-6 bg-red-500 text-white p-2 rounded"
        onClick={async () => {
          await supabase.auth.signOut()
          router.push("/") // back to login
        }}
      >
        Logout
      </button>

      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.name} - {event.date} - {event.location}
          </li>
        ))}
      </ul>
    </main>
  )
}
