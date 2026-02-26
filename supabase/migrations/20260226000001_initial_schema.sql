-- supabase/migrations/20260226000001_initial_schema.sql
-- EuroData initial schema
-- Data quality conventions:
--   source/source_url: NOT NULL — every row must have provenance
--   value: nullable NUMERIC — missing data is NULL, never 0
--   UNIQUE (country_id, metric, year): makes upserts idempotent

CREATE TABLE countries (
  id         SERIAL      PRIMARY KEY,
  code       CHAR(2)     NOT NULL UNIQUE,   -- ISO 3166-1 alpha-2
  name_es    TEXT        NOT NULL,
  name_en    TEXT        NOT NULL,
  flag_emoji TEXT        NOT NULL
);

CREATE TABLE economic_indicators (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,          -- e.g. 'median_salary_real'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                       -- NULL = data not available (never 0 for missing)
  unit        TEXT        NOT NULL,          -- canonical unit, e.g. 'EUR/year'
  source      TEXT        NOT NULL,          -- source name, e.g. 'Banco de España'
  source_url  TEXT        NOT NULL,          -- direct link to source data
  UNIQUE (country_id, metric, year)
);

CREATE TABLE political_data (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,          -- e.g. 'president_annual_salary'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                       -- NULL = data not available
  unit        TEXT        NOT NULL,          -- canonical unit, e.g. 'EUR/year'
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE crime_statistics (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,          -- e.g. 'homicide_rate_per_100k'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                       -- NULL = data not available
  unit        TEXT        NOT NULL,          -- canonical unit: 'rate per 100k inhabitants'
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE migration_data (
  id          BIGSERIAL   PRIMARY KEY,
  country_id  INTEGER     NOT NULL REFERENCES countries(id),
  metric      TEXT        NOT NULL,          -- e.g. 'first_residence_permits'
  year        SMALLINT    NOT NULL,
  value       NUMERIC,                       -- NULL = data not available
  unit        TEXT        NOT NULL,          -- canonical unit: 'count' or 'rate per 100k'
  source      TEXT        NOT NULL,
  source_url  TEXT        NOT NULL,
  UNIQUE (country_id, metric, year)
);

CREATE TABLE sync_log (
  id              BIGSERIAL   PRIMARY KEY,
  source_name     TEXT        NOT NULL,
  source_url      TEXT,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT        NOT NULL CHECK (status IN ('success', 'failure')),
  error_message   TEXT        -- NULL on success
);
