/* eslint-disable react/prop-types */
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faStar,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import getSafeTitle from "@/src/utils/getSafetitle";
import { createAnimeSlug } from "@/src/utils/slug.utils";
import useMomentumScroll from "@/src/movies/hooks/useMomentumScroll";

/**
 * AnimeTop10Rail — the premium, Netflix-style "TOP 10 / CONTENT TODAY" rail on
 * the anime home page. Placed directly under the spotlight.
 *
 * • GIANT outlined rank number sits BEHIND each poster and ignites CRIMSON RED
 *   on hover (`.top10-rank` in index.css) — only the number glows.
 * • Poster lifts + zooms with a soft pink glow; title/meta reveal smoothly.
 * • Uses the shared universal smooth scroller (wheel / trackpad / drag / touch +
 *   inertial momentum) via the `.hz-scroll` class, so it glides on every device
 *   with zero vertical wobble.
 *
 * Uses ONLY existing home-API data (topten, falling back to trending) — no new
 * API calls are introduced.
 */
export default function AnimeTop10Rail({ data = [] }) {
  const { language } = useLanguage();
  const top10 = (Array.isArray(data) ? data : []).slice(0, 10);
  const { trackRef, dragging, handlers, scrollByPage } = useMomentumScroll();

  if (top10.length === 0) return null;

  return (
    <section
      className="w-full mt-10"
      id="anime-top-10"
      aria-label="Top 10 anime today"
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-6 max-[575px]:mb-4">
        <div className="flex items-center gap-x-4">
          <h2
            className="font-black leading-none tracking-tight text-transparent text-[54px] max-[575px]:text-[38px]"
            style={{ WebkitTextStroke: "2px rgba(255,255,255,0.5)" }}
          >
            TOP 10
          </h2>
          <div className="border-l-2 border-white/30 pl-4 leading-tight">
            <p className="text-white font-bold uppercase text-[15px] max-[575px]:text-[12px] tracking-wide">
              Content
            </p>
            <p className="text-white font-bold uppercase text-[15px] max-[575px]:text-[12px] tracking-wide">
              Today
            </p>
          </div>
        </div>

        <nav
          className="flex items-center gap-x-2 max-[575px]:hidden"
          aria-label="Top 10 navigation"
        >
          <button
            onClick={() => scrollByPage(-1)}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ffbade] hover:text-black text-white flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <button
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ffbade] hover:text-black text-white flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </nav>
      </header>

      {/* Scroller */}
      <ul
        ref={trackRef}
        {...handlers}
        className={`hz-scroll flex items-end gap-x-3 max-[575px]:gap-x-1 pb-4 pt-2 pl-2 m-0 list-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {top10.map((item, idx) => {
          const rank = idx + 1;
          const id = item.id || item.anilistId || item.malId;
          const title = getSafeTitle(
            item.title || item.name,
            language,
            item.japanese_title || item.titleJapanese
          );
          const poster = item.poster || item.image || item.cover || "";
          const sub = item.tvInfo?.sub ?? item.sub;
          const dub = item.tvInfo?.dub ?? item.dub;
          const score = item.score || item.rating;

          return (
            <li
              key={`${id}-${idx}`}
              className="group/top10 top10-item relative shrink-0 flex items-end"
            >
              <span
                className="top10-rank font-black leading-none select-none pointer-events-none text-[190px] max-[575px]:text-[120px] -mr-[54px] max-[575px]:-mr-[34px] translate-y-[8px] group-hover/top10:translate-y-[2px]"
                aria-hidden="true"
              >
                {rank}
              </span>

              <Link
                to={`/${createAnimeSlug(item.title || item.name, id)}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                draggable={false}
                aria-label={`${title} — ranked #${rank}`}
                className="relative z-10 block w-[186px] max-[575px]:w-[128px] rounded-xl overflow-hidden bg-[#151515] ring-1 ring-white/[0.06] shadow-lg transition-all duration-500 ease-out group-hover/top10:-translate-y-2 group-hover/top10:ring-[#ffbade]/50 group-hover/top10:shadow-[0_22px_55px_rgba(255,186,222,0.22)]"
              >
                <div className="relative w-full pb-[150%]">
                  {poster ? (
                    <img
                      src={poster}
                      alt={title}
                      loading={idx < 4 ? "eager" : "lazy"}
                      decoding="async"
                      fetchpriority={idx < 4 ? "high" : "low"}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover/top10:scale-[1.08]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#ffffff40] text-xs">
                      No image
                    </div>
                  )}

                  {score && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-x-1 bg-black/70 backdrop-blur-sm text-[#fbbf24] text-[11px] font-bold px-1.5 py-0.5 rounded">
                      <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                      {score}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-[#ffbade] text-black text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                    {item.type || item.format || "TV"}
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover/top10:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-2 opacity-0 group-hover/top10:translate-y-0 group-hover/top10:opacity-100 transition-all duration-500">
                    <p className="text-white text-[13px] font-semibold line-clamp-2 leading-snug">
                      {title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {sub && (
                        <span className="inline-flex items-center gap-1 bg-white/15 px-1.5 py-0.5 rounded text-[10px] text-white">
                          <FontAwesomeIcon
                            icon={faClosedCaptioning}
                            className="text-[8px]"
                          />
                          {sub}
                        </span>
                      )}
                      {dub && (
                        <span className="inline-flex items-center gap-1 bg-white/15 px-1.5 py-0.5 rounded text-[10px] text-white">
                          <FontAwesomeIcon
                            icon={faMicrophone}
                            className="text-[8px]"
                          />
                          {dub}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
