import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faXmark } from "@fortawesome/free-solid-svg-icons";
import { createAnimeSlug } from "@/src/utils/slug.utils";

export default function Hero({ anime, jikanInfo, tmdbInfo, tmdbLoading }) {
  const [expanded, setExpanded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const title =
    jikanInfo?.titleEnglish ||
    jikanInfo?.title ||
    anime?.title ||
    anime?.name ||
    anime?.animeTitle ||
    "Unknown Anime";

  const animeId = anime?.id;
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

  const genres = jikanInfo?.genres?.length ? jikanInfo.genres : anime?.genres || [];
  const type = jikanInfo?.type || anime?.type || anime?.format || "TV";
  const status = jikanInfo?.status || anime?.status || "Unknown";
  const studios = jikanInfo?.studios?.length ? jikanInfo.studios : anime?.studios || [];
  const trailerUrl = jikanInfo?.trailer?.embedUrl;

  const cleanDescription = String(description)
    .replace(/<[^>]+>/g, "")
    .replace(/\[Written by MAL Rewrite\]/gi, "")
    .trim();

  return (
    <>
      <section
        className={`relative w-full overflow-hidden bg-black transition-all duration-500 ${
          expanded ? "min-h-[900px]" : "min-h-[740px]"
        }`}
      >
        <div className="absolute inset-0">
          {banner && (
            <img
              src={banner}
              alt={title}
              className="w-full h-full object-cover object-center opacity-90"
              loading="eager"
              fetchPriority="high"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-[#050505]" />
          <div className="absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1450px] mx-auto px-6 lg:px-10 pt-[150px]">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-7 items-start">
            <div className="relative">
              <div className="relative w-[190px] md:w-[220px] h-[350px] md:h-[470px] rounded-[18px] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] bg-black">
                {poster && (
                  <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover object-center scale-[1.015]"
                    loading="eager"
                    fetchPriority="high"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              </div>
            </div>

            <div className="max-w-[950px] pt-4">
              {tmdbLoading ? (
                <div className="w-[360px] max-w-full h-[95px] rounded-xl bg-white/10 animate-pulse mb-5" />
              ) : logo ? (
                <img
                  src={logo}
                  alt={title}
                  className="max-w-[420px] max-h-[150px] object-contain object-left drop-shadow-[0_8px_35px_rgba(0,0,0,0.95)] mb-5"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black leading-[0.98] tracking-tight text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.9)] max-w-[900px]">
                  {title}
                </h1>
              )}

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-gray-300">
                {type && <span>{type}</span>}
                {status && <span>{status}</span>}
                {jikanInfo?.year && <span>{jikanInfo.year}</span>}
                {jikanInfo?.duration && <span>{jikanInfo.duration}</span>}
                {jikanInfo?.rating && <span>{jikanInfo.rating}</span>}
                {Array.isArray(studios) && studios.length > 0 && (
                  <span>{studios.slice(0, 3).join(", ")}</span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.slice(0, 8).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full bg-black/35 border border-white/10 text-xs text-white backdrop-blur-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {jikanInfo && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[720px]">
                  <Stat label="MAL Score" value={jikanInfo.score || "N/A"} />
                  <Stat label="Rank" value={jikanInfo.rank ? `#${jikanInfo.rank}` : "N/A"} />
                  <Stat label="Popularity" value={jikanInfo.popularity ? `#${jikanInfo.popularity}` : "N/A"} />
                  <Stat label="Members" value={formatNumber(jikanInfo.members)} />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/watch/${slug}?ep=1`}
                  className="inline-flex items-center gap-3 rounded-full bg-white text-black px-7 py-3 text-sm font-extrabold hover:bg-gray-200 transition shadow-2xl"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Watch Now
                </Link>

                {trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="rounded-full bg-black/35 border border-white/10 text-white px-7 py-3 text-sm font-bold hover:bg-white/10 transition backdrop-blur-md"
                  >
                    Trailer
                  </button>
                )}
              </div>

              <div
                className={`mt-6 text-gray-300 text-[15px] md:text-[16px] leading-[1.65] max-w-[860px] drop-shadow-xl transition-all duration-500 overflow-hidden ${
                  expanded ? "max-h-[360px]" : "max-h-[105px]"
                }`}
              >
                <p>{cleanDescription}</p>
              </div>

              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-5 text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-white font-bold transition"
              >
                {expanded ? "Show Less" : "Show More"}
              </button>

              {jikanInfo?.broadcast?.string && (
                <p className="mt-5 text-sm text-gray-500">
                  Broadcast: {jikanInfo.broadcast.string}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {trailerOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center px-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/35 border border-white/10 px-4 py-3 backdrop-blur-md">
      <p className="text-white font-black text-lg">{value || "N/A"}</p>
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mt-1">
        {label}
      </p>
    </div>
  );
}

function formatNumber(value) {
  if (!value) return "N/A";
  return Number(value).toLocaleString();
}
