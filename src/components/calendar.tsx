'use client'

import { startOfWeek, addWeeks, getISOWeek } from 'date-fns'
import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import { EventClickArg, EventInput, DatesSetArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '@/lib/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface EventRow {
  id: string
  name: string
  date: string
}

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([])
  const [weekNumbers, setWeekNumbers] = useState<number[]>([])
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  )
  const router = useRouter()
  const { data: session } = useSession()
  const [activeEvent, setActiveEvent] = useState<{
    id?: string
    title: string
    start: string
  } | null>(null)
  const [eventPopupPos, setEventPopupPos] = useState<{
    x: number
    y: number
  } | null>(null)

  // Hämta events från Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      if (!session?.user?.email) {
        setEvents([])
        return
      }

      const email = session.user.email

      // hitta google_users-raden för den inloggade
      const { data: googleUser, error: gErr } = await supabase
        .from('google_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (gErr) {
        console.error('Error fetching google_user for calendar:', gErr)
        setEvents([])
        return
      }

      if (!googleUser) {
        setEvents([])
        return
      }

      const userId = googleUser.id

      // hämta bara denna användares events
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (error) {
        console.error('Failed to fetch events:', error)
        setEvents([])
        return
      }

      const formatted: EventInput[] = (data as EventRow[]).map((e) => ({
        id: e.id,
        title: e.name,
        date: e.date,
      }))
      setEvents(formatted)
    }

    fetchEvents()
  }, [session])

  // Uppdatera veckonummer när månad ändras
  const handleDatesSet = (info: DatesSetArg) => {
    const monthStart = info.start
    const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const totalWeeks = 6
    const numbers = Array.from({ length: totalWeeks }).map((_, i) => {
      const weekStart = addWeeks(firstWeekStart, i)
      return getISOWeek(weekStart)
    })
    setWeekNumbers(numbers)
  }

  // Klick på dag → popup för skapa event
  const handleDateClick = (arg: { dateStr: string; dayEl: HTMLElement }) => {
    setActiveDate(arg.dateStr)
    const rect = arg.dayEl.getBoundingClientRect()
    setPopupPos({ x: rect.left, y: rect.bottom + window.scrollY })
    setActiveEvent(null) // stäng event-popup
  }

  // Klick på event → popup för eventdetails
  const handleEventClick = (clickInfo: EventClickArg) => {
    const rect = clickInfo.el.getBoundingClientRect()
    setActiveEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
    })
    setEventPopupPos({ x: rect.left, y: rect.bottom + window.scrollY })
    setActiveDate(null) //close day-popup
  }

  return (
    <div className="min-h-screen flex justify-center items-start p-4 pl-10 pr-10 pt-20">
      <div className="relative flex p-4 shadow-md bg-white rounded-lg border border-pink-200">
        {/* week nbr column */}
        <div className="flex flex-col items-center pt-[6rem]">
          {weekNumbers.map((weekNum, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center w-10 text-black font-semibold border-b border-gray-200 bg-pink-100"
            >
              {weekNum}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex-1">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable
            editable
            events={events}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            firstDay={1}
            weekNumbers={false}
            dayHeaderClassNames="text-gray-900 font-semibold bg-pink-100"
            dayCellClassNames="text-gray-900 bg-white"
            eventClassNames="bg-pink-200 text-gray-900 border border-pink-300"
          />
        </div>

        {/* Day-popup */}
        {activeDate && popupPos && (
          <div
            className="absolute bg-white shadow-md rounded p-2 z-50 border border-gray-200"
            style={{ top: popupPos.y, left: popupPos.x }}
          >
            <a
              href={`/createEvent?date=${activeDate}`}
              className="bg-pink-200 text-gray-900 px-3 py-1 rounded hover:bg-pink-300 block"
            >
              Create Event
            </a>
            <button
              onClick={() => setActiveDate(null)}
              className="text-sm text-gray-500 mt-1 block"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Event-popup */}
        {activeEvent && eventPopupPos && (
          <div
            className="absolute bg-white shadow-md rounded p-2 z-50 border border-gray-200"
            style={{ top: eventPopupPos.y, left: eventPopupPos.x }}
          >
            <button
              onClick={() => router.push(`/events/${activeEvent.id}`)}
              className="bg-pink-200 text-gray-900 px-3 py-1 rounded hover:bg-pink-300 block w-full text-left"
            >
              Go to Event
            </button>
            <button
              onClick={() => setActiveEvent(null)}
              className="text-sm text-gray-500 mt-1 block"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarComponent
