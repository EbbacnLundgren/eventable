// src/app/page.tsx
import ProfileSettings from '@/components/ProfileSettings'
import CalendarComponent from '@/components/calendar'

export default function Page() {
  return (
    <div>
      <ProfileSettings />
      <h1>Min Kalender</h1>
      <CalendarComponent />
    </div>
  )
}
