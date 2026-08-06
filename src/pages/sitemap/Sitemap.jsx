import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import website_name from "@/src/config/website.js";

/**
 * HTML Sitemap page — /sitemap
 * ─────────────────────────────────────────────────────────────────────────────
 * A user-facing, SEO-friendly map of the whole site. Purely navigational: it
 * links to every browsable SECTION (main pages, browse categories, genres,
 * A-Z, movies/TV, legal) with clean internal links so crawlers can discover the
 * full structure in one hop and PageRank flows evenly across the site.
 *
 * Design matches the existing dark / purple (#a855f7) aesthetic used across the
 * legal pages. Fully responsive, semantic (<main>/<section>/<nav>/<ul>), and
 * accessible (aria-labelled sections, focusable links).
 */

const SITE_URL = "https://offanime.cc";

// ── Section data ──────────────────────────────────────────────────────────────
const MAIN_PAGES = [
  { to: "/home", label: "Home" },
  { to: "/schedule", label: "Estimated Schedule" },
  { to: "/recently-updated", label: "Recently Updated" },
  { to: "/top-airing", label: "Top Airing" },
  { to: "/most-favorite", label: "Most Favorite" },
  { to: "/latest-completed", label: "Latest Completed" },
];

const BROWSE_CATEGORIES = [
  { to: "/recently-added", label: "Recently Added" },
  { to: "/top-upcoming", label: "Top Upcoming" },
  { to: "/subbed-anime", label: "Subbed Anime" },
  { to: "/dubbed-anime", label: "Dubbed Anime" },
  { to: "/most-popular", label: "Most Popular" },
  { to: "/tv-series", label: "TV Series" },
  { to: "/ovas", label: "OVAs" },
  { to: "/onas", label: "ONAs" },
  { to: "/specials", label: "Specials" },
];

const MOVIES_TV = [
  { to: "/movies", label: "Movies & TV Home" },
  { to: "/movies/trending", label: "Trending" },
  { to: "/movies/category/popular-movies", label: "Popular Movies" },
  { to: "/movies/category/now-playing", label: "Now Playing" },
  { to: "/movies/category/popular-tv", label: "Popular TV" },
  { to: "/movies/category/top-movies", label: "Top Rated Movies" },
  { to: "/movies/category/top-tv", label: "Top Rated TV" },
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

const AZ_ITEMS = [
  { key: "All", to: "/az-list" },
  { key: "#", to: "/az-list/other" },
  { key: "0-9", to: "/az-list/0-9" },
  ..."abcdefghijklmnopqrstuvwxyz".split("").map((c) => ({
    key: c.toUpperCase(),
    to: `/az-list/${c}`,
  })),
];

const LEGAL = [
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/dmca", label: "DMCA" },
  { to: "/contact", label: "Contact" },
];

// ── Small presentational helpers ────────────────────────────────────────────────
function SectionCard({ id, title, subtitle, icon, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[#a855f7]/40"
    >
      <header className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a855f7]/15 text-[#c084fc]"
        >
          {icon}
        </span>
        <div>
          <h2
            id={`${id}-heading`}
            className="text-lg font-semibold text-white"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-white/40">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function LinkList({ items, ariaLabel }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70 transition-colors duration-200 hover:bg-[#a855f7]/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/20 transition-colors duration-200 group-hover:bg-[#a855f7]"
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PillList({ items, ariaLabel }) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="inline-flex items-center rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-sm capitalize text-white/60 transition-colors duration-200 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60"
            >
              {item.label ?? item.key ?? item.to}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Simple inline SVG icons (no extra dependency, crisp on all DPRs).
const Icon = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></svg>
  ),
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  film: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
  ),
  tag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>
  ),
  az: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16 7 8l3 8M4.8 14h4.4M14 8h5l-5 8h5" /></svg>
  ),
  scale: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 21h10M5 7l14-2M5 7 2 13a3 3 0 0 0 6 0Zm14-2-3 6a3 3 0 0 0 6 0Z" /></svg>
  ),
};

function Sitemap() {
  return (
    <main className="mx-auto max-w-6xl pt-14 pb-10">
      <Helmet>
        <title>Sitemap | {website_name}</title>
        <meta
          name="description"
          content={`Browse the full ${website_name} sitemap — all main pages, anime categories, genres, the A-Z list, Movies & TV sections and legal pages in one place.`}
        />
        <link rel="canonical" href={`${SITE_URL}/sitemap`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Hero */}
      <header className="mb-10 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c084fc]">
          Site Map
        </span>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Explore {website_name}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
          Every section of the site, neatly organised. Jump straight to main
          pages, browse anime by category or genre, explore the A-Z list, dive
          into Movies &amp; TV, or read our legal pages.
        </p>
      </header>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard
          id="main-pages"
          title="Main Pages"
          subtitle="Core navigation"
          icon={Icon.home}
        >
          <LinkList items={MAIN_PAGES} ariaLabel="Main pages" />
        </SectionCard>

        <SectionCard
          id="browse-categories"
          title="Browse Categories"
          subtitle="Explore anime by type"
          icon={Icon.grid}
        >
          <LinkList items={BROWSE_CATEGORIES} ariaLabel="Browse categories" />
        </SectionCard>

        <SectionCard
          id="movies-tv"
          title="Movies &amp; TV"
          subtitle="Powered by TMDB"
          icon={Icon.film}
        >
          <LinkList items={MOVIES_TV} ariaLabel="Movies and TV" />
        </SectionCard>

        <SectionCard
          id="genres"
          title="Genres"
          subtitle={`${GENRES.length} genres to discover`}
          icon={Icon.tag}
        >
          <PillList
            items={GENRES.map((g) => ({
              to: `/genre/${g}`,
              label: g.replace(/-/g, " "),
            }))}
            ariaLabel="Anime genres"
          />
        </SectionCard>

        <SectionCard
          id="az-list"
          title="A-Z List"
          subtitle="Browse alphabetically"
          icon={Icon.az}
        >
          <PillList items={AZ_ITEMS} ariaLabel="A to Z list" />
        </SectionCard>

        <SectionCard
          id="legal"
          title="Legal &amp; Info"
          subtitle="Policies and contact"
          icon={Icon.scale}
        >
          <LinkList items={LEGAL} ariaLabel="Legal and info" />
        </SectionCard>
      </div>

      {/* XML sitemap hint for power users / SEO tools */}
      <footer className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
        <p className="text-sm text-white/50">
          Looking for the machine-readable sitemap? Search engines can crawl our{" "}
          <a
            href="/sitemap.xml"
            className="font-medium text-[#c084fc] underline decoration-[#a855f7]/40 underline-offset-2 transition-colors hover:text-white"
          >
            XML sitemap
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

export default Sitemap;
