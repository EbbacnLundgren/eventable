'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'

interface RSVPButtonsProps {
  eventId: number
  rsvpDate: string | null
  rsvpTime: string | null
  eventUserId: string | null
}

export default function RSVPButtons({
  eventId,
  rsvpDate,
  rsvpTime,
  eventUserId,
}: RSVPButtonsProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  const router = useRouter()

  const today = new Date()
  const eventRSVPDateTime = rsvpDate
    ? new Date(`${rsvpDate}T${rsvpTime || '23:59'}`)
    : null
  const isRSVPOpen = !eventRSVPDateTime || eventRSVPDateTime > today

  useEffect(() => {
    const fetchStatus = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser?.email) {
        setLoading(false)
        return
      }

      const { data: gUser } = await supabase
        .from('google_users')
        .select('id')
        .eq('email', authUser.email)
        .single()

      if (!gUser) {
        setLoading(false)
        return
      }

      const userId = gUser.id
      setInternalUserId(userId)

      if (eventUserId && String(eventUserId) === String(userId)) {
        setLoading(false)
        return
      }

      const { data: invite } = await supabase
        .from('event_invites')
        .select('status')
        .eq('event_id', eventId)
        .eq('invited_user_id', userId)
        .single()

      if (invite) setStatus(invite.status)
      setLoading(false)
    }

    fetchStatus()
  }, [eventId, eventUserId])

  const handleInviteUpdate = async (
    newStatus: 'accepted' | 'declined' | 'maybe'
  ) => {
    if (!internalUserId || !isRSVPOpen) return
    const oldStatus = status
    setStatus(newStatus)

    try {
      const { error } = await supabase
        .from('event_invites')
        .update({ status: newStatus })
        .eq('event_id', eventId)
        .eq('invited_user_id', internalUserId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error updating invite:', error)
      setStatus(oldStatus)
      alert('Failed to update status')
    }
  }

  const baseClasses =
    'px-4 py-2 text-sm font-medium rounded-lg transition shadow-sm border'

  if (loading)
    return (
      <div className="h-20 animate-pulse bg-white/10 rounded w-full mt-4" />
    )
  if (!internalUserId) return null

  // Helper to display current status text
  const statusDisplay = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : 'Unanswered'

  return (
    <div className="py-4 border-t border-gray-300/50 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-700">
          Your Response:
        </h3>
        <span
          className={`text-sm font-normal ${status ? 'text-gray-800' : 'text-gray-500 italic'}`}
        >
          {statusDisplay}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* ACCEPT */}
        <button
          onClick={() => handleInviteUpdate('accepted')}
          disabled={!isRSVPOpen}
          className={`${baseClasses} 
            ${
              status === 'accepted'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
            }
            ${!isRSVPOpen ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {status === 'accepted' ? '✓ Accepted' : 'Accept'}
        </button>

        {/* DECLINE */}
        <button
          onClick={() => handleInviteUpdate('declined')}
          disabled={!isRSVPOpen}
          className={`${baseClasses} 
            ${
              status === 'declined'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }
             ${!isRSVPOpen ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {status === 'declined' ? '✕ Declined' : 'Decline'}
        </button>

        {/* MAYBE */}
        <button
          onClick={() => handleInviteUpdate('maybe')}
          disabled={!isRSVPOpen}
          className={`${baseClasses} 
            ${
              status === 'maybe'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'
            }
             ${!isRSVPOpen ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {status === 'maybe' ? '? Maybe' : 'Maybe'}
        </button>
      </div>
    </div>
  )
}
