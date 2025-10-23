'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { supabase } from '@/lib/client'

export default function EditEventButton({
  eventUserId,
  eventId,
}: {
  eventUserId: string
  eventId: string
}) {
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    async function checkHost() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Direkt match
      if (user.id === eventUserId) {
        setIsHost(true)
        return
      }

      // Kolla i google_users via email
      if (user.email) {
        const { data: gUser } = await supabase
          .from('google_users')
          .select('id')
          .eq('email', user.email)
          .single()
        if (gUser?.id === eventUserId) setIsHost(true)
      }
    }
    checkHost()
  }, [eventUserId])

  if (!isHost) return null

  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                 bg-white/20 border border-white/30 hover:bg-white/30
                 text-white transition"
      title="Edit event"
    >
      <Pencil size={18} />
      <span>Edit</span>
    </Link>
  )
}
