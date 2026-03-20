import AuthForm from "@/components/AuthForm";
import Link from "next/link";

const FEATURES = [
  { icon: "📏", text: "Regista distância, tempo e ritmo" },
  { icon: "📈", text: "Gráficos de evolução em tempo real" },
  { icon: "👥", text: "Desafios em grupo com os teus amigos" },
  { icon: "✨", text: "Análise personalizada do teu treino" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — branding ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12
                      bg-gradient-to-br from-brand-600 via-indigo-700 to-indigo-900">

        {/* Orbs decorativos de fundo */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full
                        bg-white/5 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-20 w-[360px] h-[360px] rounded-full
                        bg-white/5 animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full
                        bg-indigo-400/10 animate-pulse-slow" style={{ animationDelay: "1s" }} />

        {/* Logo */}
        <div className="relative z-10">
          <span className="text-3xl font-black text-white tracking-tight">4run</span>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-10">
          {/* Runner animado */}
          <div className="animate-float text-7xl select-none w-fit">🏃</div>

          <div>
            <h2 className="text-5xl font-black text-white leading-tight">
              Corre mais.<br />
              Evolui sempre.
            </h2>
            <p className="mt-4 text-indigo-200 text-lg leading-relaxed">
              Regista cada corrida, acompanha o teu progresso<br />
              e desafia os teus amigos.
            </p>
          </div>

          {/* Feature pills com entrada animada */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm
                           rounded-2xl px-4 py-3 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + i * 0.12}s` }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-white text-sm font-medium">{f.text}</span>
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
            <span className="text-5xl animate-float inline-block">🏃</span>
            <h1 className="mt-3 text-3xl font-black text-gray-900">4run</h1>
          </div>

          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-gray-500">Inicia sessão na tua conta</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <AuthForm mode="login" />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 animate-fade-in-up"
             style={{ animationDelay: "0.2s" }}>
            Ainda não tens conta?{" "}
            <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
              Regista-te
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
