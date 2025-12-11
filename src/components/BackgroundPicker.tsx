'use client'

import { useState } from 'react'
import { Palette, Waves } from 'lucide-react'

interface BackgroundColorPickerProps {
  defaultColor: string
  onChange: (color: string) => void
  onToggleMoving: (moving: boolean) => void
  defaultMoving?: boolean
}

export default function BackgroundColorPicker({
  defaultColor,
  onChange,
  onToggleMoving,
  defaultMoving = true,
}: BackgroundColorPickerProps) {
  const [color, setColor] = useState(defaultColor)
  const [moving, setMoving] = useState(defaultMoving)

  return (
    <div
      className="
        fixed top-1/2 right-6 -translate-y-1/2
        bg-white/75 backdrop-blur-xl
        shadow-xl border border-black/10
        rounded-2xl p-5 w-52
        flex flex-col gap-6
        z-50
      "
    >
      {/* Titel */}
      <h3 className="text-base font-semibold text-gray-800">
        Background settings
      </h3>

      {/* Color */}
      <div className="flex items-center gap-4">
        <Palette size={24} className="text-gray-800" />

        <input
          type="color"
          value={color}
          onChange={(e) => {
            const c = e.target.value
            setColor(c)
            onChange(c)
          }}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
        />
      </div>

      {/* Moving */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Waves size={24} className="text-gray-800" />
          <span className="text-base">Moving</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const v = !moving
            setMoving(v)
            onToggleMoving(v)
          }}
          className={`relative w-12 h-6 rounded-full transition
            ${moving ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition
              ${moving ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  )
}
