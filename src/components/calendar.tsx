'use client'

import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const CalendarComponent: React.FC = () => {
    const [events, setEvents] = useState<any[]>([
        { title: 'Event 1', date: '2025-10-20' },
        { title: 'Event 2', date: '2025-10-21' },
    ])

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        const title = prompt('Eventtitel:')
        if (title) {
            setEvents([...events, { title, start: selectInfo.startStr }])
        }
    }

    const handleEventClick = (clickInfo: EventClickArg) => {
        if (confirm(`Vill du ta bort eventet '${clickInfo.event.title}'?`)) {
            setEvents(events.filter(e => e.title !== clickInfo.event.title || e.start !== clickInfo.event.startStr))
        }
    }

    return (
        <div className="flex-1 p-4 bg-pink-50 shadow-md">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                editable={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                firstDay={1}
                weekNumbers={true}
                weekNumberContent={(arg) => (
                    <div className="text-black font-semibold text-center w-8">{arg.num}</div>
                )}
            />
        </div>
    )
}

export default CalendarComponent
