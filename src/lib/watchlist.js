// ============================================================================
// Watchlist store — "Continue Watching" (progress) + "Watch Later" (saved).
//
// Works for BOTH anime and live-action movies/TV. Every item is keyed by a
// generic string id (`animeId`):
//   anime -> the internal/AniList id  ("21")
//   movie -> "movie:<tmdbId>"         ("movie:550")
//   tv    -> "tv:<tmdbId>"            ("tv:1399")
//
// TWO storage backends, chosen automatically:
//   • GUEST (no userId / auth disabled) -> browser localStorage.
//   • LOGGED IN (userId given + Supabase) -> the watch_progress / watch_later
//     tables (RLS restricts each user to their own rows — see auth_schema.sql).
//
// The item field names used across the UI (Dashboard, Watch, Movie* pages):
//   animeId, watchId, title, poster, episode, total,
//   and movie-only extras: backdrop, season, mediaType.
// ============================================================================
import { supabase, supabaseEnabled } from "@/src/lib/supabase";

const LATER_KEY = "offanime-watch-later-v1";
const PROGRESS_KEY = "offanime-watch-progress-v1";

// --------------------------------------------------------------------------
// id / routing helpers
// --------------------------------------------------------------------------

/** Movies & TV are stored with a "movie:" / "tv:" prefix. */
export function isMediaItem(item) {
  const id = String(item?.animeId ?? item?.anime_id ?? "");
  return id.startsWith("movie:") || id.startsWith("tv:");
}

/**
 * Build the correct player link for a stored item.
 *   • movie/tv -> `watchId` is already a full route ("/movies/movie/550").
 *   • anime    -> `watchId` is a slug; rebuild "/watch/<slug>?ep=<episode>".
 */
export function watchHref(item) {
  if (!item) return "/";
  const watchId = item.watchId ?? item.watch_id ?? "";

  if (isMediaItem(item)) {
    if (!watchId) return "/movies";
    return watchId.startsWith("/") ? watchId : `/${watchId}`;
  }

  if (!watchId) return "/";
  const ep = Number(item.episode) || 1;
  const base = watchId.startsWith("/") ? watchId : `/watch/${watchId}`;
  return ep > 1 ? `${base}?ep=${ep}` : base;
}

// Normalise a raw item (from the UI) into a plain, storable record.
function normalizeItem(input = {}) {
  return {
    animeId: String(input.animeId ?? input.anime_id ?? ""),
    watchId: input.watchId ?? input.watch_id ?? null,
    title: input.title ?? null,
    poster: input.poster ?? null,
    backdrop: input.backdrop ?? null,
    episode: input.episode != null ? Number(input.episode) : 1,
    season: input.season ?? null,
    total: input.total != null ? Number(input.total) : null,
    mediaType: input.mediaType ?? null,
  };
}

// Map a Supabase DB row (snake_case) back to the UI item shape (camelCase).
function fromRow(row = {}) {
  return {
    animeId: String(row.anime_id ?? ""),
    watchId: row.watch_id ?? null,
    title: row.title ?? null,
    poster: row.poster ?? null,
    episode: row.episode != null ? Number(row.episode) : 1,
    total: row.total != null ? Number(row.total) : null,
    updatedAt: row.updated_at ?? row.added_at ?? null,
  };
}

// --------------------------------------------------------------------------
// localStorage helpers (guest mode)
// --------------------------------------------------------------------------
function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocal(key, arr) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    /* ignore quota / disabled storage */
  }
}

function upsertLocal(key, item) {
  const list = readLocal(key);
  const idx = list.findIndex((x) => String(x.animeId) === String(item.animeId));
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.unshift(item);
  writeLocal(key, list);
  return list;
}

function removeLocal(key, animeId) {
  const list = readLocal(key).filter(
    (x) => String(x.animeId) !== String(animeId)
  );
  writeLocal(key, list);
  return list;
}

function canCloud(userId) {
  return Boolean(supabaseEnabled && supabase && userId);
}

// --------------------------------------------------------------------------
// Watch Later
// --------------------------------------------------------------------------

/** Synchronous check (localStorage only) used by buttons for instant UI. */
export function isLaterLocal(animeId) {
  if (animeId == null) return false;
  return readLocal(LATER_KEY).some(
    (x) => String(x.animeId) === String(animeId)
  );
}

