'use client'

import EventChat from '@/components/EventChat'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EventChatPage() {
  const params = useParams()
  const rawId = params?.id

  // Säkerställ att eventId alltid är string
  const eventId = Array.isArray(rawId) ? rawId[0] : (rawId ?? 'test')

  return (
    <>
      <Link
        href={`/events/${eventId}`}
        className="fixed top-4 left-4 text-pink-600 hover:text-pink-800 z-50"
        aria-label="Back to main page"
      >
        <ArrowLeft size={26} />
      </Link>

      <EventChat eventId={eventId} />
    </>
  )
}
