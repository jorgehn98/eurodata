-- Phase 3: Political Class Section — new entity tables
-- political_data table (existing) handles salary time-series and advisor_count
-- These two new tables handle entity records that don't fit the generic metric schema

CREATE TABLE political_pensions (
  id                  BIGSERIAL    PRIMARY KEY,
  name                TEXT         NOT NULL,
  role                TEXT         NOT NULL,
  pension_annual_eur  NUMERIC      NOT NULL,
  years_in_office     SMALLINT     NOT NULL,
  exit_year           SMALLINT     NOT NULL,
  source              TEXT         NOT NULL,
  source_url          TEXT         NOT NULL,
  CONSTRAINT political_pensions_name_exit_year_key UNIQUE (name, exit_year)
);

CREATE TABLE revolving_door_cases (
  id              BIGSERIAL   PRIMARY KEY,
  person_name     TEXT        NOT NULL,
  political_role  TEXT        NOT NULL,
  entity_moved_to TEXT        NOT NULL,
  year            SMALLINT    NOT NULL,
  source_url      TEXT        NOT NULL,
  CONSTRAINT revolving_door_cases_person_entity_year_key UNIQUE (person_name, entity_moved_to, year)
);
