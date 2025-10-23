'use client'
import { useState } from 'react'
import { supabase } from '@/lib/client'

type Props = {
  acceptedIds: string[]
  declinedIds: string[]
}

export default function InviteStatusList({ acceptedIds, declinedIds }: Props) {
  const [showAccepted, setShowAccepted] = useState(false)
  const [showDeclined, setShowDeclined] = useState(false)
  const [acceptedUsers, setAcceptedUsers] = useState<Array<string> | null>(null)
  const [declinedUsers, setDeclinedUsers] = useState<Array<string> | null>(null)
  const [loading, setLoading] = useState(false)

  const resolveProfiles = async (ids: string[]): Promise<string[]> => {
    if (ids.length === 0) return []
    setLoading(true)
    try {
      // Try users table first
      const { data: appUsers } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', ids)

      const map: Record<string, string> = {}
      if (appUsers) {
        type AppUser = {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
        }
        for (const u of appUsers as AppUser[]) {
          map[u.id] = u.first_name
            ? `${u.first_name} ${u.last_name || ''}`.trim()
            : u.email || u.id
        }
      }

      // Resolve remaining ids from google_users
      const remaining = ids.filter((i) => !map[i])
      if (remaining.length > 0) {
        const { data: googleUsers } = await supabase
          .from('google_users')
          .select('id, first_name, last_name, email')
          .in('id', remaining)

        if (googleUsers) {
          type GoogleUser = {
            id: string
            first_name?: string | null
            last_name?: string | null
            email?: string | null
          }
          for (const g of googleUsers as GoogleUser[]) {
            map[g.id] = g.first_name
              ? `${g.first_name} ${g.last_name || ''}`.trim()
              : g.email || g.id
          }
        }
      }

      // Final fallback: use raw id for any unresolved
      return ids.map((i) => map[i] ?? i)
    } catch (e) {
      console.error('Error resolving invite profiles', e)
      return ids
    } finally {
      setLoading(false)
    }
  }

  const onToggleAccepted = async () => {
    if (!acceptedUsers) {
      const resolved = await resolveProfiles(acceptedIds)
      setAcceptedUsers(resolved)
    }
    setShowAccepted((s) => !s)
    if (showDeclined) setShowDeclined(false)
  }

  const onToggleDeclined = async () => {
    if (!declinedUsers) {
      const resolved = await resolveProfiles(declinedIds)
      setDeclinedUsers(resolved)
    }
    setShowDeclined((s) => !s)
    if (showAccepted) setShowAccepted(false)
  }

  return (
    <div className="mt-4">
      <div className="flex gap-3">
        <button
          onClick={onToggleAccepted}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ({acceptedIds.length}) Accepted
        </button>

        <button
          onClick={onToggleDeclined}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          ({declinedIds.length}) Declined
        </button>
      </div>

      {loading && <p className="mt-2 text-sm text-white/80">Loading...</p>}

      {showAccepted && acceptedUsers && (
        <div className="mt-3 bg-white/10 p-3 rounded">
          <h4 className="text-sm font-semibold mb-2">Accepted</h4>
          <ul className="text-sm">
            {acceptedUsers.length === 0 && (
              <li className="text-white/80">No users</li>
            )}
            {acceptedUsers.map((u, idx) => (
              <li key={idx} className="text-white/90">
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDeclined && declinedUsers && (
        <div className="mt-3 bg-white/10 p-3 rounded">
          <h4 className="text-sm font-semibold mb-2">Declined</h4>
          <ul className="text-sm">
            {declinedUsers.length === 0 && (
              <li className="text-white/80">No users</li>
            )}
            {declinedUsers.map((u, idx) => (
              <li key={idx} className="text-white/90">
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
