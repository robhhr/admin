CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS notes;

CREATE TYPE note_status AS ENUM ('draft', 'publish', 'archive');

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  status note_status DEFAULT 'draft',
  is_pinned BOOLEAN DEFAULT false,
  favorites INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

