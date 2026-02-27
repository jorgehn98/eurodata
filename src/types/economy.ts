// src/types/economy.ts
// Data shape returned by useEconomyMetric hook.
// Matches the economic_indicators table columns selected in the query.

export type EconomyDataPoint = {
  year: number;
  value: number | null;  // null for years with no data — chart shows gap
  source: string;
  source_url: string;
};

// All economy metric strings — matches DB values seeded in plan 02-01.
// Used to type-check metric prop in hook and chart components.
export const ECONOMY_METRICS = [
  'median_salary_real',
  'fiscal_burden_pct',
  'housing_salary_ratio',
  'cpi_food_index',
  'cpi_energy_index',
  'cpi_transport_index',
  'cpi_housing_index',
  'poverty_risk_pct',
] as const;

export type EconomyMetric = typeof ECONOMY_METRICS[number];
