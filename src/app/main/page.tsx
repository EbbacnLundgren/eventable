'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import EventSection from '@/components/eventsection'
import CreateEventForm from '@/components/createEventForm'
import Link from 'next/link'

interface Event {
  id: number
  name: string
  location: string
  date: string
  time: number
  image?: string
}

export default function MainPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: eventsData } = await supabase.from('events').select('*')
      if (eventsData) setEvents(eventsData)
    }
    fetchEvents()
  }, [])

  const addEvent = (event: Event) => setEvents((prev) => [...prev, event])

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white flex flex-col items-center">
      <CreateEventForm
        showForm={showForm}
        setShowForm={setShowForm}
        addEvent={addEvent}
      />

      <Link
        href="/createEvent"
        className="w-fit text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 
                   hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 
                   dark:focus:ring-red-400 font-medium rounded-lg text-sm px-2 py-2.5 text-center mb-4 inline-block"
      >
        + Create Event Page
      </Link>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-fit text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-2 py-2.5 text-center mb-4"
      >
        + Create Event Pop-up
      </button>

      <EventSection events={events} />
    </div>
  )
}
