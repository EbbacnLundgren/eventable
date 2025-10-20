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
  const [userInfo, setUserInfo] = useState<{
    id: string
    email: string
  } | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      let userId: string | null = null

      // Supabase Auth
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      if (supabaseUser?.id) {
        userId = supabaseUser.id
        setUserInfo({ id: userId, email: supabaseUser.email || 'unknown' })
      }
      // Google login
      else if (session?.user?.email) {
        const { data: googleUser, error } = await supabase
          .from('google_users')
          .select('id, email')
          .eq('email', session.user.email)
          .single()

        if (googleUser && !error) {
          userId = googleUser.id
          setUserInfo({ id: googleUser.id, email: googleUser.email })
        }
      }

      if (!userId) {
        setEvents([])
        return
      }

      // Hämta events för den användaren
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (error) console.error('Error fetching events:', error)
      if (eventsData) setEvents(eventsData)
    }

    fetchEvents()
  }, [session])

  const addEvent = (event: Event) => setEvents((prev) => [...prev, event])

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white flex flex-col items-center">
      {userInfo && (
        <p className="text-lg font-semibold mb-4">
          Hej {userInfo.email} (ID: {userInfo.id})
        </p>
      )}

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

      <EventSection events={events} />
    </div>
  )
}
