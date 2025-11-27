'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type FilterType = 'upcoming' | 'hosting' | 'past' | 'declined' //| 'public'

interface EventFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  counts: Record<FilterType, number>
}

export default function EventFilters({
  activeFilter,
  onFilterChange,
  counts = { upcoming: 0, hosting: 0, past: 0, declined: 0 },
}: EventFiltersProps) {
  const tabClass = (filter: FilterType) =>
    `rounded-md font-medium py-2.5 transition-all ${
      activeFilter === filter
        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

  return (
    <div className="flex justify-center w-full max-w-2xl mx-auto mb-8">
      <Tabs
        value={activeFilter}
        onValueChange={(v) => onFilterChange(v as FilterType)}
        className="flex-1"
      >
        <TabsList
          className="
    grid w-full grid-cols-4
    bg-white/20 backdrop-blur-md
    border border-white/30
    p-1 rounded-xl
    gap-1
    min-h-[48px]
  "
        >
          <TabsTrigger
            value="upcoming"
            className={tabClass('upcoming')}
            onClick={() => onFilterChange('upcoming')}
          >
            <span className="flex items-center justify-center  gap-1.5">
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {counts.upcoming}
              </span>
              Upcoming
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="hosting"
            className={tabClass('hosting')}
            onClick={() => onFilterChange('hosting')}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {counts.hosting}
              </span>
              Hosting
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="past"
            className={tabClass('past')}
            onClick={() => onFilterChange('past')}
          >
            <span className="flex items-center justify-center  gap-2">
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {counts.past}
              </span>
              Past
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="declined"
            className={tabClass('declined')}
            onClick={() => onFilterChange('declined')}
          >
            <span className="flex items-center justify-center  gap-2">
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {counts.declined}
              </span>
              Declined
            </span>
          </TabsTrigger>
          {/**
                     * <TabsTrigger value="public" className={tabClass('public')} onClick={() => onFilterChange('public')}>
                        Public
                    </TabsTrigger>
                     * 
                     */}
        </TabsList>
      </Tabs>
    </div>
  )
}
