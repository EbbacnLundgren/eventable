import SignupBox from '@/components/signUpBox'
//import Link from 'next/link'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative">
      {/*
      <Link
        href="/"
        className="absolute left-4 top-4 px-3 py-1.5 rounded border border-black/20 bg-white/80 text-black text-sm hover:bg-white"
      >
        ← Back
      </Link>*/}
      <div className="min-h-screen w-full flex items-center justify-center">
        <SignupBox />
      </div>
    </main>
  )
}
