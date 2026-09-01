CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS photo_collections;

CREATE TABLE photo_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  location        TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
  storage_prefix   TEXT NOT NULL, -- 'photos/<id>'; object keys are <prefix>/<width>.<avif|jpg>
  width            INTEGER NOT NULL, -- intrinsic dims of the largest derivative
  height           INTEGER NOT NULL,
  widths           INTEGER[] NOT NULL DEFAULT '{640,1280,2048}', -- widths actually generated (small RAW previews cap out)
  placeholder      TEXT, -- tiny webp data URI shown while the real image loads
  caption          TEXT,
  sort_index INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  favorites        INTEGER NOT NULL DEFAULT 0,
  taken_at         TIMESTAMPTZ,
  focal_length_mm  NUMERIC,
  aperture         NUMERIC,
  shutter_speed    TEXT,
  iso              INTEGER,
  camera_model     TEXT,
  lens_model       TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX photos_collection_id_idx
  ON photos (collection_id, sort_index);
