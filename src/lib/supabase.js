// ============================================================================
// Supabase client + edge-cache reader.
//
// A SINGLE shared browser client is created from the public "anon" key. If the
// env vars are missing the client is null and `supabaseEnabled` is false — the
// whole app then transparently falls back to guest-only / direct-API behaviour
// (auth is disabled, the cache is skipped). This is intentional so the site
// still runs before Supabase is configured (see SUPABASE_SETUP.md).
// ============================================================================
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/** True only when BOTH the project URL and anon key are configured. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * The shared Supabase browser client (or null when disabled). Persists the auth
 * session in localStorage and auto-refreshes the token.
 */
export const supabase = supabaseEnabled
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Read one JSON snapshot from the `api_cache` table.
 *
 * The Edge Function (supabase/functions/refresh-cache) writes rows as
 *   { cache_key, payload, updated_at }
 * where `payload` is the raw upstream API response.
 *
 * Callers expect a wrapper of the shape `{ data, updatedAt }` (see tmdb.js,
 * which reads `snap?.data?.results`). Returns null when the cache is disabled,
 * the row is missing, or the request errors — callers then fetch live.
 *
 * @param {string} key e.g. "home", "tmdb:trending", "category:top-airing"
 * @returns {Promise<{ data: any, updatedAt: string } | null>}
 */
export async function readCache(key) {
  if (!supabaseEnabled || !key) return null;

  try {
    const { data, error } = await supabase
      .from("api_cache")
      .select("payload, updated_at")
      .eq("cache_key", key)
      .maybeSingle();

    if (error || !data) return null;

    return {
      data: data.payload,
      updatedAt: data.updated_at || null,
    };
  } catch {
    return null;
  }
}
