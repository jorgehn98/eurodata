// src/hooks/usePoliticalMetric.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SPAIN_COUNTRY_ID } from '@/lib/constants';
import type { PoliticalDataPoint, PoliticalMetric } from '@/types/politics';

export function usePoliticalMetric(metric: PoliticalMetric) {
  const supabase = createClient();

  return useQuery<PoliticalDataPoint[]>({
    queryKey: ['politics', metric],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_data')
        .select('year, value, source, source_url')
        .eq('country_id', SPAIN_COUNTRY_ID)
        .eq('metric', metric)
        .order('year', { ascending: true });

      if (error) throw new Error(error.message);

      // Supabase returns value as string | null from NUMERIC column.
      // Cast to number | null explicitly.
      return (data ?? []).map((row) => ({
        year: row.year as number,
        value: row.value !== null ? Number(row.value) : null,
        source: row.source as string,
        source_url: row.source_url as string,
      }));
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes — political data doesn't change mid-session
  });
}
