import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

let cachedClient: SupabaseClient | null = null;

/** Klien Supabase untuk browser. Null bila env belum dikonfigurasi. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (!cachedClient) {
    cachedClient = createBrowserClient(env.url, env.anonKey);
  }
  return cachedClient;
}
