'use client'

import { useState } from 'react'
import { Image as Shuffle, Upload, X } from 'lucide-react'

interface Props {
  selectedImage: string
  onImageSelect: (file: File | null, url: string | null) => void
}

const themedImages = {
  all: [
    '/images/food1.jpg',
    '/images/food2.jpg',
    '/images/Food3.jpg',
    '/images/christmas1.jpg',
    '/images/christmas2.jpg',
    '/images/christmas3.jpg',
    '/images/christmas4.jpg',
    '/images/christmas5.jpg',
    '/images/christmas6.jpg',
    '/images/christmas7.jpg',
    '/images/party1.jpg',
    '/images/party2.jpg',
    '/images/party3.jpg',
    '/images/party4.jpg',
    '/images/default1.jpg',
    '/images/default2.jpg',
    '/images/default3.jpg',
    '/images/default4.jpg',
    '/images/default5.jpg',
    '/images/Animals1.jpg',
    '/images/Animals2.jpg',
    '/images/Animals3.jpg',
  ],
  christmas: [
    '/images/christmas1.jpg',
    '/images/christmas2.jpg',
    '/images/christmas3.jpg',
    '/images/christmas4.jpg',
    '/images/christmas5.jpg',
    '/images/christmas6.jpg',
    '/images/christmas7.jpg',
  ],
  party: [
    '/images/party1.jpg',
    '/images/party2.jpg',
    '/images/party3.jpg',
    '/images/party4.jpg',
  ],
  food: ['/images/food1.jpg', '/images/food2.jpg', '/images/Food3.jpg'],

  animals: [
    '/images/Animals1.jpg',
    '/images/Animals2.jpg',
    '/images/Animals3.jpg',
  ],
}

export default function ImageSelector({ selectedImage, onImageSelect }: Props) {
  const [currentImage, setCurrentImage] = useState(selectedImage)
  const [popupOpen, setPopupOpen] = useState(false)
  const [selectedPopupImage, setSelectedPopupImage] = useState<string | null>(
    null
  )
  const [activeTheme, setActiveTheme] = useState('all')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCurrentImage(url)
      onImageSelect(file, url)
    }
  }

  const openPopup = () => {
    setSelectedPopupImage(currentImage)
    setPopupOpen(true)
  }

  const confirmSelection = () => {
    if (selectedPopupImage) {
      setCurrentImage(selectedPopupImage)
      onImageSelect(null, selectedPopupImage)
    }
    setPopupOpen(false)
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
          onClick={openPopup}
          className={glassButtonStyle}
          title="Choose image"
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

      {/* Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-xl w-11/12 max-w-6xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Choose an image</h2>
              <button onClick={() => setPopupOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Theme menu */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Object.keys(themedImages).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setActiveTheme(theme)}
                  className={`px-4 py-2 rounded-full border ${
                    activeTheme === theme
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>

            {/* Image gallery med 2 bilder per rad */}
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {themedImages[activeTheme as keyof typeof themedImages].map(
                (img) => (
                  <img
                    key={img}
                    src={img}
                    alt={img}
                    className={`cursor-pointer w-full h-48 object-cover rounded-lg border-4 ${
                      selectedPopupImage === img
                        ? 'border-pink-500'
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedPopupImage(img)}
                  />
                )
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={confirmSelection}
                className="px-6 py-2 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
