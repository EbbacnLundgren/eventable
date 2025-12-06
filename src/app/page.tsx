'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@developer-hub/liquid-glass'

export default function Home() {
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
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 px-6 sm:px-20 pt-24">
        {/* LEFT SIDE: LOGO + TEXT */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/tenth-version.png"
            alt="Eventable Logo"
            width={900}
            height={900}
            priority
            className="drop-shadow-xl object-cover object-center
                       w-[700px] sm:w-[750px] md:w-[900px] lg:w-[1050px] xl:w-[1200px] h-auto"
          />

          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold font-sans text-[#1B0D6B] -mt-20">
            A seamless way to create, find and explore events. Enjoy!
          </p>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="flex justify-center lg:justify-end w-full lg:w-auto mt-10 lg:mt-4 pt-20">
          <GlassCard
            displacementScale={20}
            blurAmount={0.2}
            cornerRadius={18}
            padding="0"
            className="overflow-hidden border border-white/20 bg-white/10
                       w-[18rem] h-[18rem]
                       sm:w-[22rem] sm:h-[22rem]
                       md:w-[26rem] md:h-[26rem]
                       lg:w-[28rem] lg:h-[28rem]
                       xl:w-[32rem] xl:h-[32rem]"
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
      </div>

      {/* FOOTER */}
      <div className="mt-auto pb-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Eventable
      </div>
    </div>
  )
}
