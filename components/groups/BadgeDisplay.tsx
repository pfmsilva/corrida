import type { Badge } from "@/types";

interface BadgeDisplayProps {
  badges: Badge[];
  /** Show full label + description tooltip. Defaults to emoji-only. */
  showLabels?: boolean;
}

export default function BadgeDisplay({ badges, showLabels = false }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  if (showLabels) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => (
          <span
            key={b.id}
            title={b.description}
            className="inline-flex items-center gap-1.5 px-2.5 py-1
                       bg-brand-50 border border-brand-100 rounded-lg
                       text-xs font-semibold text-brand-700 whitespace-nowrap"
          >
            <span>{b.emoji}</span>
            {b.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-0.5">
      {badges.map((b) => (
        <span
          key={b.id}
          title={`${b.label}: ${b.description}`}
          className="text-sm leading-none cursor-default"
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
