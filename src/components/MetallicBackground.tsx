'use client'

import { useEffect, useState } from 'react'
import MetallicPaint, { parseLogoImage } from './MetallicPaint'

export default function MetallicBackground() {
    const [imageData, setImageData] = useState<ImageData | null>(null)
    const logoUrl = '/icons/eventable.svg'

    useEffect(() => {
        console.log("HEJ1");
        async function loadLogo() {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = logoUrl
            img.onload = async () => {
                const width = img.naturalWidth || 1000
                const height = img.naturalHeight || 1000

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(img, 0, 0, width, height)

                const blob = await new Promise<Blob | null>((resolve) =>
                    canvas.toBlob(resolve, 'image/png')
                )
                if (!blob) return
                const file = new File([blob], 'eventable.png', { type: 'image/png' })
                const parsedData = await parseLogoImage(file)
                setImageData(parsedData?.imageData ?? null)
            }

            console.log("HEJ3");
            console.log(img.naturalWidth, img.naturalHeight)
            img.onerror = (e) => console.error('Failed to load logo image', e)
        }

        loadLogo()
    }, [])

    // Visa inget tills imageData är klar
    if (!imageData) return null

    return (
        <div className="fixed inset-0 -z-10 w-full h-full">
            <MetallicPaint
                imageData={imageData}
                params={{
                    edge: 2,
                    patternBlur: 0.005,
                    patternScale: 2,
                    refraction: 0.015,
                    speed: 0.3,
                    liquid: 0.07,
                }}
            />
        </div>
    )
}
