// src/hooks/useEconomyMetric.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { SPAIN_COUNTRY_ID } from '@/lib/constants';
import type { EconomyDataPoint, EconomyMetric } from '@/types/economy';

export function useEconomyMetric(metric: EconomyMetric) {
  const supabase = createClient();

  return useQuery<EconomyDataPoint[]>({
    queryKey: ['economy', metric],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('economic_indicators')
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
    staleTime: 5 * 60 * 1000,  // 5 minutes — economy data doesn't change mid-session
  });
}
