import LoginBox from '@/components/loginBox'
//import Link from 'next/link'
//import Image from 'next/image'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative">
      {/*<Link
        href="/"
        className="absolute left-4 top-4 px-3 py-1.5 rounded border border-black/20 bg-white/80 text-black text-sm hover:bg-white"
      >
        ← Back
      </Link>*/}

      {/* <Image
        src="/images/icon.png"
        alt="Eventable logo"
        width={200}
        height={200}
        unoptimized
        className="mb-4 mix-blend-multiply rounded-full drop-shadow-[0_0_35px_rgba(255,192,203,0.7)]"
      /> */}
      <LoginBox />
    </main>
  )
}
