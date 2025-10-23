'use client'
import { useState } from 'react'
import { Share2 } from 'lucide-react'

export default function ShareEventButton({
  eventId,
}: {
  eventId: number | string
}) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    const url = `${window.location.origin}/events/${eventId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 5000)
  }

  return (
    <>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onClick}
          className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
        >
          <Share2 size={24} /> Share event
        </button>
      </div>

      {/* Toast */}
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                            rounded-xl border border-white/30 bg-white/90 text-gray-900
                            px-4 py-2 shadow-lg backdrop-blur-sm"
        >
          Link for this event is copied!
        </div>
      )}
    </>
  )
}
