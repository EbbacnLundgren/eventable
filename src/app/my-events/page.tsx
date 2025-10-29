'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import EventChat from '@/components/EventChat'
import { supabase } from '@/lib/client'

export default function Page() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  if (!currentUserId) return <div>Logga in för att se chatten</div>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <EventChat
        eventId="123"
        supabaseUserId={currentUserId}
        eventMemberIds={[currentUserId]}
        eventName="Mina Eventet"
      />
    </div>
  )
}
