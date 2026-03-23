-- ── In-app notification system ─────────────────────────────────────────────
-- Run this migration once against your Supabase project.

CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    text        NOT NULL,                -- Clerk user ID (recipient)
  type       text        NOT NULL
               CHECK (type IN ('new_run', 'overtake', 'goal_80', 'goal_90')),
  group_id   uuid        REFERENCES groups(id) ON DELETE CASCADE,
  message    text        NOT NULL,
  is_read    boolean     NOT NULL DEFAULT false,
  data       jsonb,                               -- optional extra payload
  created_at timestamptz DEFAULT now()
);

-- Efficient lookup for unread badge count and dropdown
CREATE INDEX IF NOT EXISTS notifications_user_read_idx
  ON notifications(user_id, is_read, created_at DESC);
