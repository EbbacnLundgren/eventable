'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Image from 'next/image'
import Portal from './Portal'

type Props = {
  acceptedIds: string[]
  declinedIds: string[]
  maybeIds: string[]
  pendingIds: string[]
  invitedProfiles: {
    id: string
    avatar_url: string | null
    first_name: string | null
    last_name: string | null
  }[]
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

  const isShared =
    acceptedIds.length +
      declinedIds.length +
      pendingIds.length +
      maybeIds.length >
    0

  const getProfiles = (ids: string[]) =>
    invitedProfiles.filter((p) => ids.includes(p.id))

  const tabs = [
    { key: 'accepted', label: 'Accepted', ids: acceptedIds },
    { key: 'declined', label: 'Declined', ids: declinedIds },
    { key: 'maybe', label: 'Maybe', ids: maybeIds },
    { key: 'pending', label: 'Pending', ids: pendingIds },
  ] as const

  const [activeTab, setActiveTab] = useState<
    'accepted' | 'declined' | 'maybe' | 'pending'
  >('accepted')

  return (
    <>
      {/* Clickable text */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {isShared && <Users size={20} />}

        {isShared && (
          <span>
            <span className="font-bold">Invited:</span> {count} people
          </span>
        )}
      </div>

      {/* Row of invited users */}
      <div className="flex items-center mt-2 gap-2">
        {invitedProfiles.slice(0, 12).map((p) => (
          <div
            key={p.id}
            className="w-10 h-10 rounded-full overflow-hidden bg-white border border-black"
          >
            {p.avatar_url ? (
              <Image
                src={p.avatar_url}
                alt="Guest avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Pop-up window */}
      {open && (
        // BACKDROP
        <Portal>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]"
            onClick={() => setOpen(false)} // click outside closes modal
          >
            {/* MODAL */}
            <div
              className="bg-white rounded-3xl p-8 w-[90%] max-w-4xl text-black relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-black"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center">Invites</h2>

              {/* Tabs */}
              <div className="grid grid-cols-4 text-center mb-6 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-2 ${
                      activeTab === tab.key
                        ? 'font-bold border-b-2 border-black'
                        : 'text-gray-500'
                    }`}
                  >
                    ({tab.ids.length}) {tab.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-4">
                {getProfiles(tabs.find((t) => t.key === activeTab)!.ids).map(
                  (p) => (
                    <div key={p.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>

                      <div className="text-lg">
                        {(p.first_name || p.last_name) &&
                          `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()}
                      </div>
                    </div>
                  )
                )}

                {getProfiles(tabs.find((t) => t.key === activeTab)!.ids)
                  .length === 0 && (
                  <p className="text-gray-500 text-center mt-6">
                    No guests in this category.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
