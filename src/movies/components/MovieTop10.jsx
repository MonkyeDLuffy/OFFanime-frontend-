/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import useMomentumScroll from "../hooks/useMomentumScroll";

/**
 * Netflix-style "Top 10 Today" rail for the live-action Movies/TV section.
 *
 * Each item shows a GIANT outlined rank number (1-10) sitting BEHIND the poster
 * card. On hover the number ignites CRIMSON RED (`.top10-rank`) while the poster
 * lifts + zooms with a purple glow that matches the rest of the Movies section.
 *
 * Uses the shared universal smooth scroller via `.hz-scroll` (wheel / trackpad /
 * drag / touch + momentum, zero vertical wobble) — identical feel to every other
 * rail in the app.
 */
export default function MovieTop10({ items = [] }) {
  const top10 = items.slice(0, 10);

  const { trackRef, dragging, handlers, scrollByPage } = useMomentumScroll();

  if (top10.length === 0) return null;

  return (
    <section className="w-full" id="movies-top-10" aria-label="Top 10 today">
      {/* Header — "TOP 10 / CONTENT TODAY" */}
      <header className="flex items-center justify-between mb-6 max-[575px]:mb-4">
        <div className="flex items-center gap-x-4">
          <h2
            className="font-black leading-none tracking-tight text-transparent text-[54px] max-[575px]:text-[38px]"
            style={{ WebkitTextStroke: "2px rgba(255,255,255,0.55)" }}
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
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#a855f7] text-white flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <button
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#a855f7] text-white flex items-center justify-center transition-colors duration-300"
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
          const infoPath = `/movies/${item.type}/${item.id}`;
          return (
            <li
              key={`${item.type}-${item.id}`}
              className="group/top10 top10-item relative shrink-0 flex items-end"
            >
              {/* Giant outlined rank number sitting BEHIND the card */}
              <span
                className="top10-rank font-black leading-none select-none pointer-events-none text-[190px] max-[575px]:text-[120px] -mr-[54px] max-[575px]:-mr-[34px] translate-y-[8px] group-hover/top10:translate-y-[2px]"
                aria-hidden="true"
              >
                {rank}
              </span>

              {/* Poster card overlapping the number */}
              <Link
                to={infoPath}
                draggable={false}
                aria-label={`${item.title} — ranked #${rank}`}
                className="relative z-10 block w-[186px] max-[575px]:w-[128px] rounded-xl overflow-hidden bg-[#1a1a22] ring-1 ring-white/[0.06] shadow-lg transition-all duration-500 ease-out group-hover/top10:-translate-y-2 group-hover/top10:ring-[#a855f7]/50 group-hover/top10:shadow-[0_22px_55px_rgba(168,85,247,0.28)]"
              >
                <div className="relative w-full pb-[150%]">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
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

                  {/* darken + title reveal on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover/top10:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-2 opacity-0 group-hover/top10:translate-y-0 group-hover/top10:opacity-100 transition-all duration-500">
                    <p className="text-white text-[13px] font-semibold line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                    {item.rating && (
                      <span className="mt-1 inline-flex items-center gap-x-1 text-[11px] text-[#fbbf24] font-semibold">
                        <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                        {item.rating}
                      </span>
                    )}
                  </div>

                  {/* type badge */}
                  <span className="absolute top-2 right-2 bg-[#a855f7] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white">
                    {item.type === "tv" ? "TV" : "Movie"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
