'use client'

import { useEffect, useRef } from 'react'

interface VantaEffect {
  destroy: () => void
  setOptions?: (options: Record<string, unknown>) => void
}

/*interface VantaFogOptions {
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
}*/

interface ColorThiefModule {
  getColor: (image: HTMLImageElement) => number[]
}

interface DynamicBackgroundProps {
  imageUrl: string
  colorOverride?: string // valfri färg från panelen
}

export default function DynamicBackground({
  imageUrl,
  colorOverride,
}: DynamicBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)

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

      let ColorThief: ColorThiefModule | null = null
      try {
        const ColorThiefClass = (await import('colorthief')).default
        ColorThief = new ColorThiefClass()
      } catch (e) {
        console.error('Could not load colorthief:', e)
      }

      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageUrl
      img.onload = () => {
        let baseColor = 0x000000
        if (ColorThief) {
          try {
            const color = ColorThief.getColor(img)
            baseColor = rgbToHexNumber(color)
          } catch (err) {
            console.error('ColorThief failed:', err)
          }
        }

        // Använd färg från panelen om den finns
        const finalColor = colorOverride
          ? parseInt(colorOverride.replace('#', ''), 16)
          : baseColor

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
    }

    loadVanta()

    return () => {
      effectRef.current?.destroy()
    }
  }, [imageUrl, colorOverride])

  return (
    <div
      ref={vantaRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
