import AuthForm from "@/components/AuthForm";
import Link from "next/link";

const STATS = [
  { value: "0 → ∞", label: "km para correr" },
  { value: "100%", label: "gratuito" },
  { value: "🏆", label: "desafios em grupo" },
];

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12
                      bg-gradient-to-br from-indigo-900 via-indigo-700 to-brand-600">

        {/* Orbs decorativos */}
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full
                        bg-white/5 animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-20 w-[360px] h-[360px] rounded-full
                        bg-white/5 animate-pulse-slow" style={{ animationDelay: "2s" }} />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">4run</span>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-10">
          <div className="animate-float text-7xl select-none w-fit">🏅</div>

          <div>
            <h2 className="text-5xl font-black text-white leading-tight">
              A tua jornada<br />
              começa aqui.
            </h2>
            <p className="mt-4 text-indigo-200 text-lg leading-relaxed">
              Cria a tua conta gratuita e começa<br />
              a registar as tuas corridas hoje.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center
                           animate-fade-in-up"
                style={{ animationDelay: `${0.1 + i * 0.12}s` }}
              >
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-indigo-200 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-indigo-300/60 text-xs">© 2025 4run</p>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-10">
            <span className="text-5xl animate-float inline-block">🏅</span>
            <h1 className="mt-3 text-3xl font-black text-gray-900">4run</h1>
          </div>

          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Cria a tua conta</h2>
            <p className="mt-1 text-sm text-gray-500">É gratuito e leva menos de 1 minuto</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <AuthForm mode="signup" />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 animate-fade-in-up"
             style={{ animationDelay: "0.2s" }}>
            Já tens conta?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Inicia sessão
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
