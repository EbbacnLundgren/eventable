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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium
                 shadow-lg transition-all duration-300 ease-out
                 hover:scale-105 hover:shadow-2xl"
      title="Edit event"
    >
      <Pencil size={18} />
      <span>Edit</span>
    </Link>
  )
}
