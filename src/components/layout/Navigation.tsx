'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function Navigation() {
  const t = useTranslations('Navigation');

  const sections = [
    {key: 'economy', href: '/economy'},
    {key: 'politics', href: '/politics'},
    {key: 'immigration', href: '/immigration'},
    {key: 'crime', href: '/crime'},
    {key: 'comparator', href: '/comparator'},
  ] as const;

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className="font-semibold hover:opacity-80 transition-opacity">
        {t('home')}
      </Link>
      {sections.map(({key, href}) => (
        <Link
          key={key}
          href={href}
          className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          {t(key)}
        </Link>
      ))}
    </nav>
  );
}
