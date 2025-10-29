'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import EventSection from '@/components/eventsection'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Event } from '@/types/event'
import { Plus } from 'lucide-react'

type InviteStatus = 'pending' | 'accepted' | 'declined' | null
interface InviteRow {
  event_id: number
  status: InviteStatus
}

export default function MainPage() {
  const [events, setEvents] = useState<Event[]>([])
  const { data: session } = useSession()
  const [ownEventIds, setOwnEventIds] = useState<number[]>([])
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
      if (ownEvents) setOwnEventIds(ownEvents.map((e: Event) => e.id))

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

  useEffect(() => {
    if (userInfo) {
      console.log(`Hej ${userInfo.email} (ID: ${userInfo.id})`)
    }
  }, [userInfo])

  return (
    <div className="min-h-screen text-white flex flex-col items-center pt-8">





      <Link
        href="/createEvent"
        className="group w-fit inline-flex items-center mb-8 text-white bg-gradient-to-r from-pink-500 to-orange-400 
             shadow-lg font-semibold rounded-lg text-lg px-8 py-4 
             transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
      >
        <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        Create Event
      </Link>

      <EventSection
        events={events}
        pendingIds={pendingIds}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
        ownEventIds={ownEventIds}
      />
    </div>
  )
}
