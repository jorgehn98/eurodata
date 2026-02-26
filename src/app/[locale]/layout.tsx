import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import Navigation from '@/components/layout/Navigation';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';
import QueryProvider from '@/providers/QueryProvider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <QueryProvider>
        <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <Navigation />
          <LocaleSwitcher />
        </header>
        {children}
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
