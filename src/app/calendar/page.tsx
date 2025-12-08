import CalendarComponent from '@/components/calendar'

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1 ml-7 mr-7 mb-7">
        <CalendarComponent />
      </div>
    </div>
  )
}
