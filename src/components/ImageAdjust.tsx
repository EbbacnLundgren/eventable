//Funkar inte just nu och jag måste verkligen ta en paus från detta

// 'use client'

// import { useRef, useState, useEffect } from 'react'

// interface ImageAdjustProps {
//     imageUrl: string
//     onSave: (adjustedImage: Blob) => void
//     onCancel: () => void
// }

// export default function ImageAdjust({ imageUrl, onSave, onCancel }: ImageAdjustProps) {
//     const containerRef = useRef<HTMLDivElement>(null)
//     const [zoom, setZoom] = useState(1)
//     const [position, setPosition] = useState({ x: 0, y: 0 })
//     const [isDragging, setIsDragging] = useState(false)
//     const [startPos, setStartPos] = useState({ x: 0, y: 0 })

//     // Aspect ratio som eventbilden
//     const ASPECT_RATIO = 3 / 1.2

//     // Drag funktioner
//     const handleMouseDown = (e: React.MouseEvent) => {
//         setIsDragging(true)
//         setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y })
//     }

//     const handleMouseMove = (e: React.MouseEvent) => {
//         if (!isDragging) return
//         setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y })
//     }

//     const handleMouseUp = () => setIsDragging(false)

//     const handleWheel = (e: React.WheelEvent) => {
//         e.preventDefault()
//         const delta = e.deltaY > 0 ? -0.05 : 0.05
//         setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 3))
//     }

//     const handleSave = async () => {
//         if (!containerRef.current) return

//         const canvas = document.createElement('canvas')
//         const width = 600
//         const height = width / ASPECT_RATIO
//         canvas.width = width
//         canvas.height = height

//         const ctx = canvas.getContext('2d')
//         if (!ctx) return

//         const img = new Image()
//         img.crossOrigin = 'anonymous'
//         img.src = imageUrl
//         await new Promise(resolve => (img.onload = resolve))

//         // Skala baserat på canvas
//         const drawWidth = img.width * zoom
//         const drawHeight = img.height * zoom
//         const offsetX = -position.x * (img.width / containerRef.current.offsetWidth)
//         const offsetY = -position.y * (img.height / containerRef.current.offsetHeight)

//         ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

//         canvas.toBlob(blob => {
//             if (blob) onSave(blob)
//             else console.error('Failed to create blob')
//         }, 'image/jpeg', 0.95)
//     }

//     // Stoppar drag utanför fönstret
//     useEffect(() => {
//         const handleMouseUpGlobal = () => setIsDragging(false)
//         window.addEventListener('mouseup', handleMouseUpGlobal)
//         return () => window.removeEventListener('mouseup', handleMouseUpGlobal)
//     }, [])

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//             <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center gap-4 w-full max-w-3xl">
//                 <h2 className="text-lg font-semibold mb-2">Adjust Image</h2>

//                 <div
//                     ref={containerRef}
//                     onMouseDown={handleMouseDown}
//                     onMouseMove={handleMouseMove}
//                     onMouseUp={handleMouseUp}
//                     onWheel={handleWheel}
//                     className="relative overflow-hidden border border-gray-300 rounded-lg bg-gray-100 cursor-grab active:cursor-grabbing"
//                     style={{
//                         width: '100%',
//                         maxWidth: '800px',
//                         aspectRatio: `${ASPECT_RATIO}`,
//                     }}
//                 >
//                     <img
//                         src={imageUrl}
//                         alt="Adjust"
//                         style={{
//                             transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
//                             transformOrigin: 'center center',
//                             width: '100%',
//                             height: '100%',
//                             objectFit: 'cover',
//                             pointerEvents: 'none',
//                             userSelect: 'none',
//                         }}
//                     />
//                 </div>

//                 {/* Zoom slider */}
//                 <input
//                     type="range"
//                     min={0.5}
//                     max={3}
//                     step={0.01}
//                     value={zoom}
//                     onChange={e => setZoom(parseFloat(e.target.value))}
//                     className="w-full mt-2"
//                 />

//                 <div className="flex justify-between w-full mt-4">
//                     <button
//                         onClick={onCancel}
//                         className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
//                     >
//                         Save
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }
