'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@developer-hub/liquid-glass'
import { useState } from 'react'
import Intro from '@/components/intro'
import Stack from '../components/Stack'

const images = [
  '/images/create-3.png',
  '/images/create-3.png',
  '/images/create-3.png',
  '/images/create-3.png',
]

export default function Home() {
  const [openIntro, setOpenIntro] = useState(false)
  return (
    <div className="relative flex flex-col min-h-screen text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/background-picture.jpg"
          alt="Background"
          fill
          priority
          className="object-cover scale-x-[-1]"
        />
      </div>
      {/* Overlay för mörkare topp*/}
      <div className="absolute top-0 left-0 w-full h-[25%] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(35, 106, 168, 0.6), rgba(249, 198, 244, 0))',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Navigation */}
      <div className="absolute top-0 right-0 m-5 flex gap-4 z-20">
        <GlassCard
          displacementScale={80}
          blurAmount={0.3}
          cornerRadius={12}
          padding="16px 24px"
          className="border border-white/40 bg-white/20 hover:bg-white/50 cursor-pointer"
        >
          <Link href="/login" className="text-white text-lg font-semibold">
            Login
          </Link>
        </GlassCard>

        <GlassCard
          displacementScale={80}
          blurAmount={0.3}
          cornerRadius={12}
          padding="16px 24px"
          className="border border-white/40 bg-white/20 hover:bg-white/50 cursor-pointer"
        >
          <Link href="/signup" className="text-white text-lg font-semibold ">
            Sign up
          </Link>
        </GlassCard>
      </div>

      {/* HERO */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 px-6 sm:px-20 lg:pt-12">
        {/* LEFT SIDE: LOGO + TEXT */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/tenth-version.png"
            alt="Eventable Logo"
            width={900}
            height={900}
            priority
            className="drop-shadow-xl object-cover object-center
               w-full max-w-[600px] sm:max-w-[700px] md:max-w-[900px] lg:max-w-[1050px] h-auto"
          />

          <p className="relative -top-12 text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-semibold font-sans text-[#1B0D6B]">
            A seamless way to create, find and explore events. Enjoy!
          </p>

          <GlassCard
            displacementScale={80}
            blurAmount={0.3}
            cornerRadius={12}
            padding="16px 24px"
            className="border border-white/40 bg-white/20 hover:bg-white/50 mt-8 cursor-pointer"
            onClick={() => setOpenIntro(true)}
          >
            <span className="text-white text-lg font-semibold">About us</span>
          </GlassCard>
        </div>

        {/* RIGHT SIDE STACK */}
        <div className="w-[80vw] max-w-[32rem] aspect-[5/6] mt-12 lg:mt-24">
          <Stack
            randomRotation={true}
            sensitivity={180}
            sendToBackOnClick={true}
            cards={images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`card-${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ))}
          />
        </div>

        {/* RIGHT SIDE STACK */}
        <div className="w-[80vw] max-w-[32rem] aspect-[5/6] mt-12 lg:mt-24">
          <Stack
            randomRotation={true}
            sensitivity={180}
            sendToBackOnClick={true}
            cards={images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`card-${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ))}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pb-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Eventable
      </div>
      <Intro open={openIntro} onClose={() => setOpenIntro(false)} />
    </div>
  )
}
