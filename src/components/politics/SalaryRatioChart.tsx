'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePoliticalMetric } from '@/hooks/usePoliticalMetric';
import { useEconomyMetric } from '@/hooks/useEconomyMetric';
import { PoliticsChartSkeleton } from '@/components/politics/PoliticsChartSkeleton';

type Labels = {
  chartTitle: string;
  president: string;
  ministers: string;
  mps: string;
  gapsNote: string;
  dataThrough: string;
};

type Props = { labels: Labels };

export function SalaryRatioChart({ labels }: Props) {
  // Always use real variants — ratio real/real == ratio nominal/nominal, real is canonical
  const presReal = usePoliticalMetric('president_salary_real');
  const minReal  = usePoliticalMetric('minister_salary_real');
  const mpReal   = usePoliticalMetric('mp_salary_real');
  const medReal  = useEconomyMetric('median_salary_real');

  const isPending =
    presReal.isPending || minReal.isPending || mpReal.isPending || medReal.isPending;

  // Guarded division to compute ratios
  const getMedian = (year: number): number | null =>
    medReal.data?.find(d => d.year === year)?.value ?? null;

  const computeRatio = (salary: number | null, median: number | null): number | null =>
    salary !== null && median !== null && median !== 0 ? salary / median : null;

  const allYears = [
    ...new Set([
      ...(presReal.data ?? []).map(d => d.year),
      ...(minReal.data ?? []).map(d => d.year),
      ...(mpReal.data ?? []).map(d => d.year),
    ]),
  ].sort((a, b) => a - b);

  const mergedData = allYears.map(year => {
    const med = getMedian(year);
    return {
      year,
      president: computeRatio(presReal.data?.find(d => d.year === year)?.value ?? null, med),
      minister:  computeRatio(minReal.data?.find(d => d.year === year)?.value ?? null, med),
      mp:        computeRatio(mpReal.data?.find(d => d.year === year)?.value ?? null, med),
    };
  });

  const maxDataYear = allYears.length > 0 ? Math.max(...allYears) : null;

  if (isPending) {
    return <PoliticsChartSkeleton height={280} />;
  }

  return (
    <div className="bg-white border border-surface-border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-neutral mb-4">{labels.chartTitle}</h2>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={mergedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="year"
            type="number"
            domain={[2010, 'dataMax']}
            tickFormatter={String}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => v.toFixed(1) + 'x'}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip formatter={(value: number | string | undefined) => {
            if (typeof value === 'number') return value.toFixed(2) + 'x';
            return value ?? '';
          }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="president"
            name={labels.president}
            stroke="#1E40AF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="minister"
            name={labels.ministers}
            stroke="#0F766E"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="mp"
            name={labels.mps}
            stroke="#F97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Card footer */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-xs text-gray-400">{labels.gapsNote}</span>
        {maxDataYear && (
          <span className="text-xs text-gray-500">{labels.dataThrough} {maxDataYear}</span>
        )}
      </div>
    </div>
  );
}
