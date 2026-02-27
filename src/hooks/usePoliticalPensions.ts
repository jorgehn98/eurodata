// src/hooks/usePoliticalPensions.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { PoliticalPension } from '@/types/politics';

export function usePoliticalPensions() {
  const supabase = createClient();

  return useQuery<PoliticalPension[]>({
    queryKey: ['politics', 'pensions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_pensions')
        .select('id, name, role, pension_annual_eur, years_in_office, exit_year, source, source_url')
        .order('exit_year', { ascending: false });

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row.id as number,
        name: row.name as string,
        role: row.role as string,
        pension_annual_eur: Number(row.pension_annual_eur),
        years_in_office: row.years_in_office as number,
        exit_year: row.exit_year as number,
        source: row.source as string,
        source_url: row.source_url as string,
      }));
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes — pension data doesn't change mid-session
  });
}
