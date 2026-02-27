'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePoliticalMetric } from '@/hooks/usePoliticalMetric';
import { PoliticsChartSkeleton } from '@/components/politics/PoliticsChartSkeleton';

type Labels = {
  chartTitle: string;
  advisorCount: string;
  gapsNote: string;
};

type Props = { labels: Labels };

export function AdvisorCountChart({ labels }: Props) {
  const advisorQuery = usePoliticalMetric('advisor_count');

  // Transform to BarChart format — source field stores term label (e.g. "Zapatero 2008–11")
  const chartData = (advisorQuery.data ?? []).map(d => ({
    label: d.source,
    count: d.value,
    source_url: d.source_url,
  }));

  if (advisorQuery.isPending) {
    return <PoliticsChartSkeleton height={320} />;
  }

  return (
    <div className="bg-white border border-surface-border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-neutral mb-4">{labels.chartTitle}</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          {/* DO NOT set type="number" — omit type prop (defaults to category) */}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            angle={-35}
            textAnchor="end"
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip />
          {/* DO NOT use <Cell> (deprecated in recharts v3.7) — use fill directly on <Bar> */}
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3">
        <span className="text-xs text-gray-400">{labels.gapsNote}</span>
      </div>
    </div>
  );
}
