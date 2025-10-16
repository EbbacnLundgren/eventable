'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import EventSection from '@/components/eventsection'
import CreateEventForm from '@/components/createEventForm'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()

  useEffect(() => {
    const fetchEvents = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()

      let query = supabase.from('events').select('*')

      if (supabaseUser?.id) {
        // Supabase-auth user
        query = query.eq('user_id', supabaseUser.id)
      } else if (session?.user?.email) {
        // Google-auth user
        const { data: googleUser, error } = await supabase
          .from('google_users')
          .select('id')
          .eq('email', session.user.email)
          .single()

        if (error || !googleUser) {
          console.warn('Google user not found', session.user?.email)
          setEvents([])
          return
        }

        query = query.eq('user_id', googleUser.id)
      } else {
        // No user logged in
        setEvents([])
        return
      }

      const { data: eventsData, error } = await query.order('date', {
        ascending: true,
      })

      if (error) console.error('Error fetching events:', error)
      if (eventsData) setEvents(eventsData)
    }

    fetchEvents()
  }, [session])


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

      <h1 className="text-2xl font-bold mb-4">Welcome</h1>

      <EventSection events={events} />
    </div>
  )
}
