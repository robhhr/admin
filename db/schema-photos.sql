CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS photo_collections;
DROP TABLE IF EXISTS photo;

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
  storage_key_large TEXT NOT NULL,
  storage_key_thumb TEXT NOT NULL,
  blurhash TEXT,
  sort_index INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT true,
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

