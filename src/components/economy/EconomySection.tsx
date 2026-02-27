'use client';

import { useEconomyMetric } from '@/hooks/useEconomyMetric';
import { EconomyChart, CpiChart } from '@/components/economy/EconomyChart';
import { EconomyChartSkeleton } from '@/components/economy/EconomyChartSkeleton';
import type { EconomyDataPoint } from '@/types/economy';

// Chart color assignments (from chart.* Tailwind tokens)
const COLORS = {
  medianSalary:   '#3B82F6',  // chart.blue
  fiscalBurden:   '#F97316',  // chart.orange
  housingRatio:   '#EF4444',  // chart.red
  povertyRisk:    '#8B5CF6',  // chart.purple
  cpiFood:        '#22C55E',  // chart.green
  cpiEnergy:      '#F97316',  // chart.orange
  cpiTransport:   '#14B8A6',  // chart.teal
  cpiHousing:     '#8B5CF6',  // chart.purple
};

type Labels = {
  title: string;
  intro: string;
  medianSalaryTitle: string;
  fiscalBurdenTitle: string;
  housingRatioTitle: string;
  cpiTitle: string;
  povertyRiskTitle: string;
  noData: string;
  dataUnavailable: string;
  sourcePrefix: string;
  gapsNote: string;
  dataThrough: string;  // e.g. "Data through" — year appended dynamically
  // CPI series labels
  cpiFood: string;
  cpiEnergy: string;
  cpiTransport: string;
  cpiHousing: string;
};

type EconomySectionProps = {
  labels: Labels;
};

type ChartCardProps = {
  title: string;
  sourceLabel: string;
  sourceUrl: string;
  gapsNote: string;
  dataThroughLabel: string;  // fully composed string e.g. "Data through 2023"
  children: React.ReactNode;
};

function ChartCard({ title, sourceLabel, sourceUrl, gapsNote, dataThroughLabel, children }: ChartCardProps) {
  return (
    <div className="bg-white border border-surface-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-brand-neutral mb-4">{title}</h2>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-primary hover:underline"
        >
          {sourceLabel}
        </a>
        <span className="text-xs text-gray-500">{dataThroughLabel}</span>
        <span className="text-xs text-gray-400">{gapsNote}</span>
      </div>
    </div>
  );
}

function NoDataCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-white border border-surface-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-brand-neutral mb-4">{title}</h2>
      <div className="h-80 flex items-center justify-center bg-surface-muted rounded">
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Derive "Data through [year]" from the maximum year present in data
function maxYear(data: EconomyDataPoint[] | undefined): number | null {
  if (!data?.length) return null;
  return Math.max(...data.map((d) => d.year));
}

