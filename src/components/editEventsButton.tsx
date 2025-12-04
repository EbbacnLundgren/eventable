'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { supabase } from '@/lib/client'

export default function EditEventButton({
  eventUserId,
  eventId,
}: {
  eventUserId: string | number | null | undefined
  eventId: string | number
}) {
  const [isHost, setIsHost] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    async function checkHost() {
      // Try Supabase auth first
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && eventUserId && String(user.id) === String(eventUserId)) {
          setIsHost(true)
          return
        }

        // If Supabase user exists, also attempt to match google_users by email
        if (user?.email && eventUserId) {
          const { data: gUser } = await supabase
            .from('google_users')
            .select('id')
            .eq('email', user.email)
            .single()
          if (gUser && String(gUser.id) === String(eventUserId)) {
            setIsHost(true)
            return
          }
        }

        // Fallback: if user did sign in via NextAuth (Google) but not via Supabase
        if (session?.user?.email && eventUserId) {
          const { data: gUser } = await supabase
            .from('google_users')
            .select('id')
            .eq('email', session.user.email)
            .single()
          if (gUser && String(gUser.id) === String(eventUserId)) {
            setIsHost(true)
            return
          }
        }
      } catch (err) {
        console.error('Error checking host for edit button:', err)
      }
    }
    checkHost()
  }, [eventUserId])

  if (!isHost) return null

  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="border border-black text-black bg-transparent px-4 py-2 rounded-lg hover:bg-black/10 flex items-center gap-2"
      title="Edit event"
    >
      <Pencil size={18} />
      <span>Edit</span>
    </Link>
  )
}
