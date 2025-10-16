
import CalendarComponent from '@/components/calendar'
import Sidebar from '@/components/Sidebar'

export default function Page() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-20">
                <CalendarComponent />

            </div>
        </div>
    )
}