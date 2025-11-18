'use client'

import EventChat from '@/components/EventChat'
import { useParams } from 'next/navigation'

export default function EventChatPage() {
  const params = useParams()
  const rawId = params?.id

  // Om id är en array, ta första elementet
  const eventId = Array.isArray(rawId) ? rawId[0] : (rawId ?? 'test')

  return <EventChat eventId={eventId} />
}
