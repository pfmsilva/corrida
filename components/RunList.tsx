"use client";

import { useState } from "react";
import RunCard from "./RunCard";
import RunForm from "./RunForm";
import type { Run, RunFormValues } from "@/types";

interface RunListProps {
  initialRuns: Run[];
  userId: string;
}

export default function RunList({ initialRuns, userId: _userId }: RunListProps) {
  const [runs, setRuns] = useState<Run[]>(initialRuns);
  const [showForm, setShowForm] = useState(false);

  const handleAddRun = async (values: RunFormValues) => {
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: values.date,
        distance_km: values.distance_km,
        duration_min: values.duration_min,
        notes: values.notes || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data?.error ?? "Erro ao registar corrida");
    }

    const data: Run = await res.json();
    setRuns((prev) =>
      [data, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/runs/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setRuns((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      {showForm ? (
        <RunForm onSubmit={handleAddRun} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full mb-5">
          + Registar corrida
        </button>
      )}

      {runs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-5xl mb-3">👟</p>
          <p className="font-semibold text-gray-700">Ainda sem corridas</p>
          <p className="text-sm text-gray-400 mt-1">Regista a tua primeira corrida para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
