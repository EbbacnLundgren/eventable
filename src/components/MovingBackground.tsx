'use client'

import { useEffect, useRef } from 'react'

interface VantaEffect {
  destroy: () => void
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

export default function MovingBackground() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)

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

      if (vantaRef.current && window.VANTA?.FOG) {
        effectRef.current = window.VANTA.FOG({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0xffffff,
          midtoneColor: 0xff7be6,
          lowlightColor: 0xfffe5d,
          baseColor: 0xff7951,
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

    return () => {
      effectRef.current?.destroy()
    }
  }, [])

  return (
    <div
      ref={vantaRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
