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
    <main className="min-h-screen flex flex-col items-center justify-center   p-8">
      <div
        className="
  w-full sm:max-w-lg 
  p-10
  rounded-3xl 
  bg-white/40 
  backdrop-blur-md 
  border-2 border-white/30 
  shadow-[0_0_40px_rgba(255,255,255,0.2)]
  text-[#1B2A4A]
  font-semibold
"
      >
        <h1 className="text-3xl font-bold mb-8 text-center drop-shadow-lg ">
          Friends
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`
        px-5 py-2 rounded-xl transition 
        ${
          activeTab === 'add'
            ? ' bg-[#1B2A4A] text-white shadow-lg'
            : 'bg-white/80 backdrop-blur-md border border-white/40'
        }
      `}
          >
            Add Friends
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`
        px-5 py-2 rounded-xl transition pl-6
        ${
          activeTab === 'list'
            ? ' bg-[#1B2A4A] text-white shadow-lg'
            : 'bg-white/80 backdrop-blur-md border border-white/40'
        }
      `}
          >
            My Friends
          </button>
        </div>

        {/* ADD FRIENDS TAB */}
        {activeTab === 'add' && (
          <>
            <div className="flex gap-3 mb-6 text-[#1B2A4A]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by email"
                className="flex-1 p-3 rounded-xl bg-white/70 text-[#1B2A4A] placeholder-gray-500"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-2 rounded-xl bg-[#1B2A4A] text-white hover:bg-[#24375C]"
              >
                Search
              </button>
            </div>

            {loading && (
              <p className="text-center text-sm text-[#1B2A4A]/70">
                Searching...
              </p>
            )}

            {!loading && results.length === 0 && query && (
              <p className="text-center text-sm text-[#1B2A4A]/70">
                No users found
              </p>
            )}

            {/* Search results */}
            <ul className="space-y-4 mt-4">
              {results.map((user) => (
                <li
                  key={user.id}
                  className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                >
                  <div>
                    <p className="font-semibold text-[#1B2A4A]">{user.email}</p>
                    {user.first_name && (
                      <p className="text-[#1B2A4A]/70 text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => sendRequest(user.id)}
                    className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-white hover:bg-[#24375C]"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>

            {/* Friend requests */}
            {requests.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-center text-[#1B2A4A] mb-4">
                  Friend Requests
                </h2>

                <ul className="space-y-4">
                  {requests.map((req) => (
                    <li
                      key={req.id}
                      className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/20"
                    >
                      <span className="text-[#1B2A4A]">
                        {req.google_users.first_name
                          ? `${req.google_users.first_name} ${req.google_users.last_name ?? ''}`
                          : req.google_users.email}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(req.id, 'accepted')}
                          className="px-3 py-1 rounded bg-green-600 text-[#1B2A4A] hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(req.id, 'declined')}
                          className="px-3 py-1 rounded bg-red-500 text-[#1B2A4A] hover:bg-red-600"
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

        {/* MY FRIENDS TAB */}
        {activeTab === 'list' && (
          <div>
            {friends.length > 0 ? (
              <ul className="space-y-4">
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm"
                  >
                    <div>
                      <p className="font-semibold text-[#1B2A4A]">
                        {friend.email}
                      </p>
                      {friend.first_name && (
                        <p className="text-[#1B2A4A]/70 text-sm">
                          {friend.first_name} {friend.last_name}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => unfriend(friend.id)}
                      className="text-red-400 hover:text-red-500 text-xl"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-[#1B2A4A]/70 mt-6">
                You have no friends yet 😢
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
