'use client';

import { useState } from 'react';
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
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
import { usePoliticalMetric } from '@/hooks/usePoliticalMetric';
import { useEconomyMetric } from '@/hooks/useEconomyMetric';
import { PoliticsChartSkeleton } from '@/components/politics/PoliticsChartSkeleton';

type Labels = {
  chartTitle: string;
  president: string;
  ministers: string;
  mps: string;
  median: string;
  toggleReal: string;
  toggleNominal: string;
  gapsNote: string;
  dataThrough: string;
  sourcePrefix: string;
};

type Props = { labels: Labels };

export function SalaryComparisonChart({ labels }: Props) {
  const [showReal, setShowReal] = useState(true);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  // Fetch all 8 variants eagerly — no flicker on toggle
  const presReal = usePoliticalMetric('president_salary_real');
  const presNom  = usePoliticalMetric('president_salary_nominal');
  const minReal  = usePoliticalMetric('minister_salary_real');
  const minNom   = usePoliticalMetric('minister_salary_nominal');
  const mpReal   = usePoliticalMetric('mp_salary_real');
  const mpNom    = usePoliticalMetric('mp_salary_nominal');
  // median_salary_nominal not seeded in economic_indicators — use real for both toggle modes
  const medReal  = useEconomyMetric('median_salary_real');

  const handleLegendClick = (e: LegendPayload) => {
    const key = typeof e.dataKey === 'string' ? e.dataKey : undefined;
    if (!key) return;
    setHiddenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Select active series based on toggle
  const presData = showReal ? (presReal.data ?? []) : (presNom.data ?? []);
  const minData  = showReal ? (minReal.data ?? []) : (minNom.data ?? []);
  const mpData   = showReal ? (mpReal.data ?? []) : (mpNom.data ?? []);
  const medData  = medReal.data ?? [];

  // isPending — check the 4 active salary queries + median (always real)
  const isPending =
    (showReal ? presReal.isPending : presNom.isPending) ||
    (showReal ? minReal.isPending : minNom.isPending) ||
    (showReal ? mpReal.isPending : mpNom.isPending) ||
    medReal.isPending;

  // Merge by year — same Set/sort/map pattern as CpiChart
  const allYears = [
    ...new Set([
      ...presData.map(d => d.year),
      ...minData.map(d => d.year),
      ...mpData.map(d => d.year),
      ...medData.map(d => d.year),
    ]),
  ].sort((a, b) => a - b);

  const mergedData = allYears.map(year => ({
    year,
    president: presData.find(d => d.year === year)?.value ?? null,
    minister:  minData.find(d => d.year === year)?.value ?? null,
    mp:        mpData.find(d => d.year === year)?.value ?? null,
    median:    medData.find(d => d.year === year)?.value ?? null,
  }));

  const maxDataYear = allYears.length > 0 ? Math.max(...allYears) : null;

  if (isPending) {
    return <PoliticsChartSkeleton height={360} />;
  }

  return (
    <div className="bg-white border border-surface-border rounded-lg p-6 shadow-sm">
      {/* Card header: title left, toggle right */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-neutral">{labels.chartTitle}</h2>
        <button
          onClick={() => setShowReal(r => !r)}
          className="text-xs px-2 py-1 rounded border border-surface-border text-gray-600 hover:bg-surface-muted"
        >
          {showReal ? labels.toggleNominal : labels.toggleReal}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={360}>
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
            tickFormatter={(v) => v.toLocaleString('es-ES') + ' €'}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={90}
            includeHidden={false}
          />
          <Tooltip />
          <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
          <Line
            type="monotone"
            dataKey="president"
            name={labels.president}
            stroke="#1E40AF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
            hide={hiddenKeys.has('president')}
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
            hide={hiddenKeys.has('minister')}
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
            hide={hiddenKeys.has('mp')}
          />
          <Line
            type="monotone"
            dataKey="median"
            name={labels.median}
            stroke="#6B7280"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
            hide={hiddenKeys.has('median')}
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
