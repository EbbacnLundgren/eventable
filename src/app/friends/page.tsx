'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
  const [friends, setFriends] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add')
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

  // hämta vänförfrågningar
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

  // sök efter användare
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

  // skicka vänförfrågan
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

  // svara på vänförfrågan
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

  // hämta vänner
  const fetchFriends = async () => {
    const userId = await resolveCurrentUserId()
    if (!userId) return

    const { data, error } = await supabase
      .from('friendships')
      .select(
        `
      id,
      requester_id,
      receiver_id,
      status,
      requester:google_users!friendships_requester_id_fkey (
        id,
        email,
        first_name,
        last_name
      ),
      receiver:google_users!friendships_receiver_id_fkey (
        id,
        email,
        first_name,
        last_name
      )
    `
      )
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

    if (error) {
      console.error('Error fetching friends:', error)
      return
    }

    // Sortera ut rätt “andra personen” i relationen
    const myFriends = data.map((f) => {
      const requester = Array.isArray(f.requester)
        ? f.requester[0]
        : f.requester
      const receiver = Array.isArray(f.receiver) ? f.receiver[0] : f.receiver
      return f.requester_id === userId ? receiver : requester
    })

    setFriends(myFriends)
  }

  useEffect(() => {
    fetchFriends()
  }, [session])

  // Ta bort vänskap
  const unfriend = async (friendId: string) => {
    const userId = await resolveCurrentUserId()
    if (!userId) return

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(
        `and(requester_id.eq.${userId},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${userId})`
      )

    if (error) {
      console.error('Error unfriending:', error)
      alert('Failed to remove friend.')
    } else {
      setFriends((prev) => prev.filter((f) => f.id !== friendId))
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-400 to-orange-400 text-white p-8">
      <Link
        href="/main"
        className="fixed top-4 left-4 text-pink-600 hover:text-pink-800 z-50"
        aria-label="Back to main page"
      >
        <ArrowLeft size={26} />
      </Link>
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-lg border border-white/30">
        <h1 className="text-2xl font-bold mb-6 text-center">Friends</h1>

        {/* 🔹 Flikar */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-yellow-500' : 'bg-white/20'}`}
          >
            ➕ Add Friends
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded ${activeTab === 'list' ? 'bg-yellow-500' : 'bg-white/20'}`}
          >
            👯 My Friends
          </button>
        </div>

        {/* 🔹 Add Friends-tabben */}
        {activeTab === 'add' && (
          <>
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
          </>
        )}

        {/* 🔹 My Friends-tabben */}
        {activeTab === 'list' && (
          <div>
            {friends.length > 0 ? (
              <ul className="space-y-3">
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex justify-between items-center bg-white/10 p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{friend.email}</span>
                      {friend.first_name && (
                        <span className="block text-white/70 text-sm">
                          {friend.first_name} {friend.last_name || ''}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => unfriend(friend.id)}
                      className="text-red-400 hover:text-red-600 text-lg"
                      title="Remove friend"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-white/70 mt-4">
                You have no friends yet 😢
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
