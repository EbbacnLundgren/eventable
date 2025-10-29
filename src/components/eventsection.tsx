'use client'
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import EventDetails from '@/components/eventDetails'
import type { Event } from '@/types/event'
import Link from 'next/link'
import { formatEventDuration } from '@/lib/formatEventDuration'
import { MapPin, Calendar, Clock, User } from 'lucide-react'
import EventFilters, { FilterType } from '@/components/EventFilters'
import AdvancedFilters, {
  AdvancedFilterState,
} from '@/components/AdvancedFilters'

interface EventsSectionProps {
  events: Event[]
  pendingIds?: number[]
  onAcceptInvite?: (eventId: number) => void
  onDeclineInvite?: (eventId: number) => void
  ownEventIds?: number[]
}

const EventsSection = ({
  events,
  pendingIds = [],
  onAcceptInvite,
  onDeclineInvite,
  ownEventIds = [],
}: EventsSectionProps) => {
  //const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const today = new Date()
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming')

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    city: '',
    dateFrom: '',
    dateTo: '',
    dayOfWeek: '',
    host: '',
    keyword: '',
  })

  // --- Filter events based on activeFilter + advancedFilters ---
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date)

    // Basic filter
    let matchesFilter = true
    switch (activeFilter) {
      case 'upcoming':
        matchesFilter = eventDate >= today
        break
      case 'past':
        matchesFilter = eventDate < today
        break
      case 'declined':
        return false
      default:
        matchesFilter = true
    }

    // Advanced filters
    if (advancedFilters.city) {
      matchesFilter =
        matchesFilter &&
        event.location
          .toLowerCase()
          .includes(advancedFilters.city.toLowerCase())
    }

    if (advancedFilters.dateFrom) {
      matchesFilter =
        matchesFilter &&
        new Date(event.date).toISOString().split('T')[0] ===
          advancedFilters.dateFrom
    }

    if (advancedFilters.host) {
      matchesFilter =
        matchesFilter &&
        (event.hostLabel
          ?.toLowerCase()
          .includes(advancedFilters.host.toLowerCase()) ??
          false)
    }

    if (advancedFilters.keyword) {
      matchesFilter =
        matchesFilter &&
        event.name.toLowerCase().includes(advancedFilters.keyword.toLowerCase())
    }

    return matchesFilter
  })

  const displayedEvents = filteredEvents

  return (
    <section className="p-6 w-full">
      {/* Filters */}
      <EventFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />

      {/* Event cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {displayedEvents.map((event) => (
          <Link
            href={`/events/${event.id}`}
            key={event.id}
            className="block transform hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="bg-white/30 border border-white/20 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md hover:shadow-xl transition-shadow">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="h-40 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h3 className="text-lg font-semibold text-stone-900 drop-shadow-md">
                  {event.name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-white/80 drop-shadow">
                  <Calendar size={14} />
                  <span>
                    {new Date(event.date).toISOString().split('T')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/80 drop-shadow">
                  <Clock size={14} />
                  <span>
                    {formatEventDuration(
                      event.date,
                      event.time,
                      event.end_date,
                      event.end_time
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/80 drop-shadow mt-1">
                  <User size={16} />
                  <span>
                    <strong>Host:</strong> {event.hostLabel ?? 'Unknown'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedEvent({
                      ...event,
                      participants: ['Alice', 'Bob', 'Charlie'],
                    })
                  }}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-400 to-yellow-400 rounded-lg hover:opacity-90"
                >
                  View Details
                </button>

                {pendingIds.includes(event.id) &&
                  !ownEventIds.includes(event.id) && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          onAcceptInvite?.(event.id)
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Accept invite
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          onDeclineInvite?.(event.id)
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                      >
                        Decline invite
                      </button>
                      <span className="ml-2 text-xs text-white/80">
                        Invite pending
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </Link>
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
