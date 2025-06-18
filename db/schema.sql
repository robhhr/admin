CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- drop in dependency order
DROP TABLE IF EXISTS two_factor_codes;
DROP TABLE IF EXISTS fingerprints;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS projects;

-- roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('avatar'), ('admin'), ('viewer');

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) NOT NULL UNIQUE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- fingerprints
CREATE TABLE fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fingerprint JSONB,
  hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- 2FA
CREATE TABLE two_factor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expired BOOLEAN DEFAULT false,
  hashed_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  slug TEXT NOT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

