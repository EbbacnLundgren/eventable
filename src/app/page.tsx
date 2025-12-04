'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@developer-hub/liquid-glass'


export default function Home() {

  return (
    <div className="relative flex flex-col justify-between h-screen text-white overflow-hidden">

      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/background-picture.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Navigation */}
      <div className="absolute top-0 right-0 m-5 flex gap-4 z-20">
        <GlassCard
          displacementScale={80}
          blurAmount={0.3}
          cornerRadius={12}
          padding="16px 24px"
          className="border border-white/40 bg-white/20 cursor-pointer"
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
          className="border border-white/40 bg-white/20 cursor-pointer"
        >
          <Link href="/signup" className="text-white text-lg font-semibold">
            Sign up
          </Link>
        </GlassCard>
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 right-10 flex flex-col items-center justify-center px-10 sm:px-20 max-w-5xl h-full -translate-y-16">
        <Image
          src="/tenth-version.png"
          alt="Eventable Logo"
          width={900}
          height={900}
          priority
          className="drop-shadow-xl -translate-y-4"
        />

        <p className="text-3xl text-[#1B0D6B] sm:text-4xl font-semibold font-sans max-w-3xl mt-[-5rem] text-neutral-900 -translate-y-10">
          A seamless way to create, find and explore events. Enjoy!
        </p>
      </div>

      <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20 w-[32rem] h-[32rem]">
        <GlassCard
          displacementScale={20}
          blurAmount={0.2}
          cornerRadius={18}
          padding="0"
          className="overflow-hidden border border-white/20 bg-white/10 max-w-none w-[32rem] h-[32rem]"
        >

          <Image
            src="/images/create-3.png"
            alt="Example event 1"
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </GlassCard>
      </div>

      {/* FOOTER LINE (super thin, elegant) */}
      <div className="absolute bottom-0 left-0 w-full text-center text-xs text-white/40 pb-2">
        © {new Date().getFullYear()} Eventable
      </div>
    </div>
  )
}
