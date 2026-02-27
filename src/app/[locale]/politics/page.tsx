import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PoliticsSection } from '@/components/politics/PoliticsSection';

export default async function PoliticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Politics');

  const labels = {
    title: t('title'),
    intro: t('intro'),
    noData: t('noData'),
    dataUnavailable: t('dataUnavailable'),
    sourcePrefix: t('sourcePrefix'),
    gapsNote: t('gapsNote'),
    dataThrough: t('dataThrough'),
    anchors: {
      salaryComparison: t('anchors.salaryComparison'),
      salaryRatio: t('anchors.salaryRatio'),
      advisors: t('anchors.advisors'),
      pensions: t('anchors.pensions'),
      revolvingDoor: t('anchors.revolvingDoor'),
    },
    toggle: {
      real: t('toggle.real'),
      nominal: t('toggle.nominal'),
    },
    charts: {
      salaryComparison: t('charts.salaryComparison'),
      salaryRatio: t('charts.salaryRatio'),
      advisorCount: t('charts.advisorCount'),
    },
    series: {
      president: t('series.president'),
      ministers: t('series.ministers'),
      mps: t('series.mps'),
      median: t('series.median'),
    },
    pensions: {
      sectionTitle: t('pensions.sectionTitle'),
      columns: {
        name: t('pensions.columns.name'),
        role: t('pensions.columns.role'),
        pension: t('pensions.columns.pension'),
        yearsInOffice: t('pensions.columns.yearsInOffice'),
        source: t('pensions.columns.source'),
      },
      sourceLabel: t('pensions.sourceLabel'),
    },
    revolvingDoor: {
      sectionTitle: t('revolvingDoor.sectionTitle'),
      fields: {
        role: t('revolvingDoor.fields.role'),
        movedTo: t('revolvingDoor.fields.movedTo'),
        year: t('revolvingDoor.fields.year'),
        source: t('revolvingDoor.fields.source'),
      },
      sourceLabel: t('revolvingDoor.sourceLabel'),
    },
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-brand-neutral mb-2">{labels.title}</h1>
      <p className="text-gray-600 mb-8">{labels.intro}</p>
      <PoliticsSection labels={labels} />
    </main>
  );
}
