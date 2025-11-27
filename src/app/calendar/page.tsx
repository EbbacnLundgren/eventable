import CalendarComponent from '@/components/calendar'

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 ml-20">
        <CalendarComponent />
      </div>
    </div>
  )
}
