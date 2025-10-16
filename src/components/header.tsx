'use client'

export default function Header() {

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => (window.location.href = '/main')}
      >
        Eventable!
      </h1>

    </header>
  )
}

/**
 * 
 * <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
        >
          Logout
        </button>
 */
