export function formatTime(value: unknown): string | null {
  if (value === null || value === undefined) return null

  // If it's already a Date
  if (value instanceof Date) {
    return value.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Numbers: either hour (0-23) or timestamp in ms
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 23) {
      return String(value).padStart(2, '0') + ':00'
    }
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return String(value)
  }

  // Strings: many possible formats
  if (typeof value === 'string') {
    const s = value.trim()
    if (s === '') return null

    // Already HH:mm
    if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s)) return s

    // Just hour like "9" or "09"
    if (/^(?:[01]?\d|2[0-3])$/.test(s)) return s.padStart(2, '0') + ':00'

    // If string has colons and more parts (e.g., 00:00:00 or 00:00:00.000), take first two
    if (s.includes(':')) {
      const parts = s.split(':')
      if (parts.length >= 2) {
        const hh = parts[0].padStart(2, '0')
        const mm = parts[1].slice(0, 2).padStart(2, '0')
        if (/^(?:[01]\d|2[0-3])$/.test(hh) && /^[0-5]\d$/.test(mm)) {
          return `${hh}:${mm}`
        }
      }
    }

    // Try parse ISO / timestamp-like strings
    const parsed = new Date(s)
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Fallback: return original string
    return s
  }

  // Fallback for other types
  try {
    return String(value)
  } catch {
    return null
  }
}
