"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import UpcomingEvents from "@/components/upcomingevents"

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
        <button type="button" className ="w-fit text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-2 py-2.5 text-center me-2 mb-2">+ Create Event</button>

        <h1 className="text-2xl font-bold mb-4">Welcome</h1>

        {/* Use UpcomingEvents component instead of <ul> */}
        <UpcomingEvents events={events} />
        
        {/* 
        <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>

        <ul>
          {events.map((event) => (
            <li key={event.id}>
              {event.name} - {event.date} - {event.location}
            </li>
          ))}
        </ul> */}


      </div>
    </main>

  )
}
