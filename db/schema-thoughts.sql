CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS thoughts;
DROP TABLE IF EXISTS thought_tags;

CREATE TYPE thought_status AS ENUM ('draft', 'publish', 'archive');

CREATE TABLE IF NOT EXISTS thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  status thought_status DEFAULT 'draft',
  is_pinned BOOLEAN DEFAULT false,
  favorites INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thought_tags (
  thought_id UUID NOT NULL REFERENCES thoughts(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (thought_id, tag_id)
);

