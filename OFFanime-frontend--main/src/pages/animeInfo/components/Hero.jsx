import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { createAnimeSlug } from "@/src/utils/slug.utils";

export default function Hero({ anime }) {
  const [expanded, setExpanded] = useState(false);

  const title =
    anime?.title ||
    anime?.name ||
    anime?.animeTitle ||
    anime?.englishTitle ||
    anime?.romajiTitle ||
    "Unknown Anime";

  const animeId = anime?.id;
  const slug = createAnimeSlug(title, animeId);

  const poster =
    anime?.poster ||
    anime?.image ||
    anime?.coverImage?.extraLarge ||
    anime?.coverImage?.large ||
    anime?.coverImage ||
    "";

  const banner =
    anime?.bannerImage ||
    anime?.banner ||
    anime?.coverImage?.extraLarge ||
    anime?.coverImage?.large ||
    anime?.cover ||
    anime?.image ||
    poster;

  const info = anime?.animeInfo || {};

  const description =
    info?.Overview ||
    anime?.description ||
    anime?.animeDesc ||
    anime?.desc ||
    "No description available.";

  const genres = info?.Genres || anime?.genres || [];

  const type = anime?.type || anime?.format || info?.Type || "TV";
  const status = anime?.status || info?.Status || "Unknown";
  const studios = anime?.studios || info?.Studios || anime?.producers || [];

  const cleanDescription = String(description).replace(/<[^>]+>/g, "");

  return (
    <section
      className={`relative w-full overflow-hidden bg-black transition-all duration-500 ${
        expanded ? "min-h-[850px]" : "min-h-[720px]"
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

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-[#050505]" />
        <div className="absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1450px] mx-auto px-6 lg:px-10 pt-[150px]">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-7 items-start">
          <div className="relative">
            <div className="relative w-[190px] md:w-[220px] h-[350px] md:h-[470px] rounded-[18px] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] bg-black">
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover object-center scale-[1.015]"
                loading="eager"
                fetchPriority="high"
              />

              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            </div>
          </div>

          <div className="max-w-[900px] pt-4">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black leading-[0.98] tracking-tight text-white drop-shadow-[0_5px_30px_rgba(0,0,0,0.9)] max-w-[850px]">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-gray-300">
              {type && <span>{type}</span>}
              {status && <span>{status}</span>}
              {Array.isArray(studios) && studios.length > 0 && (
                <span>{studios.slice(0, 4).join(", ")}</span>
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

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/watch/${slug}?ep=1`}
                className="inline-flex items-center gap-3 rounded-full bg-white text-black px-7 py-3 text-sm font-extrabold hover:bg-gray-200 transition shadow-2xl"
              >
                <FontAwesomeIcon icon={faPlay} />
                Watch Now
              </Link>

              <button className="rounded-full bg-black/35 border border-white/10 text-white px-7 py-3 text-sm font-bold hover:bg-white/10 transition backdrop-blur-md">
                Trailer
              </button>
            </div>

            <div
              className={`mt-6 text-gray-300 text-[15px] md:text-[16px] leading-[1.65] max-w-[820px] drop-shadow-xl transition-all duration-500 overflow-hidden ${
                expanded ? "max-h-[260px]" : "max-h-[105px]"
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
          </div>
        </div>
      </div>
    </section>
  );
}
