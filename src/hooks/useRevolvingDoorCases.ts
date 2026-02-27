// src/hooks/useRevolvingDoorCases.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { RevolvingDoorCase } from '@/types/politics';

export function useRevolvingDoorCases() {
  const supabase = createClient();

  return useQuery<RevolvingDoorCase[]>({
    queryKey: ['politics', 'revolving-door'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revolving_door_cases')
        .select('id, person_name, political_role, entity_moved_to, year, source_url')
        .order('year', { ascending: false });

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        id: row.id as number,
        person_name: row.person_name as string,
        political_role: row.political_role as string,
        entity_moved_to: row.entity_moved_to as string,
        year: row.year as number,
        source_url: row.source_url as string,
      }));
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes — revolving door data doesn't change mid-session
  });
}
