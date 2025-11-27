'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import EventSection from '@/components/eventsection'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Event } from '@/types/event'
import { Plus } from 'lucide-react'
import AdvancedFilters, {
  AdvancedFilterState,
} from '@/components/AdvancedFilters'

type InviteStatus = 'pending' | 'accepted' | 'declined' | 'maybe' | null
interface InviteRow {
  event_id: number
  status: InviteStatus
}
const defaultFilters: AdvancedFilterState = {
  city: '',
  dateFrom: '',
  dateTo: '',
  dayOfWeek: '',
  host: '',
  keyword: '',
}

function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  return days[date.getDay()]
}

function applyFilters(events: Event[], filters: AdvancedFilterState) {
  return events.filter((event) => {
    // --- City filter ---
    if (filters.city && event.location) {
      const eventCity = event.location.toLowerCase()
      const selectedCity = filters.city.toLowerCase()
      if (!eventCity.includes(selectedCity)) return false
    }

    // --- Day of Week filter ---
    if (filters.dayOfWeek) {
      const eventDay = getDayOfWeek(event.date)
      if (eventDay !== filters.dayOfWeek) return false
    }

    // --- Date filter ---
    if (!filters.dateFrom && !filters.dateTo) return true

    const eventStart = event.date
    const eventEnd = event.end_date || event.date

    const from = filters.dateFrom
    const to = filters.dateTo

    if (from && eventEnd <= from) return false
    if (to && eventStart >= to) return false

    return true
  })
}

export default function MainPage() {
  const [filters, setFilters] = useState<AdvancedFilterState>(defaultFilters)
  const [events, setEvents] = useState<Event[]>([])
  const { data: session } = useSession()
  const [ownEventIds, setOwnEventIds] = useState<number[]>([])
  const [userInfo, setUserInfo] = useState<{
    id: string
    email: string
  } | null>(null)

  const [pendingIds, setPendingIds] = useState<number[]>([])
  //const [declinedIds, setDeclinedIds] = useState<number[]>([])

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
          .maybeSingle()
        userId = googleUser?.id || supabaseUser.id
      }

      // Google login via NextAuth
      else if (session?.user?.email) {
        email = session.user.email

        // 1. Försök hitta befintlig google_users-rad
        const { data: existingGoogleUser, error: gErr } = await supabase
          .from('google_users')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (gErr) {
          console.error('Error fetching google_user:', gErr)
        }

        if (existingGoogleUser) {
          // Rad finns redan → använd den, rör inte avatar_url
          userId = existingGoogleUser.id
        } else {
          // 2. Skapa ny rad EN gång vid första gången user går in
          const { data: newGoogleUser, error: insertError } = await supabase
            .from('google_users')
            .insert({
              email,
              first_name: session.user.name?.split(' ')[0] || '',
              last_name: session.user.name?.split(' ')[1] || '',
              avatar_url: session.user.image || '',
              created_at: new Date().toISOString(),
              phone_nbr: '',
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error inserting google_user:', insertError)
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

      const declined = invites
        .filter((i) => i.status === 'declined')
        .map((i) => i.event_id)

      const maybe = invites
        .filter((i) => i.status === 'maybe')
        .map((i) => i.event_id)

      setPendingIds(pending)
      //setDeclinedIds(declined)

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

      //declined events
      let declinedEvents: Event[] = []
      if (declined.length > 0) {
        const { data: decEvents, error: decErr } = await supabase
          .from('events')
          .select('*')
          .in('id', declined)
        if (decErr) console.error('Error fetching declined events:', decErr)
        declinedEvents = (decEvents as Event[]) || []
      }

      //maybe events
      let maybeEvents: Event[] = []
      if (maybe.length > 0) {
        const { data: mEvents, error: mErr } = await supabase
          .from('events')
          .select('*')
          .in('id', maybe)

        if (mErr) console.error('Error fetching maybe events:', mErr)
        maybeEvents = (mEvents as Event[]) || []
      }

      const statusMap = new Map(invites.map((i) => [i.event_id, i.status]))
      const mergedById = new Map<number, Event>()
      for (const ev of [
        ...((ownEvents as Event[]) || []),
        ...invitedEvents,
        ...pendingEvents,
        ...declinedEvents,
        ...maybeEvents,
      ]) {
        const status = statusMap.get(ev.id) || null
        mergedById.set(ev.id, { ...ev, status })
      }

      const allEvents = Array.from(mergedById.values())

      //KOLLA HOSTEN
      const eventsWithHost = await Promise.all(
        allEvents.map(async (event) => {
          let hostLabel: string | null = null

          if (event.user_id) {
            try {
              const { data: profile } = await supabase
                .from('auth.users')
                .select('first_name, last_name, email')
                .eq('id', event.user_id)
                .maybeSingle()

              if (profile) {
                hostLabel = profile.first_name
                  ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                  : profile.email || null
              } else {
                const { data: g } = await supabase
                  .from('google_users')
                  .select('first_name, last_name, email')
                  .eq('id', event.user_id)
                  .maybeSingle()

                if (g) {
                  hostLabel = g.first_name
                    ? `${g.first_name} ${g.last_name || ''}`.trim()
                    : g.email || null
                } else {
                  const { data: authUser } = await supabase
                    .from('auth.users')
                    .select('email')
                    .eq('id', event.user_id)
                    .single()
                  hostLabel = authUser?.email ?? null
                }
              }
            } catch (e) {
              console.error('Error resolving host for event:', e)
            }
          }

          return { ...event, hostLabel }
        })
      )

      //setEvents(eventsWithHost)
      const filteredEvents = applyFilters(eventsWithHost, filters)
      setEvents(filteredEvents)
    }

    fetchEvents()
  }, [session, filters])

  const resolveCurrentUserId = async () => {
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
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: 'accepted' } : ev))
    )

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

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: 'declined' } : ev))
    )

    setPendingIds((prev) => prev.filter((id) => id !== eventId))

    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id === eventId ? { ...ev, status: 'declined' } : ev
      )
    )
  }

  const handleMaybeInvite = async (eventId: number) => {
    const currentUserId = await resolveCurrentUserId()
    if (!currentUserId) return

    const { error } = await supabase
      .from('event_invites')
      .update({ status: 'maybe' })
      .eq('event_id', eventId)
      .eq('invited_user_id', currentUserId)

    if (error) {
      console.error(error)
      return
    }

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: 'maybe' } : ev))
    )

    // Remove from pending if needed
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
      <AdvancedFilters filters={filters} onFiltersChange={setFilters} />

      <EventSection
        events={events}
        pendingIds={pendingIds}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
        onMaybeInvite={handleMaybeInvite}
        ownEventIds={ownEventIds}
      />
    </div>
  )
}
