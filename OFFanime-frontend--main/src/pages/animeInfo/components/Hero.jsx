import { useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faXmark,
  faClock,
  faTv,
  faCalendarDays,
  faClosedCaptioning,
  faMicrophone,
  faSignal,
  faForward,
} from "@fortawesome/free-solid-svg-icons";
import { createAnimeSlug } from "@/src/utils/slug.utils";

function Hero({
  anime,
  jikanInfo,
  tmdbInfo,
  tmdbLoading,
  episodes = [],
  episodesLoading = false,
}) {
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

  const type = jikanInfo?.type || anime?.type || anime?.format || "TV";
  const status = jikanInfo?.status || anime?.status || "Unknown";
  const year = jikanInfo?.year || anime?.year || anime?.seasonYear || "";
  const duration =
    jikanInfo?.duration ||
    anime?.duration ||
    anime?.animeInfo?.Duration ||
    "";
  const rating = jikanInfo?.rating || anime?.rating || "";

  const totalEpisodes =
    episodes?.length ||
    Number(jikanInfo?.episodes) ||
    Number(anime?.episodes) ||
    Number(anime?.totalEpisodes) ||
    anime?.animeInfo?.Episodes ||
    "N/A";

  const dubEpisodes =
    anime?.dubEpisodes ||
    anime?.dubEpisode ||
    anime?.animeInfo?.Dub ||
    anime?.animeInfo?.Dubbed ||
    anime?.tvInfo?.dub ||
    tmdbInfo?.dubEpisodes ||
    null;

  const nextEpisode = useMemo(
    () => getNextEpisodeInfo(anime, jikanInfo),
    [anime, jikanInfo]
  );

  const trailerUrl = getTrailerUrl(jikanInfo?.trailer);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#050505] min-h-[620px] md:min-h-[680px]">
        <div className="absolute inset-0">
          {banner && (
            <img
              src={banner}
              alt={title}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.04] select-none pointer-events-none"
            />
          )}

          <div className="absolute inset-0 bg-black/52" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#050505]" />
          <div className="absolute inset-0 backdrop-blur-[1.2px]" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 pt-[110px] md:pt-[125px]">
          <div className="max-w-[1620px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[185px_1fr] xl:grid-cols-[205px_1fr] gap-6 md:gap-8 items-start">
              <div className="relative mx-auto lg:mx-0">
                <div className="relative w-[155px] sm:w-[175px] xl:w-[195px] h-[225px] sm:h-[255px] xl:h-[285px] rounded-[18px] overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] bg-black/45 backdrop-blur-xl">
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
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              </div>

              <div className="pt-1 max-w-[1060px] text-center lg:text-left">
                {tmdbLoading ? (
                  <div className="h-[80px]" />
                ) : logo ? (
                  <img
                    src={logo}
                    alt={title}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="mx-auto lg:mx-0 max-w-[300px] sm:max-w-[370px] md:max-w-[430px] max-h-[105px] md:max-h-[125px] object-contain object-left drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[0.98] text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.9)] max-w-[800px] mx-auto lg:mx-0">
                    {title}
                  </h1>
                )}

                <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-2">
                  <MetaPill icon={faTv} label={type} />
                  <MetaPill icon={faSignal} label={status} />
                  {year && <MetaPill icon={faCalendarDays} label={year} />}
                  {duration && <MetaPill icon={faClock} label={duration} />}
                  {rating && <MetaPill label={rating} />}
                </div>

                {genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
                    {genres.slice(0, 7).map((genre) => {
                      const genreName =
                        typeof genre === "string" ? genre : genre?.name;

                      if (!genreName) return null;

                      return (
                        <Link
                          key={genreName}
                          to={`/genre/${genreName
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                          className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs text-white hover:bg-white hover:text-black hover:border-white transition"
                        >
                          {genreName}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-[920px] mx-auto lg:mx-0">
                  <StatCard
                    icon={faClosedCaptioning}
                    label="Episodes"
                    value={episodesLoading ? "..." : totalEpisodes}
                  />
                  <StatCard
                    icon={faMicrophone}
                    label="Dub Episodes"
                    value={dubEpisodes || "Check"}
                  />
                  <StatCard icon={faSignal} label="Status" value={status} />
                  <StatCard icon={faClock} label="Duration" value={duration || "N/A"} />
                  <StatCard icon={faForward} label="Next Ep" value={nextEpisode.short} highlight />
                </div>

                <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                  <Link
                    to={`/watch/${slug}?ep=1`}
                    className="inline-flex items-center gap-3 rounded-full bg-white text-black px-7 py-3 text-sm font-black hover:bg-gray-200 transition-all shadow-[0_15px_40px_rgba(255,255,255,0.12)]"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Watch Now
                  </Link>

                  {trailerUrl && (
                    <button
                      onClick={() => setTrailerOpen(true)}
                      className="rounded-full bg-black/40 border border-white/10 text-white px-7 py-3 text-sm font-bold hover:bg-white/10 hover:border-white/25 transition-all backdrop-blur-md"
                    >
                      Trailer
                    </button>
                  )}
                </div>

                <div
                  className={`mt-6 text-gray-300 text-[14px] md:text-[16px] leading-[1.75] max-w-[980px] mx-auto lg:mx-0 overflow-hidden transition-all duration-500 ${
                    expanded ? "max-h-[420px]" : "max-h-[112px]"
                  }`}
                >
                  <p>{cleanDescription}</p>
                </div>

                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-400 hover:text-white transition font-bold"
                >
                  {expanded ? "Show Less" : "Show More"}
                </button>

                {nextEpisode.full && (
                  <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl px-4 py-3 text-sm text-gray-300">
                    <span className="text-white font-bold">Next Episode:</span>
                    <span>{nextEpisode.full}</span>
                  </div>
                )}
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

function MetaPill({ icon, label }) {
  if (!label) return null;

  return (
    <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-gray-300 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 hover:text-white">
      {icon && <FontAwesomeIcon icon={icon} className="text-[11px] text-white/80" />}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, highlight = false }) {
  return (
    <div
      className={`group rounded-2xl border backdrop-blur-xl px-4 py-3 transition duration-300 hover:-translate-y-1 ${
        highlight
          ? "bg-white text-black border-white hover:bg-gray-200"
          : "bg-black/38 border-white/10 hover:bg-white/10 hover:border-white/25"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={`text-sm ${highlight ? "text-black" : "text-white/80"}`}
          />
        )}
        <p className={`text-[10px] uppercase tracking-[0.14em] ${highlight ? "text-black/65" : "text-gray-500"}`}>
          {label}
        </p>
      </div>
      <p className={`mt-2 font-black text-lg leading-tight line-clamp-1 ${highlight ? "text-black" : "text-white"}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

function getTrailerUrl(trailer) {
  if (!trailer) return null;

  if (trailer.embedUrl) return trailer.embedUrl;

  if (trailer.youtube_id) {
    return `https://www.youtube.com/embed/${trailer.youtube_id}`;
  }

  if (trailer.youtubeId) {
    return `https://www.youtube.com/embed/${trailer.youtubeId}`;
  }

  if (trailer.url) {
    const match = trailer.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

function getNextEpisodeInfo(anime, jikanInfo) {
  const next =
    anime?.nextAiringEpisode ||
    anime?.airingEpisode ||
    anime?.animeInfo?.nextAiringEpisode ||
    null;

  const episodeNumber = next?.episode || next?.number || null;
  const airingAt = next?.airingAt || next?.timeUntilAiring || null;

  if (episodeNumber && next?.airingAt) {
    return {
      short: `EP ${episodeNumber}`,
      full: `EP ${episodeNumber} drops in ${formatCountdown(next.airingAt)}`,
    };
  }

  if (episodeNumber) {
    return {
      short: `EP ${episodeNumber}`,
      full: `EP ${episodeNumber} coming soon`,
    };
  }

  if (jikanInfo?.broadcast?.string) {
    return {
      short: "Schedule",
      full: jikanInfo.broadcast.string,
    };
  }

  if (/airing|releasing|currently/i.test(String(anime?.status || jikanInfo?.status || ""))) {
    return {
      short: "Soon",
      full: "Next episode date will update soon",
    };
  }

  return {
    short: "N/A",
    full: "",
  };
}

function formatCountdown(airingAt) {
  const now = Math.floor(Date.now() / 1000);
  const seconds = Number(airingAt) - now;

  if (!Number.isFinite(seconds) || seconds <= 0) return "soon";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default memo(Hero);
