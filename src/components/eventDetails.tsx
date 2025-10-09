'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Event } from '@/types/event'

interface EventDetailsModalProps {
  event: Event | null
  onClose: () => void
}

export default function EventDetailsModal({
  event,
  onClose,
}: EventDetailsModalProps) {
  // Close modal when clicking outside the content
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const modalContent = document.getElementById('modal-content')
      if (modalContent && !modalContent.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!event) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        id="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-[#FF69B4]/80 backdrop-blur-lg rounded-3xl p-8 w-11/12 max-w-lg shadow-2xl border border-pink-500 text-white"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black text-2xl"
        >
          ✕
        </button>

        {/* Event header */}
        <h1 className="text-3xl font-extrabold mb-4 text-center">
          {event.name}
        </h1>

        {/* Event details */}
        <div className="space-y-4">
          {event.description && (
            <p className="text-white-800 text-sm">{event.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Image
              src="/icons/location.svg"
              alt="Location"
              width={24}
              height={24}
            />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src="/icons/calendar.svg"
              alt="Date"
              width={24}
              height={24}
            />
            <span>
              {new Date(event.date).toLocaleDateString('sv-SE', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Image src="/icons/clock.svg" alt="Time" width={24} height={24} />
            <span>{event.time}</span>
          </div>

          {event.participants && (
            <div className="flex items-center gap-2">
              <Image
                src="/icons/user.svg"
                alt="Participants"
                width={24}
                height={24}
              />
              <span>{event.participants.join(', ')}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
