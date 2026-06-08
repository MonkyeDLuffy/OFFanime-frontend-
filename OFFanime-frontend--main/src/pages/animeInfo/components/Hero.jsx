import { useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faXmark,
  faTv,
  faSignal,
  faCalendarDays,
  faClock,
  faClosedCaptioning,
  faMicrophone,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";
import { createAnimeSlug } from "@/src/utils/slug.utils";

function Hero({ anime, jikanInfo, tmdbInfo, tmdbLoading }) {
  const [expanded, setExpanded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const title =
    jikanInfo?.titleEnglish ||
    jikanInfo?.title ||
    anime?.title ||
    anime?.name ||
    anime?.animeTitle ||
    "Unknown Anime";

  const animeId = anime?.id || anime?.anilistId;
  const slug = createAnimeSlug(title, animeId);

  const poster =
    anime?.poster ||
    anime?.image ||
    jikanInfo?.poster ||
    jikanInfo?.image ||
    "";

  const banner =
    anime?.bannerImage ||
    anime?.banner ||
    anime?.coverImage?.extraLarge ||
    anime?.coverImage?.large ||
    anime?.cover ||
    anime?.image ||
    poster;

  const logo = tmdbInfo?.logo || null;

  const description =
    jikanInfo?.synopsis ||
    anime?.description ||
    anime?.animeDesc ||
    "No description available.";

  const cleanDescription = String(description)
    .replace(/<[^>]+>/g, "")
    .replace(/\[Written by MAL Rewrite\]/gi, "")
    .trim();

  const genres = jikanInfo?.genres?.length
    ? jikanInfo.genres
    : anime?.genres || [];

  const trailerUrl = getTrailerUrl(jikanInfo?.trailer);

  const type = jikanInfo?.type || anime?.type || anime?.format || "TV";
  const status = cleanStatus(jikanInfo?.status || anime?.status || "Unknown");
  const year = jikanInfo?.year || anime?.year || anime?.seasonYear || "N/A";
  const duration = cleanDuration(jikanInfo?.duration || anime?.duration);
  const rating = jikanInfo?.rating || anime?.rating || null;

  const totalEpisodes =
    jikanInfo?.episodes ||
    anime?.episodes ||
    anime?.totalEpisodes ||
    tmdbInfo?.totalReturned ||
    "N/A";

  const dubEpisodes = getDubEpisodes(anime, jikanInfo);
  const nextEpisode = getNextEpisode(anime, jikanInfo);

  const metaItems = [
    { icon: faTv, value: type },
    { icon: faSignal, value: status },
    { icon: faCalendarDays, value: year },
    { icon: faClock, value: duration },
    { icon: null, value: rating },
  ].filter((item) => item.value && item.value !== "N/A");

  const statItems = [
    {
      label: "Episodes",
      value: totalEpisodes,
      icon: faClosedCaptioning,
      light: false,
    },
    {
      label: "Dub Episodes",
      value: dubEpisodes,
      icon: faMicrophone,
      light: false,
    },
    {
      label: "Status",
      value: status,
      icon: faSignal,
      light: false,
    },
    {
      label: "Duration",
      value: duration,
      icon: faClock,
      light: false,
    },
    {
      label: "Next EP",
      value: nextEpisode,
      icon: faForwardStep,
      light: true,
    },
  ];

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#050505] min-h-[760px] lg:min-h-[820px]">
        <div className="absolute inset-0">
          {banner && (
            <img
              src={banner}
              alt={title}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] select-none pointer-events-none"
            />
          )}

          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050505]" />
          <div className="absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-[#050505] to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-14 2xl:px-20 pt-[125px]">
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] xl:grid-cols-[230px_1fr] gap-7 xl:gap-10 items-start">
              <div className="relative mx-auto lg:mx-0">
                <div className="relative w-[185px] sm:w-[200px] xl:w-[215px] h-[360px] sm:h-[390px] xl:h-[420px] rounded-[22px] overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] bg-black/40 backdrop-blur-xl">
                  {poster && (
                    <img
                      src={poster}
                      alt={title}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              </div>

              <div className="pt-1 max-w-[980px]">
                {tmdbLoading ? (
                  <div className="h-[90px]" />
                ) : logo ? (
                  <img
                    src={logo}
                    alt={title}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="max-w-[360px] sm:max-w-[430px] max-h-[120px] sm:max-h-[145px] object-contain object-left drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-[0.95] text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.9)]">
                    {title}
                  </h1>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {metaItems.map((item, index) => (
                    <MetaPill key={`${item.value}-${index}`} icon={item.icon} value={item.value} />
                  ))}
                </div>

                {genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {genres.slice(0, 6).map((genre) => {
                      const genreName = typeof genre === "string" ? genre : genre?.name;
                      if (!genreName) return null;

                      return (
                        <Link
                          key={genreName}
                          to={`/genre/${genreName.toLowerCase().replaceAll(" ", "-")}`}
                          className="px-3 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-md text-xs text-white hover:bg-white hover:text-black transition"
                        >
                          {genreName}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 max-w-[930px]">
                  {statItems.map((item) => (
                    <InfoBlock key={item.label} {...item} />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/watch/${slug}?ep=1`}
                    className="inline-flex items-center gap-3 rounded-full bg-white text-black px-7 py-3 text-sm font-black hover:bg-gray-200 transition-all"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Watch Now
                  </Link>

                  {trailerUrl && (
                    <button
                      onClick={() => setTrailerOpen(true)}
                      className="rounded-full bg-black/35 border border-white/10 text-white px-7 py-3 text-sm font-bold hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                      Trailer
                    </button>
                  )}
                </div>

                <div
                  className={`mt-7 text-gray-300 text-[15px] md:text-[16px] leading-[1.75] max-w-[980px] overflow-hidden transition-all duration-500 ${
                    expanded ? "max-h-[420px]" : "max-h-[112px]"
                  }`}
                >
                  <p>{cleanDescription}</p>
                </div>

                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="mt-5 text-xs uppercase tracking-[0.18em] text-gray-400 hover:text-white transition font-bold"
                >
                  {expanded ? "Show Less" : "Show More"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {trailerOpen && trailerUrl && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <iframe
              src={trailerUrl}
              title={`${title} Trailer`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

function MetaPill({ icon, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-gray-200 backdrop-blur-md hover:bg-white/10 hover:border-white/25 transition">
      {icon && <FontAwesomeIcon icon={icon} className="text-[11px] text-gray-300" />}
      <span className="line-clamp-1">{value}</span>
    </div>
  );
}

function InfoBlock({ label, value, icon, light = false }) {
  return (
    <div
      className={`group rounded-2xl border backdrop-blur-xl px-4 py-3 min-h-[72px] transition-all duration-300 ${
        light
          ? "bg-white text-black border-white hover:bg-gray-200"
          : "bg-black/35 text-white border-white/10 hover:bg-white/10 hover:border-white/25"
      }`}
    >
      <p className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] ${light ? "text-black/60" : "text-gray-500 group-hover:text-gray-300"}`}>
        {icon && <FontAwesomeIcon icon={icon} className="text-[11px]" />}
        {label}
      </p>
      <p className="mt-2 text-[15px] sm:text-base font-black leading-tight line-clamp-1">
        {value || "N/A"}
      </p>
    </div>
  );
}

function getTrailerUrl(trailer) {
  if (!trailer) return null;
  if (trailer.embedUrl) return trailer.embedUrl;
  if (trailer.youtube_id) return `https://www.youtube.com/embed/${trailer.youtube_id}`;

  if (trailer.url) {
    const match = trailer.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }

  return null;
}

function cleanStatus(value = "") {
  const text = String(value).replaceAll("_", " ").trim();
  if (!text) return "Unknown";

  const lower = text.toLowerCase();
  if (lower.includes("currently airing") || lower.includes("releasing") || lower.includes("airing")) {
    return "Airing";
  }
  if (lower.includes("finished") || lower.includes("completed")) return "Completed";
  if (lower.includes("not yet")) return "Upcoming";

  return text
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function cleanDuration(value) {
  if (!value) return "N/A";
  const text = String(value);
  if (/min/i.test(text)) return text.replace("per ep", "").trim();
  const num = Number(text);
  if (Number.isFinite(num)) return `${num} min`;
  return text;
}

function getDubEpisodes(anime, jikanInfo) {
  const candidates = [
    anime?.dubEpisodes,
    anime?.dubEpisode,
    anime?.dub,
    anime?.tvInfo?.dub,
    anime?.animeInfo?.Dub,
    anime?.animeInfo?.Dubbed,
    jikanInfo?.dubEpisodes,
  ];

  for (const item of candidates) {
    if (item === undefined || item === null || item === "") continue;
    const num = Number(String(item).replace(/[^0-9]/g, ""));
    if (Number.isFinite(num) && num > 0) return num;
  }

  return "N/A";
}

function getNextEpisode(anime, jikanInfo) {
  const next =
    anime?.nextAiringEpisode ||
    anime?.nextEpisode ||
    jikanInfo?.nextAiringEpisode ||
    jikanInfo?.broadcast?.string ||
    anime?.broadcast?.string ||
    anime?.broadcast;

  if (!next) return "Schedule";

  if (typeof next === "string") return next;

  const ep = next.episode ? `EP ${next.episode}` : "Next EP";

  if (next.airingAt) {
    const date = new Date(Number(next.airingAt) * 1000);
    if (!Number.isNaN(date.getTime())) {
      return `${ep} • ${date.toLocaleString("en-IN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }

  return ep;
}

export default memo(Hero);
