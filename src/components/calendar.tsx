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
import { createPortal } from 'react-dom'

interface EventRow {
  id: string
  name: string
  date: string
  end_date?: string | null
  time?: string | null
}

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}

// helper för exclusive end (FullCalendar vill ha slutdagen + 1)
function addOneDay(dateString: string) {
  const d = new Date(dateString)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
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

      const { data: googleUser, error: gErr } = await supabase
        .from('google_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (gErr || !googleUser) {
        setEvents([])
        return
      }

      const userId = googleUser.id

      const { data, error } = await supabase
        .from('events')
        .select('id, name, date, end_date, time')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (error || !data) {
        setEvents([])
        return
      }

      const formatted = (data as EventRow[])
        .flatMap(e => {
          const hasEnd = e.end_date && e.end_date !== "";
          const eventsExpanded: EventInput[] = [];

          let index = 0; // ny räknare

          // Start bubble
          eventsExpanded.push({
            id: `${e.id}-${index++}`,       // unikt id
            groupId: e.id,                  // används för popup mm
            title: e.name,
            date: e.date,
            extendedProps: { time: e.time }
          });

          // Extra days
          if (hasEnd) {
            const start = new Date(e.date);
            const end = new Date(e.end_date as string);

            let d = new Date(start);
            d.setDate(d.getDate() + 1);

            while (d <= end) {
              eventsExpanded.push({
                id: `${e.id}-${index++}`,   // unikt id
                groupId: e.id,              // alla tillhör samma event
                title: e.name,
                date: d.toISOString().split("T")[0],
                extendedProps: { time: null }
              });
              d.setDate(d.getDate() + 1);
            }
          }

          return eventsExpanded;
        })


      setEvents(formatted)
    }

    fetchEvents()
  }, [session])

  // Uppdatera veckonummer
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

  // Klick på dag → popup
  const handleDateClick = (arg: { dateStr: string; dayEl: HTMLElement }) => {
    const clickedDate = new Date(arg.dateStr)
    const today = new Date()

    clickedDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    if (clickedDate < today) return

    const rect = arg.dayEl.getBoundingClientRect()

    setActiveDate(arg.dateStr)
    setPopupPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 10,
    })
    setActiveEvent(null)
  }

  // Klick på event → popup
  const handleEventClick = (clickInfo: EventClickArg) => {
    const rect = clickInfo.el.getBoundingClientRect()

    setActiveEvent({
      id: clickInfo.event.groupId, // samma event-id, inte bubblans id
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
    });

    setEventPopupPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 10,
    })

    setActiveDate(null)
  }

  return (
    <div className="min-h-screen flex justify-center items-start p-4 pl-10 pr-10 pt-20">
      <div className="relative flex p-4 shadow-lg bg-white rounded-3xl border border-gray-200 max-w-[2000px] w-full mx-auto overflow-hidden">
        {/* Week numbers */}
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
            eventContent={(info) => {
              let time = info.event.extendedProps.time

              // Formatera tid: "16:00:00" → "16:00"
              if (time && time.length === 8) {
                time = time.slice(0, 5)
              }

              return {
                html: `
      <div style="
        color:#111;
        font-weight:500;
        font-size:13px;
        padding:4px 8px;
        background:#fef1f4;
        border:1px solid #f7cad7;
        border-radius:12px;
        margin:2px 0;
      ">
        <div>${info.event.title}</div>

        ${time
                    ? `<div style="
                 font-size:11px;
                 opacity:0.55;
                 margin-top:2px;
                 font-weight:400;
               ">
                 ${time}
               </div>`
                    : ""
                  }
      </div>
    `
              }
            }}

            height="auto"
            firstDay={1}
            weekNumbers={false}
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'addEvent prev,next today',
            }}
            customButtons={{
              addEvent: {
                text: '+',
                click: () => {
                  const today = new Date().toISOString().split('T')[0]
                  router.push(`/createEvent?date=${today}`)
                },
              },
            }}
            dayHeaderClassNames="text-gray-600 font-medium bg-white border-b border-gray-200 tracking-wide"
            dayCellClassNames="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
            eventClassNames="fc-myEvent"
          />
        </div>
      </div>

      {/* Day popup via Portal */}
      {activeDate && popupPos && (
        <Portal>
          <div
            className="fixed bg-white shadow-md rounded p-2 z-50 border border-gray-200"
            style={{
              top: popupPos.y,
              left: popupPos.x,
              transform: 'translateX(-50%)',
            }}
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
        </Portal>
      )}

      {/* Event popup via Portal */}
      {activeEvent && eventPopupPos && (
        <Portal>
          <div
            className="fixed bg-white shadow-md rounded p-2 z-50 border border-gray-200"
            style={{
              top: eventPopupPos.y,
              left: eventPopupPos.x,
              transform: 'translateX(-50%)',
            }}
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
        </Portal>
      )}
    </div>
  )
}

export default CalendarComponent
