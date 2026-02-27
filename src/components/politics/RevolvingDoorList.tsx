'use client';

import { useRevolvingDoorCases } from '@/hooks/useRevolvingDoorCases';
import { PoliticsChartSkeleton } from '@/components/politics/PoliticsChartSkeleton';

type Labels = {
  sectionTitle: string;
  fields: {
    role: string;
    movedTo: string;
    year: string;
    source: string;
  };
  sourceLabel: string;
};

type Props = { labels: Labels };

export function RevolvingDoorList({ labels }: Props) {
  const { data, isPending } = useRevolvingDoorCases();

  if (isPending) {
    return <PoliticsChartSkeleton height={200} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {(data ?? []).map((c) => (
        <li key={c.id} className="rounded-lg border border-surface-border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">{c.person_name}</p>
              <p className="text-sm text-gray-500">{labels.fields.role}: {c.political_role}</p>
              <p className="text-sm text-gray-500">{labels.fields.movedTo}: {c.entity_moved_to}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-medium text-gray-700">{c.year}</p>
              <a
                href={c.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-primary hover:underline mt-1 block"
              >
                {labels.sourceLabel}
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
