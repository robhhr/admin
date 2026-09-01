-- adds per-photo like counter (same mechanism as thoughts/notes favorites)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS favorites INTEGER NOT NULL DEFAULT 0;
