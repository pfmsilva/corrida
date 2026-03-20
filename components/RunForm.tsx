"use client";
// RunForm — inline form for logging a new run.
// Pace is calculated on the fly as the user types distance/duration.

import { useState } from "react";
import { formatPace, todayISO } from "@/lib/utils";
import type { RunFormValues } from "@/types";

interface RunFormProps {
  onSubmit: (values: RunFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function RunForm({ onSubmit, onCancel }: RunFormProps) {
  const [values, setValues] = useState<RunFormValues>({
    date: todayISO(),
    distance_km: "",
    duration_min: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live pace preview whenever distance + duration are present
  const livePace =
    parseFloat(values.distance_km) > 0 && parseFloat(values.duration_min) > 0
      ? parseFloat(values.duration_min) / parseFloat(values.distance_km)
      : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card border-brand-200 space-y-4 mb-4"
    >
      <h3 className="font-semibold text-gray-800">Registar nova corrida</h3>

      {/* Date */}
      <div>
        <label htmlFor="date" className="label">
          Data
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          max={todayISO()}
          value={values.date}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Distance + Duration side by side on larger screens */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="distance_km" className="label">
            Distância (km)
          </label>
          <input
            id="distance_km"
            name="distance_km"
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="5.00"
            value={values.distance_km}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="duration_min" className="label">
            Duração (min)
          </label>
          <input
            id="duration_min"
            name="duration_min"
            type="number"
            required
            min="0.1"
            step="0.1"
            placeholder="25"
            value={values.duration_min}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Live pace preview */}
      {livePace !== null && (
        <p className="text-sm text-center text-accent-500 font-semibold bg-orange-50 rounded-lg py-2">
          Ritmo: {formatPace(livePace)}
        </p>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Notas{" "}
          <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Como correu? Algum destaque?"
          value={values.notes}
          onChange={handleChange}
          className="input resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "A guardar…" : "Guardar corrida"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
}
