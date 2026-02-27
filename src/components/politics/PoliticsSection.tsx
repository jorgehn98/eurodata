'use client';

// Composes all 5 political sub-sections.
// Receives all translation labels as props from Server Component page.tsx.
// Pattern: identical to EconomySection.tsx — no useTranslations inside.

import { SalaryComparisonChart } from '@/components/politics/SalaryComparisonChart';
import { SalaryRatioChart } from '@/components/politics/SalaryRatioChart';
import { AdvisorCountChart } from '@/components/politics/AdvisorCountChart';
import { PensionsTable } from '@/components/politics/PensionsTable';
import { RevolvingDoorList } from '@/components/politics/RevolvingDoorList';

export type PoliticsLabels = {
  title: string;
  intro: string;
  noData: string;
  dataUnavailable: string;
  sourcePrefix: string;
  gapsNote: string;
  dataThrough: string;
  anchors: {
    salaryComparison: string;
    salaryRatio: string;
    advisors: string;
    pensions: string;
    revolvingDoor: string;
  };
  toggle: {
    real: string;
    nominal: string;
  };
  charts: {
    salaryComparison: string;
    salaryRatio: string;
    advisorCount: string;
  };
  series: {
    president: string;
    ministers: string;
    mps: string;
    median: string;
  };
  pensions: {
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
  revolvingDoor: {
    sectionTitle: string;
    fields: {
      role: string;
      movedTo: string;
      year: string;
      source: string;
    };
    sourceLabel: string;
  };
};

type PoliticsSectionProps = {
  labels: PoliticsLabels;
};

export function PoliticsSection({ labels }: PoliticsSectionProps) {
  const salaryLabels = {
    chartTitle:      labels.charts.salaryComparison,
    president:       labels.series.president,
    ministers:       labels.series.ministers,
    mps:             labels.series.mps,
    median:          labels.series.median,
    toggleReal:      labels.toggle.real,
    toggleNominal:   labels.toggle.nominal,
    gapsNote:        labels.gapsNote,
    dataThrough:     labels.dataThrough,
    sourcePrefix:    labels.sourcePrefix,
  };

  const ratioLabels = {
    chartTitle:  labels.charts.salaryRatio,
    president:   labels.series.president,
    ministers:   labels.series.ministers,
    mps:         labels.series.mps,
    gapsNote:    labels.gapsNote,
    dataThrough: labels.dataThrough,
  };

  const advisorLabels = {
    chartTitle:   labels.charts.advisorCount,
    advisorCount: labels.charts.advisorCount,
    gapsNote:     labels.gapsNote,
  };

  const pensionsLabels = {
    sectionTitle: labels.pensions.sectionTitle,
    columns:      labels.pensions.columns,
    sourceLabel:  labels.pensions.sourceLabel,
  };

  const revolvingDoorLabels = {
    sectionTitle: labels.revolvingDoor.sectionTitle,
    fields:       labels.revolvingDoor.fields,
    sourceLabel:  labels.revolvingDoor.sourceLabel,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* In-page anchor nav */}
      <nav className="flex flex-wrap gap-x-4 gap-y-2 border-b border-surface-border pb-3">
        <a href="#salary"        className="text-sm text-brand-primary hover:underline">{labels.anchors.salaryComparison}</a>
        <a href="#ratio"         className="text-sm text-brand-primary hover:underline">{labels.anchors.salaryRatio}</a>
        <a href="#advisors"      className="text-sm text-brand-primary hover:underline">{labels.anchors.advisors}</a>
        <a href="#pensions"      className="text-sm text-brand-primary hover:underline">{labels.anchors.pensions}</a>
        <a href="#revolving-door" className="text-sm text-brand-primary hover:underline">{labels.anchors.revolvingDoor}</a>
      </nav>

      {/* 1. Salary comparison chart */}
      <section id="salary" className="scroll-mt-20">
        <SalaryComparisonChart labels={salaryLabels} />
      </section>

      {/* 2. Salary ratio chart */}
      <section id="ratio" className="scroll-mt-20">
        <SalaryRatioChart labels={ratioLabels} />
      </section>

      {/* 3. Advisor count bar chart */}
      <section id="advisors" className="scroll-mt-20">
        <AdvisorCountChart labels={advisorLabels} />
      </section>

      {/* 4. Pensions table */}
      <section id="pensions" className="scroll-mt-20">
        <div className="rounded-lg border border-surface-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-neutral mb-4">
            {labels.pensions.sectionTitle}
          </h2>
          <PensionsTable labels={pensionsLabels} />
        </div>
      </section>

      {/* 5. Revolving door list */}
      <section id="revolving-door" className="scroll-mt-20">
        <div className="rounded-lg border border-surface-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-neutral mb-4">
            {labels.revolvingDoor.sectionTitle}
          </h2>
          <RevolvingDoorList labels={revolvingDoorLabels} />
        </div>
      </section>
    </div>
  );
}
