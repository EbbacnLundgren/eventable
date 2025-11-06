'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'

interface ImageCropperProps {
    imageSrc: string
    onCancel: () => void
    onCropComplete: (croppedFile: File) => void
}

export default function ImageCropper({ imageSrc, onCancel, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropChange = (newCrop: any) => setCrop(newCrop)
    const onZoomChange = (newZoom: number) => setZoom(newZoom)

    const onCropCompleteHandler = useCallback((_: any, croppedArea: any) => {
        setCroppedAreaPixels(croppedArea)
    }, [])

    const createCroppedImage = async () => {
        if (!croppedAreaPixels) return

        const image = document.createElement('img')
        image.src = imageSrc
        await image.decode()

        const canvas = document.createElement('canvas')
        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height
        const ctx = canvas.getContext('2d')

        ctx?.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        )

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), 'image/jpeg')
        )

        if (!blob) return
        const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
        onCropComplete(file)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md h-[500px] flex flex-col">
                {/* Cropper */}
                <div className="relative flex-1 w-full">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteHandler}
                    />
                </div>

                {/* Zoom slider */}
                <div className="px-4 mt-4">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 p-4">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button
                        onClick={createCroppedImage}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600"
                    >
                        <Check size={16} /> Crop
                    </button>
                </div>
            </div>
        </div>
    )
}
