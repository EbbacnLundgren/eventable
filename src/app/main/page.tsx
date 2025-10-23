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

type InviteStatus = 'pending' | 'accepted' | 'declined' | null
interface InviteRow {
  event_id: number
  status: InviteStatus
}

export default function MainPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const { data: session } = useSession()
  const [userInfo, setUserInfo] = useState<{
    id: string
    email: string
  } | null>(null)

  const [pendingIds, setPendingIds] = useState<number[]>([])

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

      // ---- Steg 1: hämta invites och dela upp pending/accepted ----
      const { data: invitesRaw, error: invErr } = await supabase
        .from('event_invites')
        .select('event_id, status')
        .eq('invited_user_id', userId)

      if (invErr) console.error('Error fetching invites:', invErr)

      const invites: InviteRow[] = (invitesRaw as InviteRow[] | null) ?? []

      const pending = invites
        .filter((i) => i.status === 'pending')
        .map((i) => i.event_id)

      const accepted = invites
        .filter((i) => i.status === 'accepted')
        .map((i) => i.event_id)

      setPendingIds(pending)

      // Egna events
      const { data: ownEvents, error: ownErr } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
      if (ownErr) console.error('Error fetching own events:', ownErr)

      // Accepted-invited events
      // Accepted-invited events
      let invitedEvents: Event[] = []
      if (accepted.length > 0) {
        const { data: accEvents, error: accErr } = await supabase
          .from('events')
          .select('*')
          .in('id', accepted)
        if (accErr) console.error('Error fetching accepted events:', accErr)
        invitedEvents = (accEvents as Event[]) || []
      }

      // Pending-invited events  ← lägg till detta
      let pendingEvents: Event[] = []
      if (pending.length > 0) {
        const { data: pendEvents, error: pendErr } = await supabase
          .from('events')
          .select('*')
          .in('id', pending)
        if (pendErr) console.error('Error fetching pending events:', pendErr)
        pendingEvents = (pendEvents as Event[]) || []
      }

      // Slå ihop och deduplicera på id
      const mergedById = new Map<number, Event>()
      for (const ev of [
        ...((ownEvents as Event[]) || []),
        ...invitedEvents,
        ...pendingEvents,
      ]) {
        mergedById.set(ev.id, ev)
      }
      setEvents(Array.from(mergedById.values()))
    }
    fetchEvents()
  }, [session])

  const resolveCurrentUserId = async () => {
    // Samma logik som i fetchEvents/AutoAddInvite
    let email: string | null = null
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser()
    if (supaUser?.email) email = supaUser.email
    else if (session?.user?.email) email = session.user.email
    if (!email) return null

    // Försök hämta google_users.id (det är detta som används i event_invites)
    const { data: gUser } = await supabase
      .from('google_users')
      .select('id')
      .eq('email', email)
      .single()

    return gUser?.id ?? supaUser?.id ?? null
  }

  const handleAcceptInvite = async (eventId: number) => {
    const currentUserId = await resolveCurrentUserId()
    if (!currentUserId) return

    const { error } = await supabase
      .from('event_invites')
      .update({ status: 'accepted' })
      .eq('event_id', eventId)
      .eq('invited_user_id', currentUserId)

    if (error) {
      console.error(error)
      return
    }

    setPendingIds((prev) => prev.filter((id) => id !== eventId))

    const { data: ev } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    if (ev && !events.find((e) => e.id === ev.id)) {
      setEvents((prev) => [...prev, ev as Event])
    }
  }

  const handleDeclineInvite = async (eventId: number) => {
    const currentUserId = await resolveCurrentUserId()
    if (!currentUserId) return

    const { error } = await supabase
      .from('event_invites')
      .update({ status: 'declined' })
      .eq('event_id', eventId)
      .eq('invited_user_id', currentUserId)

    if (error) {
      console.error(error)
      return
    }

    setPendingIds((prev) => prev.filter((id) => id !== eventId))
  }

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

      <EventSection
        events={events}
        pendingIds={pendingIds}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
      />
    </div>
  )
}
