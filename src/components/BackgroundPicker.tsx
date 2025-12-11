'use client'

import { useState } from 'react'

interface BackgroundColorPickerProps {
  defaultColor: string
  onChange: (color: string) => void
}

export default function BackgroundColorPicker({
  defaultColor,
  onChange,
}: BackgroundColorPickerProps) {
  const [color, setColor] = useState(defaultColor)

  return (
    <div className="absolute top-40 right-4 z-50 flex items-center gap-2 bg-white/80 p-2 rounded shadow">
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value)
          onChange(e.target.value)
        }}
        className="w-10 h-10 p-0 border-none cursor-pointer"
      />
      <span className="text-sm">Byt bakgrundsfärg</span>
    </div>
  )
}
