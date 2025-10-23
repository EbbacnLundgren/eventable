export function formatEventDuration(
  startDate: string,
  startTime?: string | null,
  endDate?: string | null,
  endTime?: string | null
): string {
  if (!startDate) return ''

  const start = new Date(`${startDate}T${startTime || '00:00'}`)
  const hasEnd = endDate || endTime

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const startStr = `${dateFormatter.format(start)}${
    startTime ? `, ${timeFormatter.format(start)}` : ''
  }`

  if (!hasEnd) return startStr

  const end = new Date(`${endDate || startDate}T${endTime || '00:00'}`)
  const sameDay = startDate === (endDate || startDate)

  const endStr = sameDay
    ? `${timeFormatter.format(end)}`
    : `${dateFormatter.format(end)}, ${timeFormatter.format(end)}`

  return `${startStr} → ${endStr}`
}
