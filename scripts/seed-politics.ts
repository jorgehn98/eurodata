// scripts/seed-politics.ts
// Run: npx tsx scripts/seed-politics.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync } from 'fs';
import { resolve } from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local (Next.js convention)
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role bypasses RLS
);

// Spain country_id = 26 (26th in alphabetically-ordered EU-27 seed: AT=1...ES=26...SE=27)
const SPAIN_COUNTRY_ID = 26;

type SalaryMetricRow = { year: string; metric: string; value: string; unit: string; source: string; source_url: string };
type AdvisorCountRow = { pm_name: string; term_label: string; year_start: string; year_end: string; count: string; source: string; source_url: string };
type PensionRow = { name: string; role: string; pension_annual_eur: string; years_in_office: string; exit_year: string; source: string; source_url: string };
type RevolvingDoorRow = { person_name: string; political_role: string; entity_moved_to: string; year: string; source_url: string };
type MedianSalaryRow = { year: string; value: string; source: string; source_url: string };

function parseValue(raw: string): number | null {
  if (raw === '' || raw === 'null' || raw === 'NULL') return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

async function seedPoliticalMetrics(): Promise<void> {
  const salaryFiles = [
    'data/politics/president-salary.csv',
    'data/politics/minister-salary.csv',
    'data/politics/mp-salary.csv',
  ];

  for (const csvPath of salaryFiles) {
    const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
    const { data, errors } = Papa.parse<SalaryMetricRow>(raw, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,  // always false — we convert explicitly
    });

    if (errors.length > 0) {
      throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
    }

    const rows = data.map((row) => ({
      country_id: SPAIN_COUNTRY_ID,
      metric: row.metric,
      year: parseInt(row.year, 10),
      value: parseValue(row.value),
      unit: row.unit,
      source: row.source,
      source_url: row.source_url,
    }));

    const { error } = await supabase
      .from('political_data')
      .upsert(rows, { onConflict: 'country_id,metric,year' });

    if (error) throw new Error(`Upsert failed for ${csvPath}: ${error.message}`);

    const metrics = [...new Set(rows.map((r) => r.metric))];
    console.log(`✓ Seeded ${rows.length} rows from ${csvPath} for metrics: ${metrics.join(', ')}`);
  }
}

async function seedAdvisorCount(): Promise<void> {
  const csvPath = 'data/politics/advisor-count.csv';
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<AdvisorCountRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  const rows = data.map((row) => ({
    country_id: SPAIN_COUNTRY_ID,
    metric: 'advisor_count',
    year: parseInt(row.year_start, 10),
    value: parseValue(row.count),
    unit: 'count',
    source: `${row.term_label} (${row.year_start}–${row.year_end})`,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('political_data')
    .upsert(rows, { onConflict: 'country_id,metric,year' });

  if (error) throw new Error(`Upsert failed for advisor_count: ${error.message}`);
  console.log(`✓ Seeded ${rows.length} rows for metric: advisor_count`);
}

async function seedPensions(): Promise<void> {
  const csvPath = 'data/politics/pensions.csv';
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<PensionRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  const rows = data.map((row) => ({
    name: row.name,
    role: row.role,
    pension_annual_eur: parseValue(row.pension_annual_eur),
    years_in_office: parseInt(row.years_in_office, 10),
    exit_year: parseInt(row.exit_year, 10),
    source: row.source,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('political_pensions')
    .upsert(rows, { onConflict: 'name,exit_year' });

  if (error) throw new Error(`Upsert failed for political_pensions: ${error.message}`);
  console.log(`✓ Seeded ${rows.length} rows into political_pensions`);
}

async function seedRevolvingDoor(): Promise<void> {
  const csvPath = 'data/politics/revolving-door.csv';
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<RevolvingDoorRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  const rows = data.map((row) => ({
    person_name: row.person_name,
    political_role: row.political_role,
    entity_moved_to: row.entity_moved_to,
    year: parseInt(row.year, 10),
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('revolving_door_cases')
    .upsert(rows, { onConflict: 'person_name,entity_moved_to,year' });

  if (error) throw new Error(`Upsert failed for revolving_door_cases: ${error.message}`);
  console.log(`✓ Seeded ${rows.length} rows into revolving_door_cases`);
}

async function seedMedianSalaryNominal(): Promise<void> {
  const csvPath = 'data/economy/median-salary-nominal.csv';
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<MedianSalaryRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  const rows = data.map((row) => ({
    country_id: SPAIN_COUNTRY_ID,
    metric: 'median_salary_nominal',
    year: parseInt(row.year, 10),
    value: parseValue(row.value),
    unit: 'EUR/year',
    source: row.source,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('economic_indicators')
    .upsert(rows, { onConflict: 'country_id,metric,year' });

  if (error) throw new Error(`Upsert failed for median_salary_nominal: ${error.message}`);
  console.log(`✓ Seeded ${rows.length} rows for metric: median_salary_nominal`);
}

async function main() {
  console.log('Seeding political data...\n');
  await seedPoliticalMetrics();
  await seedAdvisorCount();
  await seedPensions();
  await seedRevolvingDoor();
  await seedMedianSalaryNominal();
  console.log('\n✓ All political data seeded successfully');
}

main().catch((err) => { console.error(err); process.exit(1); });
