// Login page — renders the shared AuthForm in "login" mode.
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏃</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Corrida</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* The form handles its own state and Supabase calls */}
        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
