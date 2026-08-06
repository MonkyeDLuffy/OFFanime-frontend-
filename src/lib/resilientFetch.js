// ============================================================================
// resilientGet — an "unbreakable" data getter used by the home feed.
//
// Resolution order (first success wins):
//   1. FRESH Supabase cache snapshot (instant, CDN-served, refreshed hourly).
//   2. LIVE fetch via the provided `fetcher`, with retry + exponential backoff.
//   3. STALE Supabase snapshot (better stale than nothing).
//   4. The caller-provided `fallback` (e.g. stale localStorage / empty shape).
//
// The snapshot payload written by the Edge Function is the RAW upstream API
// response. `fetcher` is responsible for its own normalisation, so a snapshot
// is only used directly when its shape already matches what the caller expects
// (checked via the optional `isUsable` predicate; by default any non-empty
// object/array is accepted).
// ============================================================================
import { readCache } from "@/src/lib/supabase";

const DEFAULT_MAX_AGE = 1000 * 60 * 30; // 30 min
const DEFAULT_RETRIES = 2;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isNonEmpty(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}

async function withRetry(fetcher, retries) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetcher();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        // Exponential backoff: 300ms, 600ms, 1200ms, ...
        await sleep(300 * 2 ** attempt);
      }
    }
  }
  throw lastErr;
}

/**
 * @param {object}   opts
 * @param {string}   opts.cacheKey          Supabase api_cache key (e.g. "home").
 * @param {Function} opts.fetcher           async () => data  (live source).
 * @param {*}        [opts.fallback]        returned if everything else fails.
 * @param {number}   [opts.maxAgeMs]        freshness window for the snapshot.
 * @param {number}   [opts.retries]         live-fetch retry attempts.
 * @param {Function} [opts.isUsable]        (data) => boolean; validates snapshots.
 * @returns {Promise<*>}
 */
export async function resilientGet({
  cacheKey,
  fetcher,
  fallback = null,
  maxAgeMs = DEFAULT_MAX_AGE,
  retries = DEFAULT_RETRIES,
  isUsable = isNonEmpty,
} = {}) {
  let snapshot = null;

  // 1) Try the Supabase snapshot.
  try {
    snapshot = cacheKey ? await readCache(cacheKey) : null;
  } catch {
    snapshot = null;
  }

  const snapAge =
    snapshot?.updatedAt != null
      ? Date.now() - new Date(snapshot.updatedAt).getTime()
      : Infinity;
  const snapData = snapshot?.data;
  const snapUsable = isUsable(snapData);

  // Fresh & usable snapshot -> return immediately.
  if (snapUsable && snapAge <= maxAgeMs) {
    return snapData;
  }

  // 2) Live fetch with retry/backoff.
  if (typeof fetcher === "function") {
    try {
      const live = await withRetry(fetcher, retries);
      if (isUsable(live)) return live;
    } catch {
      /* fall through to stale snapshot / fallback */
    }
  }

  // 3) Stale-but-usable snapshot.
  if (snapUsable) return snapData;

  // 4) Caller fallback.
  return fallback;
}

export default resilientGet;
