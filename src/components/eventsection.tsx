'use client'
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
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
  onMaybeInvite?: (eventId: number) => void
  ownEventIds?: number[]
  advancedFilters: AdvancedFilterState
  setAdvancedFilters: (f: AdvancedFilterState) => void
}

const EventsSection = ({
  events,
  pendingIds,
  onAcceptInvite,
  onDeclineInvite,
  onMaybeInvite,
  ownEventIds = [],
  advancedFilters,
  setAdvancedFilters,
}: EventsSectionProps) => {
  const today = new Date()
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming')
  const t = new Date()

  const upcomingEvents = events.filter(
    (event) =>
      (event.status === null ||
        event.status === 'accepted' ||
        event.status === 'maybe' ||
        event.status === 'pending') &&
      new Date(event.date) >= t
  )

  const hostingEvents = events.filter((event) => ownEventIds.includes(event.id))

  const pastEvents = events.filter(
    (event) =>
      (event.status === null ||
        event.status === 'accepted' ||
        event.status === 'maybe' ||
        event.status === 'pending') &&
      new Date(event.date) < t
  )

  const declinedEvents = events.filter((event) => event.status === 'declined')
  const filteredEvents = events.filter((event) => {
    let matchesFilter = true
    switch (activeFilter) {
      case 'upcoming':
        matchesFilter =
          (event.status === null ||
            event.status === 'accepted' ||
            event.status === 'maybe' ||
            event.status === 'pending') &&
          new Date(event.date) >= today
        break
      case 'past':
        matchesFilter =
          (event.status === null ||
            event.status === 'accepted' ||
            event.status === 'maybe' ||
            event.status === 'pending') &&
          new Date(event.date) < today
        break
      case 'declined':
        matchesFilter = event.status === 'declined'
        break

      case 'hosting':
        matchesFilter = ownEventIds.includes(event.id)
        break
      default:
        matchesFilter = true
    }

    return matchesFilter
  })

  const displayedEvents = filteredEvents

  return (
    <section className="p-6 w-full max-w-7xl mx-auto">
      {/* Filters */}
      <EventFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={{
          upcoming: upcomingEvents.length,
          hosting: hostingEvents.length,
          past: pastEvents.length,
          declined: declinedEvents.length,
        }}
      />

      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />

      {/* Event cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {displayedEvents.map((event) => {
          const eventDate = new Date(event.date)
          const diffTime = eventDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          const eventRSVPDateTime = event.rsvp_date
            ? new Date(`${event.rsvp_date}T${event.rsvp_time || '23:59'}`)
            : null

          const isRSVPOpen = !eventRSVPDateTime || eventRSVPDateTime > today

          return (
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-stone-900 drop-shadow-md">
                      {event.name}
                    </h3>

                    {diffDays >= 0 && (
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                          diffDays <= 7
                            ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                            : 'bg-white/40 text-stone-800'
                        }`}
                      >
                        {diffDays === 0
                          ? 'Today'
                          : diffDays === 1
                            ? 'Tomorrow'
                            : `in ${diffDays} days`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-800 drop-shadow">
                    <Calendar size={14} />
                    <span>
                      {new Date(event.date).toISOString().split('T')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-800 drop-shadow">
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

                  <div className="flex items-center gap-2 text-sm text-stone-800 drop-shadow">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-800 drop-shadow mt-1">
                    <User size={16} />
                    <span>
                      <strong>Host:</strong> {event.hostLabel ?? 'Unknown'}
                    </span>
                  </div>

                  {!ownEventIds.includes(event.id) && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          if (isRSVPOpen && event.status !== 'accepted')
                            onAcceptInvite?.(event.id)
                        }}
                        disabled={!isRSVPOpen && event.status !== 'accepted'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
      ${
        event.status === 'accepted'
          ? 'bg-green-600 text-white'
          : 'bg-green-600/30 text-white/70 hover:bg-green-600/60'
      } 
      ${
        !isRSVPOpen && event.status !== 'accepted'
          ? 'opacity-50 cursor-not-allowed hover:bg-green-600/30'
          : ''
      }`}
                      >
                        {event.status === 'accepted'
                          ? 'Accepted'
                          : 'Accept invite'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          if (isRSVPOpen && event.status !== 'declined')
                            onDeclineInvite?.(event.id)
                        }}
                        disabled={!isRSVPOpen && event.status !== 'declined'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
      ${
        event.status === 'declined'
          ? 'bg-red-600 text-white'
          : 'bg-red-600/30 text-white/70 hover:bg-red-600/60'
      } 
                          ${
                            !isRSVPOpen && event.status !== 'declined'
                              ? 'opacity-50 cursor-not-allowed hover:bg-red-600/30'
                              : ''
                          }`}
                      >
                        {event.status === 'declined'
                          ? 'Declined'
                          : 'Decline invite'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          if (isRSVPOpen && event.status !== 'maybe')
                            onMaybeInvite?.(event.id)
                        }}
                        disabled={!isRSVPOpen && event.status !== 'maybe'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition
    ${
      event.status === 'maybe'
        ? 'bg-orange-500 text-white'
        : 'bg-orange-500/30 text-white/70 hover:bg-orange-500/60'
    }
                          ${
                            !isRSVPOpen && event.status !== 'maybe'
                              ? 'opacity-50 cursor-not-allowed hover:bg-orange-500/30'
                              : ''
                          }`}
                      >
                        {event.status === 'maybe' ? 'Maybe' : 'Maybe'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default EventsSection
