"use client";
// AuthForm handles both login and signup using Supabase email/password auth.
// It's a Client Component because it manages form state and calls browser Supabase.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Shown after successful signup to prompt email confirmation
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // After email confirmation Supabase redirects to this URL
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg(
          "Conta criada! Verifica o teu e-mail e clica no link de confirmação."
        );
      }
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Refresh the router so the middleware runs and sees the new session cookie
        router.refresh();
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="label">
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
        />
        {mode === "signup" && (
          <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres</p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Success banner */}
      {successMsg && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          {successMsg}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading
          ? "A aguardar…"
          : mode === "login"
          ? "Iniciar sessão"
          : "Criar conta"}
      </button>
    </form>
  );
}
