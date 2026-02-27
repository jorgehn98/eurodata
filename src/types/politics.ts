// src/types/politics.ts
// Data shapes for the Political Class Section.
// Matches DB tables: political_data, political_pensions, revolving_door_cases.

// Returned by usePoliticalMetric — matches political_data columns
export type PoliticalDataPoint = {
  year: number;
  value: number | null;  // null = gap year; chart shows break, not zero
  source: string;
  source_url: string;
};

// All metric strings seeded in political_data for Spain.
// Salary metrics stored in two variants: nominal (current EUR) and real (2015-adjusted EUR).
// Compile-time error if metric string is mistyped.
export const POLITICAL_METRICS = [
  'president_salary_nominal',
  'president_salary_real',
  'minister_salary_nominal',
  'minister_salary_real',
  'mp_salary_nominal',
  'mp_salary_real',
  'advisor_count',
] as const;

export type PoliticalMetric = typeof POLITICAL_METRICS[number];

// Returned by usePoliticalPensions — matches political_pensions columns
export type PoliticalPension = {
  id: number;
  name: string;
  role: string;
  pension_annual_eur: number;
  years_in_office: number;
  exit_year: number;
  source: string;
  source_url: string;
};

// Returned by useRevolvingDoorCases — matches revolving_door_cases columns
export type RevolvingDoorCase = {
  id: number;
  person_name: string;
  political_role: string;
  entity_moved_to: string;
  year: number;
  source_url: string;
};
