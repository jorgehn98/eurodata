'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EconomyDataPoint } from '@/types/economy';

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number | null; color?: string; payload?: { source?: string } }>;
  label?: number;
  yFormatter: (v: number) => string;
  noDataLabel: string;
};

function CustomTooltip({ active, payload, label, yFormatter, noDataLabel }: CustomTooltipProps) {
  if (!active || !label) return null;
  const point = payload?.[0];
  const value = point?.value;

  if (value === null || value === undefined) {
    return (
      <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm">
        <p className="font-medium text-gray-500">{label}</p>
        <p className="text-gray-400">{noDataLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-gray-700">{label}</p>
      <p style={{ color: point?.color ?? '#374151' }}>{yFormatter(value)}</p>
      <p className="text-xs text-gray-400">{point?.payload?.source}</p>
    </div>
  );
}

type EconomyChartProps = {
  data: EconomyDataPoint[];
  color: string;          // hex from chart.* tokens
  gradientId: string;     // unique per chart instance (e.g. 'grad-salary')
  yFormatter: (v: number) => string;
  noDataLabel: string;    // translated "No data available for [year]"
};

export function EconomyChart({ data, color, gradientId, yFormatter, noDataLabel }: EconomyChartProps) {
  const years = data.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Generate explicit year ticks to avoid decimal values on X-axis
  const yearTicks: number[] = [];
  for (let y = minYear; y <= maxYear; y += 2) {
    yearTicks.push(y);
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={[minYear, maxYear]}
          ticks={yearTicks}
          tickFormatter={(v) => String(v)}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={65}
        />
        <Tooltip
          content={
            <CustomTooltip
              yFormatter={yFormatter}
              noDataLabel={noDataLabel}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// --- CPI multi-series chart ---

type CpiSeries = {
  metric: string;    // 'cpi_food_index' etc
  data: EconomyDataPoint[];
  color: string;
  label: string;     // translated label for legend
};

type CpiChartProps = {
  series: CpiSeries[];
  noDataLabel: string;
};

export function CpiChart({ series, noDataLabel }: CpiChartProps) {
  // Merge all series into one data array keyed by year
  const allYears = [...new Set(series.flatMap((s) => s.data.map((d) => d.year)))].sort();

  const mergedData = allYears.map((year) => {
    const point: Record<string, number | null | string> = { year };
    series.forEach((s) => {
      const match = s.data.find((d) => d.year === year);
      point[s.metric] = match?.value ?? null;
    });
    return point;
  });

  const minYear = allYears[0] ?? 2010;
  const maxYear = allYears[allYears.length - 1] ?? 2024;
  const yearTicks: number[] = [];
  for (let y = minYear; y <= maxYear; y += 2) yearTicks.push(y);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={mergedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.metric} id={`grad-${s.metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={[minYear, maxYear]}
          ticks={yearTicks}
          tickFormatter={(v) => String(v)}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => String(v)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active) return null;
            return (
              <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-sm">
                <p className="font-medium text-gray-700 mb-1">{label}</p>
                {series.map((s) => {
                  const entry = payload?.find((p) => p.dataKey === s.metric);
                  const val = entry?.value;
                  return (
                    <p key={s.metric} style={{ color: s.color }}>
                      {s.label}: {val !== null && val !== undefined ? `${val}` : noDataLabel}
                    </p>
                  );
                })}
              </div>
            );
          }}
        />
        {series.map((s) => (
          <Area
            key={s.metric}
            type="monotone"
            dataKey={s.metric}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.metric})`}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            connectNulls={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
