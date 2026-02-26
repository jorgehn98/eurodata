'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, {locale: newLocale});
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{t('label')}:</span>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => onLocaleChange(loc)}
          disabled={loc === locale}
          className={`text-sm px-2 py-1 rounded transition-colors ${
            loc === locale
              ? 'font-bold text-gray-900 cursor-default'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
