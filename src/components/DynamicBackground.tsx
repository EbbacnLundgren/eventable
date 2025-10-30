'use client'

import { useEffect, useRef } from 'react'
import ColorThief from 'colorthief'

declare global {
  interface Window {
    THREE?: typeof import('three')
    VANTA?: {
      FOG?: (options: VantaFogOptions) => VantaEffect
    }
  }
}

interface VantaEffect {
  destroy: () => void
}

interface VantaFogOptions {
  el: HTMLElement
  mouseControls?: boolean
  touchControls?: boolean
  gyroControls?: boolean
  minHeight?: number
  minWidth?: number
  highlightColor?: number
  midtoneColor?: number
  lowlightColor?: number
  baseColor?: number
  blurFactor?: number
  speed?: number
  zoom?: number
  backgroundAlpha?: number
}

interface DynamicBackgroundProps {
  imageUrl: string
}

export default function DynamicBackground({
  imageUrl,
}: DynamicBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)

  // Utility: convert RGB array → hex number
  function rgbToHexNumber([r, g, b]: number[]) {
    return (r << 16) + (g << 8) + b
  }

  useEffect(() => {
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

      // Extract main color from image
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageUrl
      img.onload = () => {
        const colorThief = new ColorThief()
        const color = colorThief.getColor(img)
        const baseColor = rgbToHexNumber(color)

        // Recreate the VANTA effect each time image changes
        if (effectRef.current) effectRef.current.destroy()

        if (vantaRef.current && window.VANTA?.FOG) {
          effectRef.current = window.VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            highlightColor: 0xffffff,
            midtoneColor: baseColor,
            lowlightColor: baseColor,
            baseColor: baseColor,
            blurFactor: 0.64,
            speed: 1.7,
            zoom: 0.4,
            backgroundAlpha: 0,
          })
        }
      }
    }

    loadVanta()

    return () => {
      effectRef.current?.destroy()
    }
  }, [imageUrl])

  return (
    <div
      ref={vantaRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
