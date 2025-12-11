'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Mail } from 'lucide-react'

interface IntroModalProps {
  open: boolean
  onClose: () => void
}

export default function Intro({ open, onClose }: IntroModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white text-black rounded-2xl shadow-xl p-8 w-[90%] max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">About us</h2>

            <div className="space-y-4 text-sm">
              <p className="pt-2 text-center text-gray-600">
                We are four soon-to-be engineers who saw a gap in the market and
                decided to do something about it.
              </p>

              <p className="pt-2 text-center text-gray-600">
                We wanted a clear and structured website where we could gather
                all the different events in life. We had two demands: it needed
                to be easy to use and it should make you feel inspired and
                excited!
              </p>

              <p className="pt-2 text-center text-gray-600">
                Feel free to contact us for further questions.
              </p>

              <div className="flex justify-center gap-6 pt-2">
                <a
                  href="mailto:Contacteventable@gmail.com"
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get started!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
