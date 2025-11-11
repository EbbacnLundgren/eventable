'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteEventButton({
    eventUserId,
    eventId,
}: {
    eventUserId: string | number | null | undefined
    eventId: string | number
}) {
    const [isHost, setIsHost] = useState(false)
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

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

    async function handleDelete() {
        const confirmed = window.confirm(
            'Are you sure you want to delete this event? This action cannot be undone.'
        )
        if (!confirmed) return

        setLoading(true)

        try {
            await supabase.from('event_invites').delete().eq('event_id', Number(eventId))

            const { error } = await supabase.from('events').delete().eq('id', Number(eventId))

            if (error) {
                console.error('Error deleting event:', error)
                alert('Failed to delete event: ' + error.message)
                setLoading(false)
                return
            }

            alert('Event deleted successfully!')
            router.push('/main')
        } catch (err) {
            console.error('Unexpected error deleting event:', err)
            alert('Unexpected error deleting event.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                 bg-red-500 text-white font-medium
                 shadow-lg transition-all duration-300 ease-out
                 hover:scale-105 hover:shadow-2xl disabled:opacity-50"
            title="Delete event"
        >
            <Trash2 size={18} />
            {loading ? 'Deleting...' : 'Delete'}
        </button>
    )
}
