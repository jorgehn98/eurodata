// scripts/seed-economy.ts
// Run: npx tsx scripts/seed-economy.ts
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
// Verify: supabase dashboard > Table Editor > countries > filter code='ES'
const SPAIN_COUNTRY_ID = 26;

type SingleMetricRow = { year: string; value: string; source: string; source_url: string };
type MultiMetricRow = { year: string; metric: string; value: string; source: string; source_url: string };

function parseValue(raw: string): number | null {
  if (raw === '' || raw === 'null' || raw === 'NULL') return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

async function seedSingleMetric(
  csvPath: string,
  metric: string,
  unit: string
): Promise<void> {
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<SingleMetricRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,  // always false — we convert explicitly
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  const rows = data.map((row) => ({
    country_id: SPAIN_COUNTRY_ID,
    metric,
    year: parseInt(row.year, 10),
    value: parseValue(row.value),
    unit,
    source: row.source,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('economic_indicators')
    .upsert(rows, { onConflict: 'country_id,metric,year' });

  if (error) throw new Error(`Upsert failed for ${metric}: ${error.message}`);
  console.log(`✓ Seeded ${rows.length} rows for metric: ${metric}`);
}

async function seedCpiCategories(): Promise<void> {
  const csvPath = 'data/economy/cpi-categories.csv';
  const raw = readFileSync(resolve(process.cwd(), csvPath), 'utf8');
  const { data, errors } = Papa.parse<MultiMetricRow>(raw, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parse errors in ${csvPath}: ${JSON.stringify(errors)}`);
  }

  // Unit for all CPI metrics
  const UNIT = 'index';
  const rows = data.map((row) => ({
    country_id: SPAIN_COUNTRY_ID,
    metric: row.metric,
    year: parseInt(row.year, 10),
    value: parseValue(row.value),
    unit: UNIT,
    source: row.source,
    source_url: row.source_url,
  }));

  const { error } = await supabase
    .from('economic_indicators')
    .upsert(rows, { onConflict: 'country_id,metric,year' });

  if (error) throw new Error(`Upsert failed for CPI categories: ${error.message}`);

  // Count distinct metrics
  const metrics = [...new Set(rows.map((r) => r.metric))];
  console.log(`✓ Seeded ${rows.length} rows for CPI metrics: ${metrics.join(', ')}`);
}

(async () => {
  console.log('Seeding economy data...\n');

  await seedSingleMetric(
    'data/economy/median-salary.csv',
    'median_salary_real',
    'EUR/year'
  );
  await seedSingleMetric(
    'data/economy/fiscal-burden.csv',
    'fiscal_burden_pct',
    '%'
  );
  await seedSingleMetric(
    'data/economy/housing-ratio.csv',
    'housing_salary_ratio',
    'ratio'
  );
  await seedCpiCategories();
  await seedSingleMetric(
    'data/economy/poverty-risk.csv',
    'poverty_risk_pct',
    '%'
  );

  console.log('\nSeed complete. Run again to verify idempotency (should produce same result).');
})();
