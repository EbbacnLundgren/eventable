interface Event {
  id: number
  name: string
  location: string
  date: string
  time?: number
  image?: string
}

interface UpcomingEventsProps {
  events?: Event[]
}

const UpcomingEvents = ({ events = [] }: UpcomingEventsProps) => {
  // Add a dummy event if none exist
  const displayedEvents = events.length
    ? events
    : [
        {
          id: 0,
          name: "Wine tasting",
          location: "Lund, Sweden",
          date: "Sep 18, 2025",
          image: "/images/winetasting.jpg",
        },
      {
        id: 1,
        name: "Pottery",
        location: "Malmö, Sweden",
        date: "Oct 5, 2025",
        image: "/images/pottery.jpg",
      },
      {
        id: 2,
        name: "Music Festival",
        location: "Gothenburg, Sweden",
        date: "Nov 12, 2025",
        image: "/images/musicfestival.jpg", 
      },
      ]

  return (
    <section className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {displayedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow text-gray-900"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-sm text-gray-500">{event.date}</p>
              <p className="text-sm text-gray-600">{event.location}</p>
              <button className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-400 to-yellow-400 rounded-lg hover:opacity-90">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default UpcomingEvents
