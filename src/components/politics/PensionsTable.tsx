'use client';

import { usePoliticalPensions } from '@/hooks/usePoliticalPensions';
import { PoliticsChartSkeleton } from '@/components/politics/PoliticsChartSkeleton';

type Labels = {
  sectionTitle: string;
  columns: {
    name: string;
    role: string;
    pension: string;
    yearsInOffice: string;
    source: string;
  };
  sourceLabel: string;
};

type Props = { labels: Labels };

export function PensionsTable({ labels }: Props) {
  const { data, isPending } = usePoliticalPensions();

  if (isPending) {
    return <PoliticsChartSkeleton height={200} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left text-gray-500">
            <th className="pb-2 pr-4">{labels.columns.name}</th>
            <th className="pb-2 pr-4">{labels.columns.role}</th>
            <th className="pb-2 pr-4 text-right">{labels.columns.pension}</th>
            <th className="pb-2 pr-4 text-right">{labels.columns.yearsInOffice}</th>
            <th className="pb-2">{labels.columns.source}</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((pension) => (
            <tr key={pension.id} className="border-b border-surface-border/50 hover:bg-surface-muted/30">
              <td className="py-2 pr-4 font-medium text-gray-800">{pension.name}</td>
              <td className="py-2 pr-4 text-gray-600">{pension.role}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {pension.pension_annual_eur.toLocaleString('es-ES')} &euro;
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">{pension.years_in_office}</td>
              <td className="py-2">
                <a
                  href={pension.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline truncate block max-w-[120px]"
                  title={pension.source}
                >
                  {labels.sourceLabel}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