/** Add an item to "Watch Later" (local always; cloud too when logged in). */
export async function addLater(input, userId = null) {
  const item = normalizeItem(input);
  if (!item.animeId) return;

  // Local mirror keeps the sync isLaterLocal() check correct everywhere.
  upsertLocal(LATER_KEY, { ...item, added_at: Date.now() });

  if (canCloud(userId)) {
    try {
      await supabase.from("watch_later").upsert(
        {
          user_id: userId,
          anime_id: item.animeId,
          watch_id: item.watchId,
          title: item.title,
          poster: item.poster,
        },
        { onConflict: "user_id,anime_id" }
      );
    } catch {
      /* keep local copy; ignore cloud error */
    }
  }
}

/** Remove an item from "Watch Later". */
export async function removeLater(animeId, userId = null) {
  if (animeId == null) return;
  removeLocal(LATER_KEY, animeId);

  if (canCloud(userId)) {
    try {
      await supabase
        .from("watch_later")
        .delete()
        .eq("user_id", userId)
        .eq("anime_id", String(animeId));
    } catch {
      /* ignore */
    }
  }
}

/** List saved-for-later items (cloud when logged in, else local). */
export async function listLater(userId = null) {
  if (canCloud(userId)) {
    try {
      const { data, error } = await supabase
        .from("watch_later")
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });
      if (!error && Array.isArray(data)) return data.map(fromRow);
    } catch {
      /* fall through to local */
    }
  }
  return readLocal(LATER_KEY).map(normalizeItem);
}

// --------------------------------------------------------------------------
// Watch Progress ("Continue Watching")
// --------------------------------------------------------------------------

/** Save / update the last-watched episode for an item. */
export async function saveProgress(input, userId = null) {
  const item = normalizeItem(input);
  if (!item.animeId) return;

  upsertLocal(PROGRESS_KEY, { ...item, updated_at: Date.now() });

  if (canCloud(userId)) {
    try {
      await supabase.from("watch_progress").upsert(
        {
          user_id: userId,
          anime_id: item.animeId,
          watch_id: item.watchId,
          title: item.title,
          poster: item.poster,
          episode: item.episode || 1,
          total: item.total,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,anime_id" }
      );
    } catch {
      /* ignore cloud error */
    }
  }
}

/** Remove a progress entry. */
export async function removeProgress(animeId, userId = null) {
  if (animeId == null) return;
  removeLocal(PROGRESS_KEY, animeId);

  if (canCloud(userId)) {
    try {
      await supabase
        .from("watch_progress")
        .delete()
        .eq("user_id", userId)
        .eq("anime_id", String(animeId));
    } catch {
      /* ignore */
    }
  }
}

/** List "continue watching" items, newest first. */
export async function listProgress(userId = null) {
  if (canCloud(userId)) {
    try {
      const { data, error } = await supabase
        .from("watch_progress")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (!error && Array.isArray(data)) return data.map(fromRow);
    } catch {
      /* fall through to local */
    }
  }
  const local = readLocal(PROGRESS_KEY).map(normalizeItem);
  // Preserve newest-first ordering for the local store too.
  return local;
}

// --------------------------------------------------------------------------
// Sync
// --------------------------------------------------------------------------

/**
 * After login/registration, push the guest's local lists up to their cloud
 * account so nothing saved-as-a-guest is lost. Cloud rows win on conflict
 * (upsert), and the local copies are kept as an offline mirror.
 */
export async function mergeLocalToCloud(userId) {
  if (!canCloud(userId)) return;

  const localLater = readLocal(LATER_KEY);
  const localProgress = readLocal(PROGRESS_KEY);

  try {
    if (localLater.length) {
      const rows = localLater
        .map(normalizeItem)
        .filter((i) => i.animeId)
        .map((i) => ({
          user_id: userId,
          anime_id: i.animeId,
          watch_id: i.watchId,
          title: i.title,
          poster: i.poster,
        }));
      if (rows.length) {
        await supabase
          .from("watch_later")
          .upsert(rows, { onConflict: "user_id,anime_id" });
      }
    }

    if (localProgress.length) {
      const rows = localProgress
        .map(normalizeItem)
        .filter((i) => i.animeId)
        .map((i) => ({
          user_id: userId,
          anime_id: i.animeId,
          watch_id: i.watchId,
          title: i.title,
          poster: i.poster,
          episode: i.episode || 1,
          total: i.total,
        }));
      if (rows.length) {
        await supabase
          .from("watch_progress")
          .upsert(rows, { onConflict: "user_id,anime_id" });
      }
    }
  } catch {
    /* best-effort sync; ignore errors */
  }
}
