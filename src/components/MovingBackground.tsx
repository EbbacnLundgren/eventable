'use client'

import { useEffect, useRef } from 'react'

export default function MovingBackground() {
    const vantaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let effect: any

        const loadVanta = async () => {
            // Ladda Three.js om det inte finns
            if (!(window as any).THREE) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement('script')
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js'
                    script.onload = () => resolve()
                    document.body.appendChild(script)
                })
            }

            // Ladda Vanta Fog via CDN
            if (!(window as any).VANTA) {
                await new Promise<void>((resolve) => {
                    const script = document.createElement('script')
                    script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js'
                    script.onload = () => resolve()
                    document.body.appendChild(script)
                })
            }

            // Initiera Vanta
            if (vantaRef.current && (window as any).VANTA?.FOG) {
                effect = (window as any).VANTA.FOG({
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
                    speed: 1.70,
                    zoom: 0.40,
                    backgroundAlpha: 0
                })
            }
        }

        loadVanta()

        return () => {
            if (effect) effect.destroy()
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
