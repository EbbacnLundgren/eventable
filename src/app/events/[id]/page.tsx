import { supabase } from '@/lib/client'
import Image from 'next/image'
import Link from 'next/link'

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch event data from Supabase using the dynamic route param
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Link href="/main" className="mt-4 underline text-pink-200">
          ← Back
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/30">
        {/* Back button */}
        <Link
          href="/main"
          className="inline-block mb-6 text-sm text-pink-200 hover:underline"
        >
          ← Back to events
        </Link>

        {/* Event title */}
        <h1 className="text-4xl font-extrabold mb-4 text-center">
          {event.name}
        </h1>

        {/* Event image */}
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

        {/* Event details */}
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
              <strong>Time:</strong> {event.time}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
