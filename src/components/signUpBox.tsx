"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { signIn } from "next-auth/react";

export default function SignupBox() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setStatus("idle");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      setStatus("error");
      return;
    }
    setMessage("Account created. Check your email for verification.");
    setStatus("success");
    // router.push("/main");
  };

  return (
    <div className="border p-6 rounded shadow-md w-80 bg-white/30 backdrop-blur-md border-white/30">
      

      <h2 className="text-xl font-bold mb-4">Create an account</h2>

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
        <button
          type="submit"
          className="p-2 rounded text-white bg-[#1B0D6B]/50 hover:bg-[#1B0D6B]/70"
        >
          Create account
        </button>
      </form>

      <hr className="my-4" />

      <button
        onClick={() => signIn("google", { callbackUrl: "/main" })}
        className="px-4 py-2 bg-blue-500 text-white rounded w-full"
      >
        Sign up with Google
      </button>

      <p className="mt-3 text-sm text-black">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 underline font-semibold"
        >
          Log in
        </Link>
      </p>

      {message && (
        <p
          className={`mt-2 ${
            status === "success" ? "text-green-600" : "text-red-500"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
