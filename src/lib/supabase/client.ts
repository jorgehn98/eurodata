// src/lib/supabase/client.ts
// Use createBrowserClient ONLY in 'use client' components
// Do NOT use this in Server Components, Route Handlers, or middleware
import {createBrowserClient} from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
