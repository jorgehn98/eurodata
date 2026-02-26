import {getTranslations} from 'next-intl/server';
import {setRequestLocale} from 'next-intl/server';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600 mb-2">{t('subtitle')}</p>
      <p className="text-base text-gray-500 max-w-lg text-center">{t('description')}</p>
    </main>
  );
}
