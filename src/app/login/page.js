"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMessage(error.message)
        else setMessage("Inloggad!")
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMessage(error.message)
        else setMessage("Konto skapat! Kolla mailen för verifiering.")
      }
    } catch (err) {
      setMessage(err.message)
    }
  }

  // Hämta inloggad användare via API
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user")
      const json = await res.json()
      if (!json.error) setUser(json.user)
    }

    fetchUser()
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      {user ? (
        <div>
          <h2>Välkommen, {user.email}</h2>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">{isLogin ? "Logga in" : "Skapa konto"}</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64">
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {isLogin ? "Logga in" : "Skapa konto"}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-sm text-blue-500"
          >
            {isLogin ? "Har du inget konto? Skapa ett" : "Har du redan konto? Logga in"}
          </button>

          {message && <p className="mt-4 text-red-500">{message}</p>}
        </>
      )}
    </main>
  )
}
