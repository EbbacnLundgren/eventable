//Flyttade koden från createEvent till egen konponent
//hanterar att välja bild antingen genom att ladda upp eller slumpa fram en från defaultbilderna

'use client'

import { useState } from 'react'
import { Image as ImageIcon, Shuffle } from 'lucide-react'

interface Props {
    selectedImage: string
    onImageSelect: (file: File | null, url: string | null) => void
}

export default function ImageSelector({ selectedImage, onImageSelect }: Props) {
    const defaultImages = [
        '/images/default1.jpg',
        '/images/default2.jpg',
        '/images/default3.jpg',
        '/images/default4.jpg',
        '/images/default5.jpg',
    ]

    const [currentImage, setCurrentImage] = useState(selectedImage)

    const handleRandomize = () => {
        let random = currentImage
        while (random === currentImage) {
            random = defaultImages[Math.floor(Math.random() * defaultImages.length)]
        }
        setCurrentImage(random)
        console.log('Randomized image selected:', random)

        onImageSelect(null, random)
    }

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setCurrentImage(url)
            console.log('Uploaded image selected:', file, url) // <- logga här
            onImageSelect(file, url)
        }
    }

    return (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
            <img
                src={currentImage}
                alt="Event banner"
                className="object-cover w-full h-full transition-all duration-300"
            />

            <div className="absolute top-3 right-3 flex gap-2">
                <button
                    type="button"
                    onClick={handleRandomize}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg hover:scale-105"
                    title="Randomize image"
                >
                    <Shuffle size={20} />
                </button>

                <label
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg hover:scale-105"
                    title="Upload image"
                >
                    <ImageIcon size={20} />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    )
}
