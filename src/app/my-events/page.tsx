'use client'
import Sidebar from '@/components/Sidebar'
import EventChat from '@/components/EventChat'

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <EventChat />
      </div>
    </div>
  )
}
