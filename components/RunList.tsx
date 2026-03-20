"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RunCard from "./RunCard";
import RunForm from "./RunForm";
import type { Run, RunFormValues } from "@/types";

interface RunListProps {
  initialRuns: Run[];
  userId: string;
}

export default function RunList({ initialRuns, userId }: RunListProps) {
  const supabase = createClient();
  const [runs, setRuns] = useState<Run[]>(initialRuns);
  const [showForm, setShowForm] = useState(false);

  const handleAddRun = async (values: RunFormValues) => {
    const { data, error } = await supabase
      .from("runs")
      .insert({
        user_id: userId,
        date: values.date,
        distance_km: parseFloat(values.distance_km),
        duration_min: parseFloat(values.duration_min),
        notes: values.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    setRuns((prev) =>
      [data as Run, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("runs").delete().eq("id", id);
    if (!error) setRuns((prev) => prev.filter((r) => r.id !== id));
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
