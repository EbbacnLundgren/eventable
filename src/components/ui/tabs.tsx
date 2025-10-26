'use client'

//Används för filtering av event i EventSection

import * as React from 'react'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return <div className={className}>{children}</div>
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return <div className={className}>{children}</div>
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function TabsTrigger({
  value,
  className,
  children,
  onClick,
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      data-state={undefined}
    >
      {children}
    </button>
  )
}
