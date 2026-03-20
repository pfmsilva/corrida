"use client";
// RunInsights — gera e exibe insights de coaching a partir dos dados locais.
// Não faz chamadas a APIs externas: toda a lógica está em lib/insights.ts.

import { useMemo } from "react";
import { generateInsights } from "@/lib/insights";
import type { Run } from "@/types";

interface RunInsightsProps {
  runs: Run[];
}

export default function RunInsights({ runs }: RunInsightsProps) {
  // Calcular insights apenas quando a lista de corridas mudar
  const insights = useMemo(() => generateInsights(runs), [runs]);

  return (
    <div className="card space-y-3">
      {/* Cabeçalho */}
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <span>✨</span> Análise do Treinador
      </h3>

      {/* Duas observações — fundo indigo */}
      {insights.observations.map((obs, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-brand-50 rounded-xl p-3"
        >
          <span className="text-xl leading-none mt-0.5">{obs.emoji}</span>
          <p className="text-sm text-gray-700 leading-snug">{obs.text}</p>
        </div>
      ))}

      {/* Sugestão — fundo laranja */}
      <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-3">
        <span className="text-xl leading-none mt-0.5">
          {insights.suggestion.emoji}
        </span>
        <p className="text-sm text-gray-700 leading-snug">
          {insights.suggestion.text}
        </p>
      </div>
    </div>
  );
}
