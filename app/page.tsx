import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const FEATURES = [
  {
    icon: "📏",
    title: "Registo preciso",
    desc: "Distância, tempo e ritmo calculados automaticamente em cada corrida.",
  },
  {
    icon: "📈",
    title: "Evolução em tempo real",
    desc: "Gráficos interativos que mostram o teu progresso ao longo do tempo.",
  },
  {
    icon: "👥",
    title: "Desafios em grupo",
    desc: "Cria desafios com amigos, define objetivos coletivos e celebra juntos.",
  },
  {
    icon: "✨",
    title: "Análise com IA",
    desc: "O teu treinador virtual analisa os teus treinos e sugere melhorias.",
  },
];

const STATS = [
  { value: "100%", label: "Gratuito" },
  { value: "∞", label: "Corridas" },
  { value: "🏆", label: "Desafios" },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Navbar ── */}
      <header className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏃</span>
          <span className="text-xl font-black tracking-tight">4run</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-300 hover:text-white
                       px-4 py-2 rounded-xl transition-colors duration-200"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-white text-gray-900
                       px-4 py-2 rounded-xl hover:bg-gray-100
                       transition-colors duration-200"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-6 text-center">

        {/* Orbs de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px]
                        rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px]
                        rounded-full bg-indigo-500/10 blur-3xl pointer-events-none
                        animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px]
                        rounded-full bg-brand-600/10 blur-3xl pointer-events-none
                        animate-pulse-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-3xl space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10
                          rounded-full px-4 py-1.5 text-sm text-gray-300 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Gratuito. Sem cartão. Começa agora.
          </div>

          {/* Runner */}
          <div className="text-7xl animate-float select-none">🏃</div>

          {/* Headline */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight">
              Corre mais.
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-indigo-400
                               bg-clip-text text-transparent">
                Evolui sempre.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
              Regista cada corrida, acompanha o teu progresso
              e desafia os teus amigos — tudo num só lugar.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3
                          animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2
                         bg-gradient-to-r from-brand-600 to-indigo-500
                         hover:from-brand-700 hover:to-indigo-600
                         text-white font-semibold text-base
                         px-8 py-3.5 rounded-2xl
                         shadow-lg shadow-brand-600/30
                         transition-all duration-200 hover:shadow-brand-600/50
                         hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Começar gratuitamente →
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center
                         text-gray-300 hover:text-white font-medium text-base
                         px-8 py-3.5 rounded-2xl border border-white/10
                         hover:border-white/20 hover:bg-white/5
                         transition-all duration-200"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 pt-4
                          animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                        items-center gap-1 text-gray-600 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-gray-600" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-900/50 border-t border-white/5 px-6 py-24">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl font-black">
              Tudo o que precisas para correr melhor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white/5 hover:bg-white/8 border border-white/5
                           hover:border-brand-500/30 rounded-2xl p-6 space-y-3
                           transition-all duration-300 hover:-translate-y-1
                           animate-fade-in-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-5xl animate-float">🏅</div>
          <h2 className="text-3xl sm:text-4xl font-black">
            Pronto para começar?
          </h2>
          <p className="text-gray-400">
            Junta-te a outros corredores e começa a registar as tuas corridas hoje.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2
                       bg-gradient-to-r from-brand-600 to-indigo-500
                       hover:from-brand-700 hover:to-indigo-600
                       text-white font-semibold text-base
                       px-8 py-3.5 rounded-2xl
                       shadow-lg shadow-brand-600/30
                       transition-all duration-200 hover:-translate-y-0.5"
          >
            Criar conta gratuita →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <span>🏃</span>
            <span className="font-bold text-sm">4run</span>
          </div>
          <p className="text-xs text-gray-600">© 2025 4run. Feito com 🖤</p>
        </div>
      </footer>

    </div>
  );
}
