// Signup page — renders the shared AuthForm in "signup" mode.
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏃</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">4run</h1>
          <p className="mt-1 text-sm text-gray-500">Cria a tua conta gratuita</p>
        </div>

        <AuthForm mode="signup" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tens conta?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Inicia sessão
          </Link>
        </p>
      </div>
    </main>
  );
}
