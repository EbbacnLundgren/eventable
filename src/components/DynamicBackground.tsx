'use client'

import { useEffect, useRef } from 'react'

interface DynamicBackgroundProps {
  imageUrl: string
  colorOverride?: string
  moving?: boolean
}

interface VantaEffect {
  destroy: () => void
}

interface VantaGlobal {
  FOG?: (options: Record<string, unknown>) => VantaEffect
}

declare global {
  interface Window {
    VANTA?: VantaGlobal
    THREE?: unknown
  }
}

export default function DynamicBackground({
  imageUrl,
  colorOverride,
  moving = true,
}: DynamicBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)

  useEffect(() => {
    if (!moving) {
      effectRef.current?.destroy()
      effectRef.current = null
      return
    }

    const loadVanta = async () => {
      if (!window.THREE) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script')
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js'
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      if (!window.VANTA) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script')
          script.src =
            'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js'
          script.onload = () => resolve()
          document.body.appendChild(script)
        })
      }

      effectRef.current?.destroy()

      const finalColor = colorOverride
        ? parseInt(colorOverride.replace('#', ''), 16)
        : 0xffffff

      if (vantaRef.current && window.VANTA?.FOG) {
        effectRef.current = window.VANTA.FOG({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0xffffff,
          midtoneColor: finalColor,
          lowlightColor: finalColor,
          baseColor: finalColor,
          blurFactor: 0.64,
          speed: 1.7,
          zoom: 0.4,
          backgroundAlpha: 0,
        })

        const canvas = vantaRef.current.querySelector('canvas')
        if (canvas) canvas.style.pointerEvents = 'none'
      }
    }

    loadVanta()

    return () => effectRef.current?.destroy()
  }, [moving, imageUrl, colorOverride])

  if (!moving) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{
          backgroundColor: colorOverride || '#ffffff',
        }}
      />
    )
  }

  return (
    <div
      ref={vantaRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  )
}
