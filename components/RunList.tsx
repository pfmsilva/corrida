"use client";
// RunList — manages the list of runs and the "Add run" flow.
// It holds state locally so inserts/deletes feel instant without a full page reload.

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

  // Local copy of runs so we can optimistically update without a page refresh
  const [runs, setRuns] = useState<Run[]>(initialRuns);
  const [showForm, setShowForm] = useState(false);

  /** Insert a new run and prepend it to the local list */
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

    // Prepend newest run and close the form
    setRuns((prev) =>
      [data as Run, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setShowForm(false);
  };

  /** Delete a run by id and remove it from local state */
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("runs").delete().eq("id", id);
    if (!error) {
      setRuns((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      {/* Show form OR add button */}
      {showForm ? (
        <RunForm onSubmit={handleAddRun} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary w-full mb-4"
        >
          + Log a run
        </button>
      )}

      {/* Run cards */}
      {runs.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">👟</p>
          <p className="text-sm">No runs yet — log your first one!</p>
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
