"use client";
import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";

interface SupabaseUser {
  id: string;
  email: string | null;
  [key: string]: unknown;
}

export default function LoginBox() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) setMessage(error.message);
        else router.push("/main");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMessage(error.message);
        else setMessage("Konto skapat! Kolla mailen för verifiering.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      if (!json.error) setUser(json.user);
    };

    fetchUser();
  }, []);

  if (user) return <p>Välkommen, {user.email}!</p>;

  return (
    <div
      className="border p-6 rounded shadow-md w-80 
                bg-white/30 backdrop-blur-md border-white/30"
    >
      <h2 className="text-xl font-bold mb-4 ">
        {isLogin ? "Logga in" : "Skapa konto"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="p-2 rounded text-white 
             bg-[#1B0D6B]/50 backdrop-blur-sm 
             border border-white/30 hover:bg-[#1B0D6B]/70 transition"
        >
          {isLogin ? "Logga in" : "Skapa konto"}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-3 text-sm text-black"
      >
        {isLogin
          ? "Har du inget konto? Skapa ett"
          : "Har du redan konto? Logga in"}
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}
