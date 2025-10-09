'use client'

import { useState } from 'react'
import EventDetails from '@/components/eventDetails'

interface Event {
  id: number
  name: string
  location: string
  date: string
  time?: number
  image?: string
}

interface EventsSectionProps {
  events: Event[]
}

const EventsSection = ({ events }: EventsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const today = new Date()

  // --- Fallback demo events, if there are no events in supabase these are used as examples  ---
  const fallbackUpcoming: Event[] = [
    {
      id: 0,
      name: 'Wine tasting',
      location: 'Lund, Sweden',
      date: '2025-09-18',
      image: '/images/winetasting.jpg',
    },
    {
      id: 1,
      name: 'Pottery',
      location: 'Malmö, Sweden',
      date: '2025-10-05',
      image: '/images/pottery.jpg',
    },
  ]

  const fallbackPast: Event[] = [
    {
      id: 2,
      name: 'Music Festival',
      location: 'Gothenburg, Sweden',
      date: '2024-06-12',
      image: '/images/musicfestival.jpg',
    },
  ]

  // --- Split real events into upcoming/past ---
  const upcomingEvents = events.filter((event) => new Date(event.date) >= today)
  const pastEvents = events.filter((event) => new Date(event.date) < today)

  // --- Use Supabase events if available, otherwise fallback demo events ---
  const displayedEvents =
    activeTab === 'upcoming'
      ? upcomingEvents.length > 0
        ? upcomingEvents
        : fallbackUpcoming
      : pastEvents.length > 0
        ? pastEvents
        : fallbackPast

  return (
    <section className="p-6 w-full">
      {/* Tabs */}
      <div className="relative flex bg-white/20 rounded-md p-1 mb-6 w-full max-w-md">
        {/* Active background "slider" */}
        <div
          className={`absolute top-1 bottom-1 left-0 w-1/2 rounded-sm bg-pink-500 transition-all duration-300 ease-in-out ${
            activeTab === 'upcoming' ? 'left-0' : 'left-1/2'
          }`}
        ></div>

        {/* Upcoming tab */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`relative z-10 flex-1 px-6 py-2 text-sm font-medium transition rounded-sm ${
            activeTab === 'upcoming' ? 'text-white' : 'text-black bg-gray-200'
          }`}
        >
          Upcoming Events
        </button>

        {/* Past tab */}
        <button
          onClick={() => setActiveTab('past')}
          className={`relative z-10 flex-1 px-6 py-2 text-sm font-medium transition rounded-sm ${
            activeTab === 'past' ? 'text-white' : 'text-black bg-gray-200'
          }`}
        >
          Past Events
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {displayedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white/30 border border-white/20 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md hover:shadow-xl transition-shadow"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white drop-shadow-md">
                {event.name}
              </h3>
              <p className="text-sm text-white/80 drop-shadow">
                {new Date(event.date).toLocaleDateString()}
              </p>

              {event.time !== undefined && (
                <p className="text-sm text-white/80 drop-shadow">
                  Time: {event.time}:00
                </p>
              )}

              <p className="text-sm text-white/90 drop-shadow">
                {event.location}
              </p>
              <button
                onClick={() => setSelectedEvent(event)}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-400 to-yellow-400 rounded-lg hover:opacity-90"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  )
}

export default EventsSection
