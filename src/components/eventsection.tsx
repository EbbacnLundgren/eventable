'use client'

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
  ownEventIds?: number[]
  advancedFilters: AdvancedFilterState
  setAdvancedFilters: (f: AdvancedFilterState) => void
}

const EventsSection = ({
  events,
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {displayedEvents.map((event) => {
          const eventDate = new Date(event.date)
          const diffTime = eventDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          return (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
              className="block transform hover:scale-[1.02] transition-transform cursor-pointer h-full"
            >
              <div className="bg-white/30 border border-white/20 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md hover:shadow-xl transition-shadow flex flex-col h-full">
                {/* Image Section (Standard, no overlay) */}
                <div className="relative h-40 w-full shrink-0">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-stone-200 animate-pulse"></div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Header: Title + Days Left */}
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-semibold text-stone-900 drop-shadow-md leading-tight flex-1 break-words pr-1">
                      {event.name}
                    </h3>

                    {diffDays >= 0 && (
                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          diffDays <= 7
                            ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white'
                            : 'bg-white/40 text-stone-800'
                        }`}
                      >
                        {diffDays === 0
                          ? 'Today'
                          : diffDays === 1
                            ? 'Tomorrow'
                            : `in ${diffDays} d`}
                      </span>
                    )}
                  </div>

                  {/* Details Section - Pushed to bottom via mt-auto */}
                  <div className="mt-auto space-y-1">
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
                      <span className="truncate">{event.location}</span>
                    </div>

                    {/* --- HOST ROW + STATUS --- */}
                    {/* 'justify-between' pushes Host to left and Status to right */}
                    <div className="flex items-center justify-between pt-1 mt-1 border-t border-white/10">
                      {/* Left: Host Info */}
                      <div className="flex items-center gap-2 text-sm text-stone-800 drop-shadow truncate pr-2">
                        <User size={16} />
                        <span className="truncate">
                          <strong>Host:</strong> {event.hostLabel ?? 'Unknown'}
                        </span>
                      </div>

                      {/* Right: Status Badge */}
                      {!ownEventIds.includes(event.id) && (
                        <span
                          className={`
                shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border leading-none shadow-sm
                ${event.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                ${event.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                ${event.status === 'maybe' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                ${event.status === 'pending' ? 'bg-zinc-100 text-black border-slate-300' : ''}
              `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full 
                ${event.status === 'accepted' ? 'bg-green-500' : ''}
                ${event.status === 'declined' ? 'bg-red-500' : ''}
                ${event.status === 'maybe' ? 'bg-orange-500' : ''}
                ${event.status === 'pending' ? 'bg-zinc-600' : ''}
              `}
                          ></span>
                          {event.status || 'No response'}
                        </span>
                      )}
                    </div>
                  </div>
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
