"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  bg: "#080D14",
  bgCard: "#0F1622",
  bgElevated: "#162032",
  border: "#1E2D45",
  gold: "#C8A84B",
  teal: "#00C2A3",
  red: "#F06060",
  text: "#E8EDF5",
  textMid: "#7A90B0",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Create a row in public.users linked to the auth user
        await supabase.from("users").insert({
          supabase_auth_id: data.user.id,
          email: data.user.email ?? null,
        });
        setMessage("Check your email to confirm your account, then log in.");
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{ backgroundColor: C.bg, color: C.text }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="w-full max-w-md rounded-2xl border p-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            style={{ backgroundColor: C.gold }}
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black"
          >
            W
          </div>
          <h1
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: C.text }}
            className="text-2xl font-bold"
          >
            Wealth & Wellness Hub
          </h1>
        </div>

        {/* Tab toggle */}
        <div
          style={{ backgroundColor: C.bgElevated, borderColor: C.border }}
          className="flex rounded-lg border mb-6 p-1"
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setMessage(null); }}
              style={{
                backgroundColor: mode === m ? C.gold : "transparent",
                color: mode === m ? "#000" : C.textMid,
              }}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize"
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ color: C.textMid }} className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
              className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[#C8A84B]"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ color: C.textMid }} className="text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ backgroundColor: C.bgElevated, borderColor: C.border, color: C.text }}
              className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[#C8A84B]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ color: C.red }} className="text-sm">{error}</p>
          )}
          {message && (
            <p style={{ color: C.teal }} className="text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: C.gold }}
            className="mt-2 rounded-lg py-2.5 font-semibold text-black disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
