'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'

type Props = {
  acceptedIds: string[]
  declinedIds: string[]
  maybeIds: string[]
  pendingIds: string[]
  invitedProfiles: { id: string; avatar_url: string | null }[]
}

export default function GuestsModal({
  acceptedIds,
  declinedIds,
  pendingIds,
  maybeIds,
  invitedProfiles,
}: Props) {
  const [open, setOpen] = useState(false)

  const count = invitedProfiles.length

  return (
    <>
      {/* CLICKABLE INVITED TEXT */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Users size={20} />
        <span>
          <span className="font-bold">Invited:</span> {count} people
        </span>
      </div>

      {/* AVATAR ROW */}
      <div className="flex items-center mt-2 gap-2">
        {invitedProfiles.slice(0, 12).map((p) => (
          <div
            key={p.id}
            className="w-10 h-10 rounded-full overflow-hidden bg-white border border-black"
          >
            {p.avatar_url ? (
              <img src={p.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* POPUP OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setOpen(false)}
        >
          {/* MODAL */}
          <div
            className="bg-white rounded-3xl p-6 w-80 text-black relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-4">Guests</h2>

            <div className="space-y-3">
              <p>( {acceptedIds.length} ) Accepted</p>
              <p>( {declinedIds.length} ) Declined</p>
              <p>( {maybeIds.length} ) Maybe</p>
              <p>( {pendingIds.length} ) Pending</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
