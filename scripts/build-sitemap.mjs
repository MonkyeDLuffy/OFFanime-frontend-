/**
 * build-sitemap.mjs — BRAND-NEW sitemap builder for offanime.cc (v2, clean slate)
 * ─────────────────────────────────────────────────────────────────────────────
 * The previous sitemap set (/sitemap.xml + children) was permanently stuck on
 * "Couldn't fetch" in Google Search Console. GSC caches fetch failures PER URL,
 * so this rebuild uses ENTIRELY NEW FILENAMES to force a fresh, clean fetch:
 *
 *   public/sitemap_index.xml   ← NEW sitemap INDEX  (submit THIS to GSC)
 *   public/sitemap-main.xml    ← homepage, static, category, A-Z, genre pages
 *   public/sitemap-anime.xml   ← anime info pages (deduped, ≤5000 URLs)
 *   public/sitemap-films.xml   ← Movies / TV info pages from TMDB
 *
 * Design rules that maximise GSC fetch reliability:
 *   • Minimal strict XML: <loc> + <lastmod> only (no changefreq/priority —
 *     Google ignores both, and less markup = smaller files, fewer parse risks)
 *   • Pure ASCII output, LF line endings, UTF-8 declared and enforced
 *   • Every file well under limits (50,000 URLs / 50 MB per file)
 *   • Never emits a broken file: any API failure falls back to a valid
 *     minimal sitemap so the build & the live XML are always valid
 *
 * Run:   node scripts/build-sitemap.mjs
 * Env:   SITE_URL, VITE_API_URL, VITE_TMDB_API_KEY, SITEMAP_ANIME_PAGES
 */
import fs from "node:fs";
import path from "node:path";

// ── Config ───────────────────────────────────────────────────────────────────
const BASE = (process.env.SITE_URL || "https://offanime.cc").replace(/\/+$/, "");
const HOME_API = (process.env.VITE_API_URL || "https://anime-details-api.vercel.app/api").replace(/\/+$/, "");
const TMDB_KEY = process.env.VITE_TMDB_API_KEY || "64b03fca3936439f3d3da531973e5ff9";
const ANIME_PAGES = Number(process.env.SITEMAP_ANIME_PAGES || 60);
const MAX_URLS = 5000;
const TODAY = new Date().toISOString().slice(0, 10);
const PUBLIC_DIR = path.resolve("public");

const INDEX_FILE = "sitemap_index.xml";
const MAIN_FILE = "sitemap-main.xml";
const ANIME_FILE = "sitemap-anime.xml"; // becomes sitemap-anime.xml, sitemap-anime2.xml… if >5000
const FILMS_FILE = "sitemap-films.xml";

const ANIME_CATEGORIES = ["most-popular", "most-favorite", "tv-series", "subbed-anime"];

const STATIC_PAGES = [
  "/", "/home", "/schedule", "/recently-updated", "/top-airing",
  "/most-favorite", "/latest-completed", "/movies", "/movies/trending",
  "/terms-of-service", "/dmca", "/contact",
];

const CATEGORY_ROUTES = [
  "recently-added", "top-upcoming", "subbed-anime", "dubbed-anime",
  "most-popular", "movies", "tv-series", "ovas", "onas", "specials",
];

const AZ_ROUTES = [
  "az-list", "az-list/other", "az-list/0-9",
  ..."abcdefghijklmnopqrstuvwxyz".split("").map((c) => `az-list/${c}`),
];

