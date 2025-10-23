import { supabase } from '@/lib/client'
import Image from 'next/image'
import Link from 'next/link'

import { Camera, Music } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'

import ShareEventButton from '@/components/shareEvents'
import AutoAddInvite from '@/components/AutoAddInvite'
import { formatTime } from '@/lib/formatTime'
import InviteStatusList from '@/components/InviteStatusList'
import EditEventButton from '@/components/editEventsButton'

export default async function EventDetailsPage({
  params,
}: {
  // Next's PageProps in this Next version expect `params` to be a Promise or undefined.
  params?: Promise<{ id: string }>
}) {
  // Await params if provided; if not, treat as missing.
  // Await works for both Promise and non-Promise values at runtime.
  const resolvedParams = params ? await params : undefined
  const id = resolvedParams?.id
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Link href="/main" className="mt-4 underline text-pink-200">
          ← Back
        </Link>
      </div>
    )
  }
  // Fetch event data from Supabase using the dynamic route param
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', Number(id))
    .single()

  //console.log('Update response:', { error })
  //console.log('Event id being updated:', id, '→ as number:', Number(id))

  if (error || !event) {
    return (
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/main"
            className="inline-flex items-center gap-2 text-sm text-pink-200 hover:underline"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
        </div>
      </div>
    )
  }

  // Resolve host (the user who created the event) server-side.
  // Prefer `users`, then `google_users` for name/email lookup.
  let hostLabel: string | null = null
  if (event.user_id) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', event.user_id)
        .single()

      if (profile) {
        hostLabel = profile.first_name
          ? `${profile.first_name} ${profile.last_name || ''}`.trim()
          : profile.email || null
      } else {
        const { data: g } = await supabase
          .from('google_users')
          .select('first_name, last_name, email')
          .eq('id', event.user_id)
          .single()

        if (g) {
          hostLabel = g.first_name
            ? `${g.first_name} ${g.last_name || ''}`.trim()
            : g.email || null
        } else {
          const { data: authUser } = await supabase
            .from('users')
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

  // Fetch invite statuses (accepted / declined) for this event
  const acceptedIds: string[] = []
  const declinedIds: string[] = []
  const pendingIds: string[] = []
  try {
    const { data: invites } = await supabase
      .from('event_invites')
      .select('invited_user_id, status')
      .eq('event_id', event.id)

    if (invites && Array.isArray(invites)) {
      type InvRow = {
        invited_user_id: string
        status: 'accepted' | 'declined' | string | null
      }
      for (const inv of invites as InvRow[]) {
        if (inv.status === 'accepted') acceptedIds.push(inv.invited_user_id)
        else if (inv.status === 'declined')
          declinedIds.push(inv.invited_user_id)
        else if (inv.status === 'pending') pendingIds.push(inv.invited_user_id) // <-- Lägg till
      }
    }
  } catch (e) {
    console.error('Error fetching invites for event detail:', e)
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white py-10 px-6">
      <div className="max-w-5xl mx-auto flex gap-6 items-start">
        {/* --- Left: Box containing event details --- */}
        <div className="flex-1 bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/30">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/main"
              className="inline-flex items-center gap-2 text-sm text-pink-200 hover:underline"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>

            <EditEventButton eventUserId={event.user_id} eventId={event.id} />
          </div>

          <h1 className="text-4xl font-extrabold mb-4 text-center">
            {event.name}
          </h1>

          {event.image && (
            <div className="relative w-full h-64 mb-6">
              <Image
                src={event.image}
                alt={event.name}
                fill
                className="object-cover rounded-xl"
              />
            </div>
          )}

          <div className="space-y-4 text-lg">
            {event.description && (
              <p className="leading-relaxed">{event.description}</p>
            )}

            <div>
              <strong>Location:</strong> {event.location}
            </div>
            <div>
              <strong>Date:</strong>{' '}
              {new Date(event.date).toLocaleDateString('sv-SE', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {event.time && (
              <div>
                <strong>Time:</strong> {formatTime(event.time)}
              </div>
            )}
            {hostLabel && (
              <div>
                <strong>Host:</strong> {hostLabel}
              </div>
            )}
            <AutoAddInvite eventId={Number(event.id)} />

            <InviteStatusList
              acceptedIds={acceptedIds.filter((id) => id !== event.user_id)}
              declinedIds={declinedIds.filter((id) => id !== event.user_id)}
              pendingIds={pendingIds.filter((id) => id !== event.user_id)}
            />

            <div className="mt-6 flex justify-center">
              <ShareEventButton eventId={Number(event.id)} />
            </div>
          </div>
        </div>

        {/* --- Right: Placeholder icons --- */}
        <div className="flex flex-col items-center gap-6">
          {/* Music playlist icon (placeholder) */}
          <a
            href="https://open.spotify.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full shadow-md transition transform hover:scale-105"
            title="Open Spotify Playlist"
          >
            <Music size={36} className="text-white" />
          </a>

          {/* Photo album icon (placeholder) */}
          {
            <a
              href="https://www.google.com/intl/en/photos/about/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full shadow-md transition transform hover:scale-105l"
              title="Open Photo Album"
            >
              <Camera size={36} className="text-white" />
            </a>
          }
        </div>
      </div>
    </main>
  )
}
