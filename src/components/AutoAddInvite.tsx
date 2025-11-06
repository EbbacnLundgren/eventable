'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/client'
import { useSession } from 'next-auth/react'

export default function AutoAddInvite({ eventId }: { eventId: number }) {
  const { data: session } = useSession()
  const [msg, setMsg] = useState<string | null>(null)

  type InviteStatus = 'pending' | 'accepted' | 'declined' | null
  interface InviteRow {
    id: string
    status: InviteStatus
  }
  interface DbError {
    code?: string
    message?: string
    details?: string
  }

  useEffect(() => {
    ; (async () => {

      let email: string | null = null
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      if (supabaseUser?.email) email = supabaseUser.email
      else if (session?.user?.email) email = session.user.email

      if (!email) {
        setMsg('Log in to see this event.')
        return
      }


      const { data: gUser, error: upErr } = await supabase
        .from('google_users')
        .upsert(
          {
            email,
            first_name: session?.user?.name?.split(' ')[0] || '',
            last_name: session?.user?.name?.split(' ')[1] || '',
            avatar_url: session?.user?.image || '',
            created_at: new Date().toISOString(),
            phone_nbr: '',
          },
          { onConflict: 'email' }
        )
        .select('id')
        .single()

      if (upErr || !gUser?.id) {
        setMsg('Could not find user.')
        return
      }

      const userId = gUser.id as string
      const eid = Number(eventId)
      if (!Number.isFinite(eid)) {
        setMsg('Invalid event.')
        return
      }

      try {
        const { data: ev } = await supabase
          .from('events')
          .select('user_id')
          .eq('id', eid)
          .single()

        if (ev && ev.user_id && String(ev.user_id) === String(userId)) {

          return
        }
      } catch (e) {
        console.error('Error checking event owner in AutoAddInvite:', e)
      }

      const storageKey = `inviteToast:${userId}:${eid}`


      const { data: existing, error: existErr } = await supabase
        .from('event_invites')
        .select('id, status')
        .eq('event_id', eid)
        .eq('invited_user_id', userId)
        .maybeSingle<InviteRow>()

      if (existErr) {
        setMsg('Could not control invite')
        return
      }


      if (existing?.status === 'accepted' || existing?.status === 'declined') {
        return
      }


      if (!existing) {
        const { error: insErr } = await supabase
          .from('event_invites')
          .insert({ event_id: eid, invited_user_id: userId, status: 'pending' })

        if (insErr) {
          const dbErr = insErr as DbError
          const isUniqueViolation = dbErr.code === '23505'
          if (!isUniqueViolation) {
            setMsg('Could not add event.')
            return
          }
        }


        if (!localStorage.getItem(storageKey)) {
          setMsg('This event has been added to your page')
          localStorage.setItem(storageKey, '1')
          setTimeout(() => setMsg(null), 2000)
        }
        return
      }


      if (existing.status === 'pending' && !localStorage.getItem(storageKey)) {
        setMsg('This event already exists on your page.')
        localStorage.setItem(storageKey, '1')
        setTimeout(() => setMsg(null), 2000)
      }
    })()
  }, [eventId, session])

  if (!msg) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                 rounded-xl border border-white/30 bg-white/90 text-gray-900
                 px-4 py-2 shadow-lg backdrop-blur-sm"
    >
      {msg}
    </div>
  )
}
