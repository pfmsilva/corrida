// POST /api/insights
// Accepts the user's run history and returns AI-generated coaching insights
// powered by claude-opus-4-6 with adaptive thinking.
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import type { Run } from "@/types";

// Initialise the Anthropic client once (reused across requests in the same worker)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  // Verificar se a chave API está configurada
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY não está definida em .env.local");
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor" },
      { status: 500 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { runs } = (await request.json()) as { runs: Run[] };

    if (!runs || runs.length === 0) {
      return NextResponse.json({ error: "No runs provided" }, { status: 400 });
    }

    // ── Build aggregate stats for the prompt ──────────────────────────────
    const totalKm = runs.reduce((s, r) => s + Number(r.distance_km), 0);
    const avgPace =
      runs.reduce((s, r) => s + Number(r.pace_min_per_km), 0) / runs.length;
    const bestPace = Math.min(...runs.map((r) => Number(r.pace_min_per_km)));
    const longestRun = Math.max(...runs.map((r) => Number(r.distance_km)));

    // Include only the most recent 20 runs to keep the prompt concise
    const recentRuns = [...runs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map(
        (r) =>
          `• ${r.date}: ${r.distance_km} km in ${r.duration_min} min (${Number(r.pace_min_per_km).toFixed(2)} min/km)`
      )
      .join("\n");

    const prompt = `You are an encouraging running coach analysing a runner's training log.

Runner summary:
- Total runs: ${runs.length}
- Total distance: ${totalKm.toFixed(1)} km
- Average pace: ${avgPace.toFixed(2)} min/km
- Best pace: ${bestPace.toFixed(2)} min/km
- Longest run: ${longestRun.toFixed(1)} km

Recent runs (newest first):
${recentRuns}

Generate exactly:
1. Two specific observations about performance patterns or achievements — mention actual numbers.
2. One concrete, actionable improvement suggestion.

Rules:
- Keep every item to 1–2 sentences.
- Be encouraging and motivational.
- Pick fitting emojis.

Respond with ONLY this JSON (no markdown, no explanation):
{
  "observations": [
    { "emoji": "...", "text": "..." },
    { "emoji": "...", "text": "..." }
  ],
  "suggestion": { "emoji": "...", "text": "..." }
}`;

    // ── Call claude-opus-4-6 with adaptive thinking ───────────────────────
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      // Adaptive thinking lets the model decide how much reasoning to apply
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    // The response may contain a thinking block followed by a text block.
    // We only need the text block which holds the JSON.
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text block in Claude response");
    }

    // Parse and validate the JSON before returning it
    const insights = JSON.parse(textBlock.text) as {
      observations: Array<{ emoji: string; text: string }>;
      suggestion: { emoji: string; text: string };
    };

    return NextResponse.json(insights);
  } catch (error) {
    // Mostrar o erro detalhado nos logs do servidor para facilitar o diagnóstico
    const message = error instanceof Error ? error.message : String(error);
    console.error("Insights API error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
