'use client'

import Link from 'next/link'
import Image from 'next/image'
import MovingBackground from '@/components/MovingBackground'
import { GlassCard } from '@developer-hub/liquid-glass'

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen text-white">
      <MovingBackground />

      <div className="absolute top-0 right-0 m-5 flex flex-wrap gap-4 z-20">
        <GlassCard
          displacementScale={100}
          blurAmount={0.33}
          cornerRadius={12}
          padding="16px 24px"
          className="cursor-pointer border border-white bg-white bg-opacity-30 border-opacity-50 transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          <Link
            href="/login"
            className="w-full text-center text-white text-xl font-semibold"
          >
            Login
          </Link>
        </GlassCard>

        <GlassCard
          displacementScale={100}
          blurAmount={0.33}
          cornerRadius={12}
          padding="16px 24px"
          className="cursor-pointer border border-white bg-white bg-opacity-30 border-opacity-50 transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        >
          <Link
            href="/signup"
            className="w-full text-center text-white text-xl font-semibold"
          >
            Signup
          </Link>
        </GlassCard>
      </div>

      {/* Logga och slogan */}
      <div className="flex flex-col sm:flex-row items-center justify-start flex-1 px-10 sm:px-20 gap-10 pt-10 sm:pt-16 z-10">
        <div className="flex flex-col items-start sm:w-auto">
          <Image
            src="/nineth_version.png"
            alt="Eventable logo"
            width={1000}
            height={1000}
            priority
            className="drop-shadow-lg -translate-y-8 mb-[-1rem]"
          />
        </div>
      </div>
    </div>
  )
}
