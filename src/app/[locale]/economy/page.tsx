import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EconomySection } from '@/components/economy/EconomySection';

export default async function EconomiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Economy');

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-brand-neutral mb-2">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('intro')}</p>
      <EconomySection
        labels={{
          title:              t('title'),
          intro:              t('intro'),
          medianSalaryTitle:  t('charts.medianSalary'),
          fiscalBurdenTitle:  t('charts.fiscalBurden'),
          housingRatioTitle:  t('charts.housingRatio'),
          cpiTitle:           t('charts.cpiCategories'),
          povertyRiskTitle:   t('charts.povertyRisk'),
          noData:             t('noData'),
          dataUnavailable:    t('dataUnavailable'),
          sourcePrefix:       t('sourcePrefix'),
          gapsNote:           t('gapsNote'),
          dataThrough:        t('dataThrough'),
          cpiFood:            t('cpi.food'),
          cpiEnergy:          t('cpi.energy'),
          cpiTransport:       t('cpi.transport'),
          cpiHousing:         t('cpi.housing'),
        }}
      />
    </main>
  );
}
