'use client'
import { useState } from 'react'
import { supabase } from '@/lib/client'

type Props = {
  acceptedIds: string[]
  declinedIds: string[]
  /** Valfritt: skicka in pending också om du har det */
  pendingIds?: string[]
  // de som svarat maybe
  maybeIds?: string[]
}

type ProfileLabel = { id: string; label: string }
type AllInviteeRow = {
  id: string
  label: string
  status: 'accepted' | 'declined' | 'pending' | 'maybe'
}

export default function InviteStatusList({
  acceptedIds,
  declinedIds,
  pendingIds = [],
  maybeIds = [],
}: Props) {
  const [showAccepted, setShowAccepted] = useState(false)
  const [showDeclined, setShowDeclined] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const [acceptedUsers, setAcceptedUsers] = useState<ProfileLabel[] | null>(
    null
  )
  const [declinedUsers, setDeclinedUsers] = useState<ProfileLabel[] | null>(
    null
  )
  const [pendingUsers, setPendingUsers] = useState<ProfileLabel[] | null>(null)

  // maybe
  const [maybeUsers] = useState<ProfileLabel[] | null>(null)

  const [allUsers, setAllUsers] = useState<AllInviteeRow[] | null>(null)

  const [loading, setLoading] = useState(false)

  async function resolveProfiles(ids: string[]): Promise<ProfileLabel[]> {
    if (ids.length === 0) return []
    const map: Record<string, string> = {}
    const resolved: ProfileLabel[] = []

    // Fetch from users table first
    const { data: appUsers } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', ids)

    if (appUsers) {
      for (const u of appUsers) {
        if (u.id) {
          map[u.id] = u.first_name
            ? `${u.first_name} ${u.last_name || ''}`.trim()
            : u.email || u.id
        }
      }
    }

    // Find IDs not yet resolved or with empty string
    const remaining = ids.filter((id) => !map[id] || map[id].trim() === '')

    if (remaining.length > 0) {
      const { data: googleUsers } = await supabase
        .from('google_users')
        .select('id, first_name, last_name, email')
        .in('id', remaining)

      if (googleUsers) {
        for (const g of googleUsers) {
          if (g.id) {
            map[g.id] = g.first_name
              ? `${g.first_name} ${g.last_name || ''}`.trim()
              : g.email || g.id
          }
        }
      }
    }

    for (const id of ids) resolved.push({ id, label: map[id] ?? id })
    return resolved
  }

  const onToggleAccepted = async () => {
    if (!acceptedUsers) setAcceptedUsers(await resolveProfiles(acceptedIds))
    setShowAccepted((s) => !s)
    setShowDeclined(false)
    setShowAll(false)
  }

  const onToggleDeclined = async () => {
    if (!declinedUsers) setDeclinedUsers(await resolveProfiles(declinedIds))
    setShowDeclined((s) => !s)
    setShowAccepted(false)
    setShowAll(false)
  }

  const onToggleAll = async () => {
    setLoading(true)
    try {
      if (!pendingUsers && pendingIds.length > 0) {
        setPendingUsers(await resolveProfiles(pendingIds))
      }
      if (!acceptedUsers) setAcceptedUsers(await resolveProfiles(acceptedIds))
      if (!declinedUsers) setDeclinedUsers(await resolveProfiles(declinedIds))

      // Bygg samlad lista med status
      const all: AllInviteeRow[] = [
        ...(acceptedUsers ?? (await resolveProfiles(acceptedIds))).map((u) => ({
          ...u,
          status: 'accepted' as const,
        })),
        ...(declinedUsers ?? (await resolveProfiles(declinedIds))).map((u) => ({
          ...u,
          status: 'declined' as const,
        })),
        ...(pendingUsers ?? (await resolveProfiles(pendingIds))).map((u) => ({
          ...u,
          status: 'pending' as const,
        })),
        ...(maybeUsers ?? (await resolveProfiles(maybeIds))).map((u) => ({
          ...u,
          status: 'maybe' as const,
        })),
      ]
      setAllUsers(all)
      setShowAll((s) => !s)
      setShowAccepted(false)
      setShowDeclined(false)
    } finally {
      setLoading(false)
    }
  }

  const allCount =
    acceptedIds.length +
    declinedIds.length +
    pendingIds.length +
    maybeIds.length

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-3">
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

        <button
          onClick={onToggleAll}
          className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg  hover:bg-yellow-700 transition-colors"
        >
          ({allCount}) All invitees
        </button>
      </div>

      {loading && <p className="mt-2 text-sm text-white/80">Loading...</p>}

      {showAccepted && acceptedUsers && (
        <div className="mt-3 bg-white/10 p-3 rounded">
          <h4 className="text-sm font-semibold mb-2">Accepted</h4>
          <ul className="text-sm">
            {acceptedUsers.length === 0 && (
              <li className="text-gray/80">No users</li>
            )}
            {acceptedUsers.map((u) => (
              <li key={u.id} className="text-gray/90">
                {u.label}
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
              <li className="text-gray/80">No users</li>
            )}
            {declinedUsers.map((u) => (
              <li key={u.id} className="text-gray/90">
                {u.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAll && allUsers && (
        <div className="mt-3 bg-white/10 p-3 rounded">
          <h4 className="text-sm font-semibold mb-2">All invitees</h4>
          <ul className="text-sm space-y-1">
            {allUsers.length === 0 && (
              <li className="text-gray/80">No users</li>
            )}
            {allUsers.map((u) => (
              <li key={`${u.id}-${u.status}`} className="text-gray/90">
                {u.label}{' '}
                <span className="ml-2 text-xs opacity-80">({u.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