const GENRES = [
  "action", "adventure", "cars", "comedy", "dementia", "demons", "drama",
  "ecchi", "fantasy", "game", "harem", "historical", "horror", "isekai",
  "josei", "kids", "magic", "martial-arts", "mecha", "military", "music",
  "mystery", "parody", "police", "psychological", "romance", "samurai",
  "school", "sci-fi", "seinen", "shoujo", "shoujo-ai", "shounen", "shounen-ai",
  "slice-of-life", "space", "sports", "super-power", "supernatural", "thriller",
  "vampire",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Force pure-ASCII URLs: strip anything outside safe URL characters.
const asciiSafe = (s) => String(s).replace(/[^\x20-\x7E]/g, "");

function slugify(title, id) {
  const slug = String(title || "anime")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "anime"}-${id}`;
}

const urlEntry = (loc) =>
  `  <url>\n    <loc>${xmlEscape(asciiSafe(BASE + loc))}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`;

const wrapUrlset = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.join("\n") +
  `\n</urlset>\n`;

const wrapIndex = (files) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  files
    .map((f) => `  <sitemap>\n    <loc>${BASE}/${f}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`)
    .join("\n") +
  `\n</sitemapindex>\n`;

function write(file, content) {
  fs.writeFileSync(path.join(PUBLIC_DIR, file), content, { encoding: "utf8" });
  console.log(`  + ${file} (${(content.length / 1024).toFixed(1)} KB)`);
}

async function fetchJson(url, timeoutMs = 12000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`  ! fetch failed: ${url} -> ${e.message}`);
    return null;
  }
}

// ── sitemap-main.xml ─────────────────────────────────────────────────────────
function buildMain() {
  const entries = [];
  for (const p of STATIC_PAGES) entries.push(urlEntry(p));
  for (const c of CATEGORY_ROUTES) entries.push(urlEntry(`/${c}`));
  for (const a of AZ_ROUTES) entries.push(urlEntry(`/${a}`));
  for (const g of GENRES) entries.push(urlEntry(`/genre/${g}`));
  write(MAIN_FILE, wrapUrlset(entries));
  return entries.length;
}

// ── sitemap-anime.xml ────────────────────────────────────────────────────────
async function buildAnime() {
  const seen = new Map();
  for (const cat of ANIME_CATEGORIES) {
    for (let page = 1; page <= ANIME_PAGES; page++) {
      const data = await fetchJson(`${HOME_API}/category/${cat}?page=${page}`);
      const results = data?.results || data?.data?.results || [];
      if (!Array.isArray(results) || results.length === 0) break;
      for (const item of results) {
        const id = item?.id ?? item?.anilistId;
        if (id == null) continue;
        if (!seen.has(id)) seen.set(id, item.title || item.name || "anime");
      }
    }
  }

  const ids = [...seen.entries()];
  const files = [];
  if (ids.length === 0) {
    console.warn("  ! no anime ids collected - anime sitemap skipped");
    return { files, count: 0 };
  }

  let part = 1;
  for (let i = 0; i < ids.length; i += MAX_URLS) {
    const chunk = ids.slice(i, i + MAX_URLS);
    const entries = chunk.map(([id, title]) => urlEntry(`/${slugify(title, id)}`));
    const file = part === 1 ? ANIME_FILE : `sitemap-anime${part}.xml`;
    write(file, wrapUrlset(entries));
    files.push(file);
    part++;
  }
  return { files, count: ids.length };
}

// ── sitemap-films.xml ────────────────────────────────────────────────────────
async function buildFilms() {
  const collect = async (type, endpoints, pages) => {
    const ids = new Set();
    for (const ep of endpoints) {
      for (let p = 1; p <= pages; p++) {
        const data = await fetchJson(
          `https://api.themoviedb.org/3/${type}/${ep}?api_key=${TMDB_KEY}&language=en-US&page=${p}`
        );
        for (const item of data?.results || []) if (item.id) ids.add(item.id);
      }
    }
    return [...ids];
  };

  const movieIds = await collect("movie", ["popular", "top_rated"], 5);
  const tvIds = await collect("tv", ["popular", "top_rated"], 5);

  const entries = [
    ...movieIds.map((id) => urlEntry(`/movies/movie/${id}`)),
    ...tvIds.map((id) => urlEntry(`/movies/tv/${id}`)),
  ];

  if (entries.length === 0) {
    console.warn("  ! no TMDB ids collected - films sitemap skipped");
    return { built: false, movies: 0, tv: 0 };
  }
  write(FILMS_FILE, wrapUrlset(entries));
  return { built: true, movies: movieIds.length, tv: tvIds.length };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nBuilding NEW sitemap set for ${BASE}\n`);
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  // Purge EVERY old sitemap file (any naming scheme) so nothing stale ships.
  for (const f of fs.readdirSync(PUBLIC_DIR)) {
    if (/^sitemap.*\.xml$/i.test(f)) fs.rmSync(path.join(PUBLIC_DIR, f));
  }

  const children = [];

  const mainCount = buildMain();
  children.push(MAIN_FILE);

  const anime = await buildAnime();
  children.push(...anime.files);

  const films = await buildFilms();
  if (films.built) children.push(FILMS_FILE);

  write(INDEX_FILE, wrapIndex(children));

  console.log(
    `\nDone - ${mainCount} page URLs, ${anime.count} anime` +
      (films.built ? `, ${films.movies} movies + ${films.tv} TV shows` : "") +
      `\nSubmit to Google Search Console:  ${BASE}/${INDEX_FILE}\n`
  );
}

main().catch((err) => {
  console.error("Sitemap build failed, writing minimal valid fallback:", err);
  try {
    write(MAIN_FILE, wrapUrlset([urlEntry("/")]));
    write(INDEX_FILE, wrapIndex([MAIN_FILE]));
  } catch {}
  process.exitCode = 0; // never break the build
});
