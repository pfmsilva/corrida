"use client";

import { useMemo } from "react";
import { generateInsights } from "@/lib/insights";
import type { Run } from "@/types";

export default function RunInsights({ runs }: { runs: Run[] }) {
  const insights = useMemo(() => generateInsights(runs), [runs]);

  return (
    <div className="space-y-3">
      {insights.observations.map((obs, i) => (
        <div key={i}
          className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100
                     shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center
                          text-xl shrink-0">
            {obs.emoji}
          </div>
          <div className="pt-0.5">
            <p className="text-sm text-gray-700 leading-snug">{obs.text}</p>
          </div>
        </div>
      ))}

      <div className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-amber-50
                      rounded-2xl border border-orange-100 p-4
                      hover:shadow-md transition-all duration-200">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center
                        text-xl shrink-0">
          {insights.suggestion.emoji}
        </div>
        <div className="pt-0.5">
          <p className="text-xs font-semibold text-orange-500 mb-0.5 uppercase tracking-wide">
            Sugestão
          </p>
          <p className="text-sm text-gray-700 leading-snug">{insights.suggestion.text}</p>
        </div>
      </div>
    </div>
  );
}
