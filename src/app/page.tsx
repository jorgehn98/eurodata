// This page is superseded by middleware locale detection.
// The middleware in middleware.ts redirects / to /es/ or /en/ based on Accept-Language.
// This file exists only to satisfy Next.js App Router requirements.
import {redirect} from 'next/navigation';

export default function RootPage() {
  redirect('/es');
}
