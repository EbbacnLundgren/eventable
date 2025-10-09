import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 text-white relative bg-animated">
      {/* Top right buttons */}
      <div className="absolute top-0 right-0 m-5 flex flex-wrap gap-2">
        <Link
          href="/login"
          className="p-2 w-20 bg-white text-pink-600 font-semibold rounded shadow hover:bg-gray-100 transition text-center"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="p-2 w-20 bg-white text-pink-600 font-semibold rounded shadow hover:bg-gray-100 transition text-center"
        >
          Signup
        </Link>
      </div>

      {/* Logga, liten slogan*/}
      <div className="flex flex-col sm:flex-row items-center justify-start flex-1 px-10 sm:px-20 gap-10 pt-10 sm:pt-16">
        <div className="flex flex-col items-start sm:w-1/2">
          <Image
            src="/wholelogo.png"
            alt="Eventable logo"
            width={700}
            height={700}
            priority
            className="drop-shadow-lg -translate-y-8 mb-[-1rem]"
          />
          <h2 className="text-3xl sm:text-4xl font-baloo font-bold text-white/90 drop-shadow-md -mt-16">
            PLAN. SHARE. CELEBRATE.
          </h2>
        </div>

        {/* Exempelbild!! */}
        <div className="sm:w-1/2 flex justify-center">
          <Image
            src="/frontpageexample.png"
            alt="Friends celebrating"
            width={450}
            height={450}
            className="rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
