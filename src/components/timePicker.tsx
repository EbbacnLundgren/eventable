import { useState, useEffect, useRef } from 'react'

export default function TimePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generera tider i 15-minutersintervall
  const times: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      times.push(`${hour}:${minute}`)
    }
  }

  // Stäng dropdown när man klickar utanför
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Tillåt fri inmatning med grundläggande formatkontroll
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Tillåt partiella värden: "1", "12", "12:", "12:3", "12:30"
    const partialMatch = /^([0-1]?\d|2[0-3])?(:[0-5]?\d?)?$/
    if (partialMatch.test(input) || input === '') {
      onChange(input)
    } else {
      // ändå uppdatera, så man kan radera
      onChange(input)
    }
  }

  // Klick på dropdown-val
  const handleSelect = (t: string) => {
    onChange(t)
    setShowDropdown(false)
  }

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <input
        type="text"
        name="time"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        className="p-3 rounded-xl bg-white/40 backdrop-blur-md border border-white/50 
                   text-black placeholder-black focus:outline-none focus:ring-2 
                   focus:ring-pink-400 w-full"
        placeholder="HH:mm"
      />
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-scroll border rounded bg-white shadow">
          {times.map((t) => (
            <div
              key={t}
              onClick={() => handleSelect(t)}
              className="p-2 hover:bg-pink-100 cursor-pointer text-black"
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
