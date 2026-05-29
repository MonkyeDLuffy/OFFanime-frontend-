import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faXmark } from "@fortawesome/free-solid-svg-icons";
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

  const genres = jikanInfo?.genres?.length
    ? jikanInfo.genres
    : anime?.genres || [];

  const type = jikanInfo?.type || anime?.type || anime?.format || "TV";
  const status = jikanInfo?.status || anime?.status || "Unknown";

  const studios = jikanInfo?.studios?.length
    ? jikanInfo.studios
    : anime?.studios || [];

  const trailerUrl = getTrailerUrl(jikanInfo?.trailer);

  const cleanDescription = String(description)
    .replace(/<[^>]+>/g, "")
    .replace(/\[Written by MAL Rewrite\]/gi, "")
    .trim();

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#050505] min-h-[760px]">
        <div className="absolute inset-0">
          {banner && (
            <img
              src={banner}
              alt={title}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center scale-[1.06] select-none pointer-events-none"
            />
          )}

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />
          <div className="absolute inset-0 backdrop-blur-[1.5px]" />
        </div>

        <div className="relative z-10 w-full px-5 lg:px-10 pt-[130px]">
          <div className="max-w-[1550px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
              <div className="relative">
                <div className="relative w-[200px] md:w-[240px] h-[320px] md:h-[420px] rounded-[22px] overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] bg-black/40 backdrop-blur-xl">
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

              <div className="pt-2 max-w-[1050px]">
                {tmdbLoading ? (
                  <div className="h-[110px]" />
                ) : logo ? (
                  <img
                    src={logo}
                    alt={title}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="max-w-[500px] max-h-[170px] object-contain object-left drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black leading-[0.95] text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.9)]">
                    {title}
                  </h1>
                )}

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-300">
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
                  <div className="mt-5 flex flex-wrap gap-2">
                    {genres.slice(0, 8).map((genre) => {
                      const genreName =
                        typeof genre === "string" ? genre : genre?.name;

                      if (!genreName) return null;

                      return (
                        <Link
                          key={genreName}
                          to={`/genre/${genreName
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                          className="px-3 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-md text-xs text-white hover:bg-white hover:text-black transition"
                        >
                          {genreName}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {jikanInfo && (
                  <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[820px]">
                    <Stat label="MAL SCORE" value={jikanInfo.score || "N/A"} />
                    <Stat label="RANK" value={jikanInfo.rank ? `#${jikanInfo.rank}` : "N/A"} />
                    <Stat label="POPULARITY" value={jikanInfo.popularity ? `#${jikanInfo.popularity}` : "N/A"} />
                    <Stat label="MEMBERS" value={formatNumber(jikanInfo.members)} />
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to={`/watch/${slug}?ep=1`}
                    className="inline-flex items-center gap-3 rounded-full bg-white text-black px-8 py-3 text-sm font-black hover:bg-gray-200 transition-all"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Watch Now
                  </Link>

                  {trailerUrl && (
                    <button
                      onClick={() => setTrailerOpen(true)}
                      className="rounded-full bg-black/35 border border-white/10 text-white px-8 py-3 text-sm font-bold hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                      Trailer
                    </button>
                  )}
                </div>

                <div
                  className={`mt-7 text-gray-300 text-[15px] md:text-[17px] leading-[1.8] max-w-[980px] overflow-hidden transition-all duration-500 ${
                    expanded ? "max-h-[420px]" : "max-h-[120px]"
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

                {jikanInfo?.broadcast?.string && (
                  <p className="mt-6 text-sm text-gray-500">
                    Broadcast: {jikanInfo.broadcast.string}
                  </p>
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

function getTrailerUrl(trailer) {
  if (!trailer) return null;

  if (trailer.embedUrl) return trailer.embedUrl;

  if (trailer.youtube_id) {
    return `https://www.youtube.com/embed/${trailer.youtube_id}`;
  }

  if (trailer.url) {
    const match = trailer.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/35 border border-white/10 backdrop-blur-xl px-5 py-4">
      <p className="text-white font-black text-2xl">{value || "N/A"}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mt-2">
        {label}
      </p>
    </div>
  );
}

function formatNumber(value) {
  if (!value) return "N/A";
  return Number(value).toLocaleString();
}

export default memo(Hero);
