'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

export interface AdvancedFilterState {
  city: string
  dateFrom?: string
  dateTo?: string
  dayOfWeek: string
  host: string
  keyword: string
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterState
  onFiltersChange: (filters: AdvancedFilterState) => void
}

const daysOfWeek = [
  'Any Day',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilterState>(filters)
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const today = new Date().toISOString().split('T')[0]

  const handleReset = () => {
    const reset: AdvancedFilterState = {
      city: '',
      dateFrom: '',
      dateTo: '',
      dayOfWeek: '',
      host: '',
      keyword: '',
    }
    setLocalFilters(reset)
    onFiltersChange(reset)
  }

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length

  return (
    <div className="relative mb-6">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium text-stone-900 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all"
      >
        <Filter size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-pink-500 text-white rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Slide-in panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md p-6 flex flex-col space-y-6 text-stone-900 transition-transform animate-slide-in-from-right rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Advanced Filters</h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {/* Filters */}
            <div className="space-y-4">
              {/* City */}
              <div>
                <label className="block font-semibold text-sm mb-1">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={localFilters.city}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, city: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white/50 text-stone-900"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    min={today}
                    max={localFilters.dateTo || undefined}
                    onClick={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    }
                    inputMode="none"
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) => {
                      const newDateFrom = e.target.value

                      const newDateTo =
                        localFilters.dateTo && newDateFrom > localFilters.dateTo
                          ? ''
                          : localFilters.dateTo
                      setLocalFilters({
                        ...localFilters,
                        dateFrom: newDateFrom,
                        dateTo: newDateTo,
                      })
                    }}
                    className="flex-1 p-2 border rounded-md bg-white/50 text-stone-900"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    min={localFilters.dateFrom || today}
                    onClick={(e) =>
                      (e.target as HTMLInputElement).showPicker?.()
                    }
                    inputMode="none"
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateTo: e.target.value,
                      })
                    }
                    className="flex-1 p-2 border rounded-md bg-white/50 text-stone-900"
                  />
                </div>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Day of Week
                </label>
                <select
                  value={localFilters.dayOfWeek}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dayOfWeek: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md bg-white/50 text-stone-900"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day === 'Any Day' ? '' : day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Host */}
              <div>
                <label className="block font-semibold text-sm mb-1">Host</label>
                <input
                  type="text"
                  placeholder="Search by host..."
                  value={localFilters.host}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, host: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white/50 text-stone-900 placeholder:text-stone-400"
                />
              </div>

              {/* Keyword */}
              <div>
                <label className="block font-semibold text-sm mb-1">
                  Keyword
                </label>
                <input
                  type="text"
                  placeholder="Search in title..."
                  value={localFilters.keyword}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      keyword: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md bg-white/50 text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleReset}
                className="flex-1 py-2 mr-2 border rounded-md hover:bg-gray-100 text-stone-900 flex items-center justify-center gap-1"
              >
                <X size={16} /> Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2 ml-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-md hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind animation */}
      <style jsx>{`
        @keyframes slide-in-from-right {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-slide-in-from-right {
          animation: slide-in-from-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
