//Flyttade koden från createEvent till egen konponent
//hanterar att välja bild antingen genom att ladda upp eller slumpa fram en från defaultbilderna

'use client'

import { useState } from 'react'
import { Image as Shuffle, Upload } from 'lucide-react'

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

  //const glassButtonStyle = 'flex items-center justify-center w-10 h-10 rounded-lg border border-black text-black bg-white backdrop-blur-sm hover:bg-black/10 transition-all duration-300'
  //const glassButtonStyle ='border border-black text-black bg-transparent px-4 py-2 rounded-lg hover:bg-black/10 flex items-center gap-2'
  const glassButtonStyle =
    'flex items-center justify-center w-10 h-10 rounded-lg border border-black text-black bg-white/80 shadow-sm hover:bg-gray-100 transition-all duration-300'

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
          className={glassButtonStyle}
          title="Randomize image"
        >
          <Shuffle size={20} />
        </button>

        <label
          className={`${glassButtonStyle} cursor-pointer`}
          title="Upload image"
        >
          <Upload size={20} />
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
