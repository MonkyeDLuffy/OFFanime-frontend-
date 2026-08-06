import axios from "axios";
import { INFO_API } from "../config/api";

/**
 * getAnimeTrailer — resolve a playable YouTube embed URL for an anime by its
 * MyAnimeList id, using the existing Jikan proxy (`/jikan/anime/:malId`).
 *
 * Jikan returns `data.trailer = { youtubeId, url, embedUrl, image }`. We
 * normalise whatever it gives us into a single autoplay embed URL suitable for
 * the <iframe> in TrailerModal.
 *
 * Results are cached both in-memory (instant within a session) and in
 * sessionStorage (survives client-side route changes) so we never hit the API
 * twice for the same title. A resolved value of "" means "known to have NO
 * trailer" — we still cache that so we don't keep retrying.
 *
 * This uses ONLY the existing Jikan endpoint — no new API surface is added.
 */

const MEM_CACHE = new Map();
const STORAGE_KEY = "animeTrailerCache_v1";

function readStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(map) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage full / unavailable — memory cache still works */
  }
}

// Normalise any Jikan trailer object into an autoplay embed URL (or "").
function toEmbedUrl(trailer) {
  if (!trailer) return "";
  let url = trailer.embedUrl || "";

  if (!url && trailer.youtubeId) {
    url = `https://www.youtube-nocookie.com/embed/${trailer.youtubeId}`;
  }
  if (!url && trailer.url) {
    const m = String(trailer.url).match(
      /(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/
    );
    if (m) url = `https://www.youtube-nocookie.com/embed/${m[1]}`;
  }
  if (!url) return "";

  // Ensure autoplay + a clean player without cookies/related videos.
  const hasQuery = url.includes("?");
  if (!/autoplay=1/.test(url)) {
    url += `${hasQuery ? "&" : "?"}autoplay=1`;
  }
  if (!/rel=/.test(url)) url += "&rel=0";
  if (!/modestbranding=/.test(url)) url += "&modestbranding=1";
  return url;
}

export default async function getAnimeTrailer(malId) {
  if (!malId) return "";
  const key = String(malId);

  if (MEM_CACHE.has(key)) return MEM_CACHE.get(key);

  const store = readStore();
  if (Object.prototype.hasOwnProperty.call(store, key)) {
    MEM_CACHE.set(key, store[key]);
    return store[key];
  }

  try {
    const { data } = await axios.get(`${INFO_API}/jikan/anime/${malId}`, {
      timeout: 30000,
    });
    const url = toEmbedUrl(data?.data?.trailer);
    MEM_CACHE.set(key, url);
    store[key] = url;
    writeStore(store);
    return url;
  } catch {
    // Do NOT cache network errors — a transient failure shouldn't permanently
    // disable the trailer button for this title.
    return "";
  }
}

// Synchronous peek — returns the cached URL if we already have it, else undefined.
export function getCachedAnimeTrailer(malId) {
  if (!malId) return undefined;
  const key = String(malId);
  if (MEM_CACHE.has(key)) return MEM_CACHE.get(key);
  const store = readStore();
  return Object.prototype.hasOwnProperty.call(store, key)
    ? store[key]
    : undefined;
}