export function EconomySection({ labels }: EconomySectionProps) {
  const salaryQuery     = useEconomyMetric('median_salary_real');
  const fiscalQuery     = useEconomyMetric('fiscal_burden_pct');
  const housingQuery    = useEconomyMetric('housing_salary_ratio');
  const cpiFood         = useEconomyMetric('cpi_food_index');
  const cpiEnergy       = useEconomyMetric('cpi_energy_index');
  const cpiTransport    = useEconomyMetric('cpi_transport_index');
  const cpiHousing      = useEconomyMetric('cpi_housing_index');
  const povertyQuery    = useEconomyMetric('poverty_risk_pct');

  // Helper: get first non-null source from data
  const getSource = (data: typeof salaryQuery.data) => ({
    label: data?.[0]?.source ?? '',
    url: data?.[0]?.source_url ?? '#',
  });

  // Helper: compose "Data through [year]" string
  const dataThroughStr = (data: EconomyDataPoint[] | undefined): string => {
    const year = maxYear(data);
    return year ? `${labels.dataThrough} ${year}` : '';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Median real salary */}
      {salaryQuery.isPending ? (
        <EconomyChartSkeleton />
      ) : !salaryQuery.data?.length ? (
        <NoDataCard title={labels.medianSalaryTitle} message={labels.dataUnavailable} />
      ) : (
        <ChartCard
          title={labels.medianSalaryTitle}
          sourceLabel={getSource(salaryQuery.data).label}
          sourceUrl={getSource(salaryQuery.data).url}
          gapsNote={labels.gapsNote}
          dataThroughLabel={dataThroughStr(salaryQuery.data)}
        >
          <EconomyChart
            data={salaryQuery.data}
            color={COLORS.medianSalary}
            gradientId="grad-salary"
            yFormatter={(v) => `${v.toLocaleString('es-ES')} €`}
            noDataLabel={labels.noData}
          />
        </ChartCard>
      )}

      {/* 2. Fiscal burden */}
      {fiscalQuery.isPending ? (
        <EconomyChartSkeleton />
      ) : !fiscalQuery.data?.length ? (
        <NoDataCard title={labels.fiscalBurdenTitle} message={labels.dataUnavailable} />
      ) : (
        <ChartCard
          title={labels.fiscalBurdenTitle}
          sourceLabel={getSource(fiscalQuery.data).label}
          sourceUrl={getSource(fiscalQuery.data).url}
          gapsNote={labels.gapsNote}
          dataThroughLabel={dataThroughStr(fiscalQuery.data)}
        >
          <EconomyChart
            data={fiscalQuery.data}
            color={COLORS.fiscalBurden}
            gradientId="grad-fiscal"
            yFormatter={(v) => `${v.toFixed(1)}%`}
            noDataLabel={labels.noData}
          />
        </ChartCard>
      )}

      {/* 3. Housing / salary ratio */}
      {housingQuery.isPending ? (
        <EconomyChartSkeleton />
      ) : !housingQuery.data?.length ? (
        <NoDataCard title={labels.housingRatioTitle} message={labels.dataUnavailable} />
      ) : (
        <ChartCard
          title={labels.housingRatioTitle}
          sourceLabel={getSource(housingQuery.data).label}
          sourceUrl={getSource(housingQuery.data).url}
          gapsNote={labels.gapsNote}
          dataThroughLabel={dataThroughStr(housingQuery.data)}
        >
          <EconomyChart
            data={housingQuery.data}
            color={COLORS.housingRatio}
            gradientId="grad-housing"
            yFormatter={(v) => `${v.toFixed(1)}x`}
            noDataLabel={labels.noData}
          />
        </ChartCard>
      )}

      {/* 4. CPI by category — multi-series chart */}
      {cpiFood.isPending || cpiEnergy.isPending || cpiTransport.isPending || cpiHousing.isPending ? (
        <EconomyChartSkeleton />
      ) : !cpiFood.data?.length && !cpiEnergy.data?.length ? (
        <NoDataCard title={labels.cpiTitle} message={labels.dataUnavailable} />
      ) : (
        <ChartCard
          title={labels.cpiTitle}
          sourceLabel="Eurostat HICP"
          sourceUrl="https://ec.europa.eu/eurostat/web/hicp/database"
          gapsNote={labels.gapsNote}
          dataThroughLabel={dataThroughStr(cpiFood.data)}
        >
          <CpiChart
            series={[
              { metric: 'cpi_food_index',      data: cpiFood.data ?? [],      color: COLORS.cpiFood,      label: labels.cpiFood },
              { metric: 'cpi_energy_index',     data: cpiEnergy.data ?? [],     color: COLORS.cpiEnergy,    label: labels.cpiEnergy },
              { metric: 'cpi_transport_index',  data: cpiTransport.data ?? [],  color: COLORS.cpiTransport, label: labels.cpiTransport },
              { metric: 'cpi_housing_index',    data: cpiHousing.data ?? [],    color: COLORS.cpiHousing,   label: labels.cpiHousing },
            ]}
            noDataLabel={labels.noData}
          />
        </ChartCard>
      )}

      {/* 5. Poverty risk */}
      {povertyQuery.isPending ? (
        <EconomyChartSkeleton />
      ) : !povertyQuery.data?.length ? (
        <NoDataCard title={labels.povertyRiskTitle} message={labels.dataUnavailable} />
      ) : (
        <ChartCard
          title={labels.povertyRiskTitle}
          sourceLabel={getSource(povertyQuery.data).label}
          sourceUrl={getSource(povertyQuery.data).url}
          gapsNote={labels.gapsNote}
          dataThroughLabel={dataThroughStr(povertyQuery.data)}
        >
          <EconomyChart
            data={povertyQuery.data}
            color={COLORS.povertyRisk}
            gradientId="grad-poverty"
            yFormatter={(v) => `${v.toFixed(1)}%`}
            noDataLabel={labels.noData}
          />
        </ChartCard>
      )}
    </div>
  );
}
