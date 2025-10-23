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
      let email: string | null = null

      // Supabase Auth (email/password)
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      if (supabaseUser?.email) {
        email = supabaseUser.email
        // Kolla om det finns en google_user med samma email
        const { data: googleUser } = await supabase
          .from('google_users')
          .select('id')
          .eq('email', email)
          .single()
        userId = googleUser?.id || supabaseUser.id
      }

      // Google login via NextAuth
      else if (session?.user?.email) {
        email = session.user.email
        // Kolla auth.users först
        const { data: supaUser } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single()
        userId = supaUser?.id

        // Om inte finns → upsert i google_users
        if (!userId) {
          const { data: newGoogleUser, error } = await supabase
            .from('google_users')
            .upsert(
              {
                email,
                first_name: session.user.name?.split(' ')[0] || '',
                last_name: session.user.name?.split(' ')[1] || '',
                avatar_url: session.user.image || '',
                created_at: new Date().toISOString(),
                phone_nbr: '',
              },
              { onConflict: 'email' }
            )
            .select()
            .single()

          if (error) {
            console.error('Error upserting google_user:', error)
          }
          userId = newGoogleUser?.id || null
        }
      }

      if (!userId || !email) {
        setEvents([])
        setUserInfo(null)
        return
      }

      setUserInfo({ id: userId, email })

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
