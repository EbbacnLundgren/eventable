'use client'

import { useState } from 'react'
import ShareEventButton from '@/components/shareEvents'
import InviteStatusList from '@/components/InviteStatusList'

type ShareAndInviteSectionProps = {
  eventId: number
  acceptedIds: string[]
  declinedIds: string[]
  pendingIds: string[]
  userId: string
}

export default function ShareAndInviteSection({
  eventId,
  acceptedIds,
  declinedIds,
  pendingIds,
  userId,
}: ShareAndInviteSectionProps) {
  const [hasShared, setHasShared] = useState(false)

  return (
    <div className="mt-6 space-y-6">
      {/* Share Event Button */}
      <ShareEventButton eventId={eventId} onShared={() => setHasShared(true)} />

      {/* Only show invite stats after sharing */}
      {hasShared && (
        <InviteStatusList
          acceptedIds={acceptedIds.filter((id) => id !== userId)}
          declinedIds={declinedIds.filter((id) => id !== userId)}
          pendingIds={pendingIds.filter((id) => id !== userId)}
        />
      )}
    </div>
  )
}
