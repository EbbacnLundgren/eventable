'use client'
import { useState } from 'react'
import { supabase } from '@/lib/client'

export default function JoinEvent({ eventId }: { eventId: number | string }) {
  const [joined, setJoined] = useState(false)
  const [busy, setBusy] = useState(false)

  const onJoin = async () => {
    if (busy) return
    setBusy(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      alert('You must be logged in.')
      setBusy(false)
      return
    }

    // ✅ Gör event_id till number (bigint i DB)
    const eid = typeof eventId === 'string' ? Number(eventId) : eventId
    if (!Number.isFinite(eid)) {
      console.error('Invalid eventId:', eventId)
      setBusy(false)
      return
    }

    const { data: existing } = await supabase
      .from('event_invites')
      .select('id')
      .eq('event_id', eid)
      .eq('invited_user_id', userId)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase
        .from('event_invites')
        .insert({ event_id: eid, invited_user_id: userId })

      if (error) {
        console.error('Insert invite error:', error)
        setBusy(false)
        return
      }
    }

    setJoined(true)
    setBusy(false)
    setTimeout(() => setJoined(false), 2000)
  }
  return (
    <>
      <button
        type="button"
        onClick={onJoin}
        disabled={busy}
        className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition disabled:opacity-60"
      >
        {busy ? 'Joining…' : 'Join event'}
      </button>

      {joined && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                     rounded-xl border border-white/30 bg-white/90 text-gray-900
                     px-4 py-2 shadow-lg backdrop-blur-sm"
        >
          You joined this event!
        </div>
      )}
    </>
  )
}
