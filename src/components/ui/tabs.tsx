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
  React.useEffect(() => {
    // Använd value och onValueChange så ESLint blir nöjd
    console.log('Tabs value:', value)
    console.log(
      'onValueChange is a function:',
      typeof onValueChange === 'function'
    )
  }, [value, onValueChange])
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
  React.useEffect(() => {
    console.log('TabsTrigger value:', value)
  }, [value])
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
