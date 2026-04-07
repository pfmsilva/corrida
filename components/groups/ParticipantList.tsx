import type { GroupMember, Profile } from "@/types";

export interface ParticipantInfo {
  user_id: string;
  display_name: string;
  joined_at: string; // ISO date string
}

interface ParticipantListProps {
  participants: ParticipantInfo[];
  currentUserId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
}

export default function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center">
        <p className="text-3xl mb-2">👥</p>
        <p className="font-semibold text-gray-700">Sem participantes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {participants.map((p) => {
        const isMe = p.user_id === currentUserId;
        const initial = p.display_name.charAt(0).toUpperCase();

        return (
          <div
            key={p.user_id}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center
                        transition-all duration-200 ${
              isMe
                ? "bg-brand-50 border-brand-100 shadow-sm"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center
                           text-white text-sm font-bold shrink-0
                           ${isMe
                             ? "bg-gradient-to-br from-brand-500 to-indigo-500"
                             : "bg-gradient-to-br from-gray-400 to-gray-500"}`}
            >
              {initial}
            </div>

            {/* Name */}
            <div className="min-w-0 w-full">
              <p className={`font-semibold text-sm truncate ${isMe ? "text-brand-700" : "text-gray-900"}`}>
                {p.display_name}
              </p>
              {isMe && <p className="text-xs text-brand-400">tu</p>}
            </div>

            {/* Joined date */}
            <p className="text-xs text-gray-400">
              desde {formatDate(p.joined_at)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
