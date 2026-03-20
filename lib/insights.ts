// =========================================================
// Local insights engine — generates coaching observations
// from run data without any external API call.
// =========================================================
import { formatPace } from "@/lib/utils";
import type { Run } from "@/types";

export interface Insight {
  emoji: string;
  text: string;
}

export interface InsightsData {
  observations: [Insight, Insight];
  suggestion: Insight;
}

export function generateInsights(runs: Run[]): InsightsData {
  // Sort oldest → newest for trend analysis
  const sorted = [...runs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalKm = runs.reduce((s, r) => s + Number(r.distance_km), 0);
  const avgPace =
    runs.reduce((s, r) => s + Number(r.pace_min_per_km), 0) / runs.length;
  const bestPace = Math.min(...runs.map((r) => Number(r.pace_min_per_km)));
  const longestRun = Math.max(...runs.map((r) => Number(r.distance_km)));

  // ── Observation 1: pace trend ───────────────────────────────────────────
  let obs1: Insight;

  if (sorted.length === 1) {
    obs1 = {
      emoji: "🏁",
      text: `Excelente primeira corrida! Percorreste ${sorted[0].distance_km} km a um ritmo de ${formatPace(Number(sorted[0].pace_min_per_km))} — boa estreia.`,
    };
  } else {
    // Compare average pace of the first half vs second half of all runs
    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half);
    const secondHalf = sorted.slice(half);

    const avgFirst =
      firstHalf.reduce((s, r) => s + Number(r.pace_min_per_km), 0) /
      firstHalf.length;
    const avgSecond =
      secondHalf.reduce((s, r) => s + Number(r.pace_min_per_km), 0) /
      secondHalf.length;

    // Positive = improvement (lower pace = faster)
    const improvePct = ((avgFirst - avgSecond) / avgFirst) * 100;

    if (improvePct > 3) {
      obs1 = {
        emoji: "📈",
        text: `O teu ritmo melhorou ${improvePct.toFixed(1)}% ao longo das corridas. Estás cada vez mais rápido — continua!`,
      };
    } else if (improvePct < -3) {
      obs1 = {
        emoji: "💪",
        text: `O teu ritmo recente é ligeiramente mais lento, mas continuas a acumular quilómetros. O volume constrói a base — a velocidade virá a seguir.`,
      };
    } else {
      obs1 = {
        emoji: "⚡",
        text: `Mantiveste um ritmo médio muito consistente de ${formatPace(avgPace)} nas tuas corridas — excelente disciplina.`,
      };
    }
  }

  // ── Observation 2: volume or achievement ───────────────────────────────
  let obs2: Insight;

  if (totalKm >= 100) {
    obs2 = {
      emoji: "🏅",
      text: `Percorreste um total de ${totalKm.toFixed(1)} km — é uma conquista assinalável. A tua corrida mais longa foi de ${longestRun.toFixed(1)} km.`,
    };
  } else if (runs.length >= 5) {
    // Calculate rough runs per week using date range
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const weeks =
      Math.max(
        1,
        (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
    const runsPerWeek = runs.length / weeks;

    obs2 = {
      emoji: "📅",
      text: `Estás a fazer uma média de ${runsPerWeek.toFixed(1)} corridas por semana. O teu melhor ritmo até agora é ${formatPace(bestPace)} — um recorde pessoal a bater!`,
    };
  } else {
    obs2 = {
      emoji: "🚀",
      text: `Já percorreste ${totalKm.toFixed(1)} km em ${runs.length} corrida${runs.length > 1 ? "s" : ""}. O teu melhor ritmo é ${formatPace(bestPace)} — consegues superar?`,
    };
  }

  // ── Suggestion: one actionable tip ────────────────────────────────────
  let suggestion: Insight;

  // Check if all runs are roughly the same distance (low variance)
  const avgDist = totalKm / runs.length;
  const distVariance =
    runs.reduce((s, r) => s + Math.pow(Number(r.distance_km) - avgDist, 2), 0) /
    runs.length;

  if (runs.length < 3) {
    suggestion = {
      emoji: "💡",
      text: "Tenta correr pelo menos 3 vezes por semana para construir uma base sólida e ver progressos reais.",
    };
  } else if (distVariance < 0.5) {
    // All runs are similar distance → suggest a long run day
    suggestion = {
      emoji: "📏",
      text: `Todas as tuas corridas têm cerca de ${avgDist.toFixed(1)} km. Experimenta adicionar uma corrida mais longa por semana — aumenta 10% de cada vez — para desenvolver a resistência.`,
    };
  } else if (avgPace > 7) {
    // Slower runner → suggest easy intervals
    suggestion = {
      emoji: "🎯",
      text: "Adiciona uma sessão de intervalos por semana: alterna 1 min rápido / 2 min fácil durante 20 minutos. É a forma mais rápida de melhorar o ritmo.",
    };
  } else {
    // Good pace → suggest rest / recovery
    suggestion = {
      emoji: "😴",
      text: "Garante pelo menos um dia completo de descanso entre treinos intensos. É na recuperação que a forma física é realmente construída.",
    };
  }

  return { observations: [obs1, obs2], suggestion };
}
