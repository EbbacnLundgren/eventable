"use client";

import { useState, FormEvent, useEffect } from "react";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";



interface SupabaseUser {
  id: string;
  email: string | null;
  [key: string]: unknown;
}

export default function LoginBox({ startInSignup = false }: { startInSignup?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(!startInSignup);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Kontrollera om användare är inloggad via Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser(data.user as unknown as SupabaseUser);
    };
    fetchUser();
  }, []);

  // Om användare är inloggad via NextAuth (Google)
  if (session) {
    return (
      <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30">
        <p className="text-lg font-bold mb-4">Hej, {session.user?.name}!</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logga ut
        </button>
      </div>
    );
  }

  // Om användare är inloggad via Supabase
  if (user) {
    return (
      <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30">
        <p className="text-lg font-bold mb-4">Hej, {user.email}!</p>
      </div>
    );
  }

  // Hantera e-mail/password login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else router.push("/main");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMessage(error.message);
        else setMessage("Account created! Check your email for verification.");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Log in" : "Create an account"}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button type="submit" className="p-2 rounded text-white bg-[#1B0D6B]/50 hover:bg-[#1B0D6B]/70">
          {isLogin ? "Log in" : "Create an account"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} className="mt-3 text-sm text-black">
        {isLogin ? "Don't have an account? Create one!" : "Already have an account? Log in!"}
      </button>

      <hr className="my-4" />

      <button onClick={() => signIn("google", { callbackUrl: "http://localhost:3000" })} className="px-4 py-2 bg-blue-500 text-white rounded w-full">
        Logga in med Google
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}
