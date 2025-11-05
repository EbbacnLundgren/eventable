'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useSession } from 'next-auth/react'

type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

type FriendRequest = {
  id: string
  requester_id: string
  status: string
  google_users: User
}

export default function AddFriendsPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()

  const resolveCurrentUserId = async (): Promise<string | null> => {
    let email: string | null = null
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser()

    if (supaUser?.email) email = supaUser.email
    else if (session?.user?.email) email = session.user.email
    if (!email) return null

    const { data: gUser } = await supabase
      .from('google_users')
      .select('id')
      .eq('email', email)
      .single()

    return gUser?.id ?? supaUser?.id ?? null
  }

  useEffect(() => {
    const fetchRequests = async () => {
      const userId = await resolveCurrentUserId()
      if (!userId) return

      const res = await fetch(`/api/friends/requests?userId=${userId}`)
      const data = await res.json()
      setRequests(data.requests || [])
    }
    fetchRequests()
  }, [session])

  useEffect(() => {
    const fetchRequests = async () => {
      const userId = await resolveCurrentUserId()
      console.log('🔍 currentUserId:', userId)
      if (!userId) return

      const res = await fetch(`/api/friends/requests?userId=${userId}`)
      const data = await res.json()
      console.log('📬 fetched requests:', data)
      setRequests(data.requests || [])
    }
    fetchRequests()
  }, [session])

  const handleSearch = async () => {
    setLoading(true)
    const currentUserId = await resolveCurrentUserId()
    if (!currentUserId) {
      alert('Could not determine your user ID')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/friends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: query, currentUserId }),
      })
      const data = await res.json()
      setResults(data.users || [])
    } catch (err) {
      console.error('Error searching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (receiverId: string) => {
    const currentUserId = await resolveCurrentUserId()
    if (!currentUserId) {
      alert('Could not determine your user ID')
      return
    }

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUserId, receiverId }),
      })

      if (res.ok) {
        alert('Friend request sent!')
      } else {
        alert('Something went wrong sending the request.')
      }
    } catch (err) {
      console.error('Error sending request:', err)
    }
  }

  const respondToRequest = async (
    requestId: string,
    action: 'accepted' | 'declined'
  ) => {
    await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    })
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-400 to-orange-400 text-white p-8">
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-lg border border-white/30">
        <h1 className="text-2xl font-bold mb-6 text-center">Add Friends</h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
          >
            Search
          </button>
        </div>

        {loading && (
          <p className="text-center text-sm text-white/70">Searching...</p>
        )}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-sm text-white/70">
            No users found for “{query}”
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {results.map((user) => (
            <li
              key={user.id}
              className="flex justify-between items-center bg-white/10 p-3 rounded-lg"
            >
              <div>
                <span className="font-medium">{user.email}</span>
                {user.first_name && (
                  <span className="block text-white/70 text-sm">
                    {user.first_name} {user.last_name || ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => sendRequest(user.id)}
                className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600 text-sm"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        {/* 📨 Pending friend requests */}
        {requests.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3 text-center">
              Friend Requests
            </h2>
            <ul className="space-y-3">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex justify-between items-center bg-white/10 p-3 rounded-lg"
                >
                  <span>
                    {req.google_users.first_name
                      ? `${req.google_users.first_name} ${req.google_users.last_name || ''}`
                      : req.google_users.email}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(req.id, 'accepted')}
                      className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToRequest(req.id, 'declined')}
                      className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
