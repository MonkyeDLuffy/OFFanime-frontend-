/* eslint-disable react/prop-types */
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";

import { useLanguage } from "@/src/context/LanguageContext";
import useMomentumScroll from "@/src/movies/hooks/useMomentumScroll";
import { AnimeCard } from "@/src/components/categorycard/CategoryCard";
import HoverPreviewCard from "./HoverPreviewCard";

/**
 * AnimeRail — the ONE reusable premium horizontal carousel used by every
 * homepage section (Latest Episode, Top Airing, Most Favorite, Latest
 * Completed, Trending, …). Only the `data` / `label` / `path` change; all the
 * animation, snapping, drag, arrows, responsiveness, lazy rendering and the
 * floating hover-preview system are shared here so there is zero duplication.
 *
 * • Uses the shared `useMomentumScroll` hook (wheel-horizontal / trackpad /
 *   drag / touch + inertial momentum) via the `.hz-scroll` class — the exact
 *   same engine the Top-10 rail uses, so it feels identical.
 * • Vertical mouse-wheel is NEVER hijacked (see useMomentumScroll TASK 1), so
 *   the page always scrolls normally.
 * • Cards get the premium `.rail-cell` lift/glow (index.css) and, on desktop
 *   pointer hover, a portal-rendered edge-aware `HoverPreviewCard`.
 *
 * Props:
 *   label         section heading
 *   data          array of anime items
 *   path          category route slug for the "View more" link
 *   limit         optional max items
 *   showViewMore  show the header "View more" affordance (default true)
 *   preview       enable the floating hover preview panel (default true)
 */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 120;

export default function AnimeRail({
  label,
  data = [],
  path = "",
  limit,
  showViewMore = true,
  preview = true,
}) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { trackRef, dragging, handlers, scrollByPage } = useMomentumScroll();

  const items = (Array.isArray(data) ? data : []).filter(Boolean);
  const list = limit ? items.slice(0, limit) : items;

  // ---- Floating hover-preview orchestration --------------------------------
  const [preview_, setPreview] = useState(null); // { item, rect }
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setPreview(null), CLOSE_DELAY);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (item, el, pointerType) => {
      if (!preview) return;
      // Touch devices never get the popup — they use tap-to-navigate.
      if (pointerType === "touch") return;
      cancelClose();
      if (openTimer.current) clearTimeout(openTimer.current);
      const rect = el.getBoundingClientRect();
      openTimer.current = setTimeout(() => {
        setPreview({ item, rect });
      }, OPEN_DELAY);
    },
    [preview, cancelClose]
  );

  const closeNow = useCallback(() => {
    clearTimers();
    setPreview(null);
  }, [clearTimers]);

  if (list.length === 0) return null;

  return (
    <section className="w-full" aria-label={label}>
      {/* Header — mirrors the Top-10 rail affordances */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-3">
          <h2 className="text-white font-bold text-[22px] max-[575px]:text-[18px] tracking-tight">
            {label}
          </h2>
          {showViewMore && path && (
            <Link
              to={`/${path}`}
              className="hidden sm:inline-flex items-center gap-1 text-[13px] text-gray-400 hover:text-[#ffbade] transition-colors duration-300"
            >
              View more
              <FaChevronRight className="text-[10px]" />
            </Link>
          )}
        </div>

        <nav
          className="flex items-center gap-x-2 max-[575px]:hidden"
          aria-label={`${label} navigation`}
        >
          <button
            onClick={() => {
              closeNow();
              scrollByPage(-1);
            }}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ffbade] hover:text-black text-white flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <button
            onClick={() => {
              closeNow();
              scrollByPage(1);
            }}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#ffbade] hover:text-black text-white flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </nav>
      </header>

      {/* Scroller — the shared momentum engine + universal .hz-scroll styling */}
      <ul
        ref={trackRef}
        {...handlers}
        onScroll={closeNow}
        className={`hz-scroll anime-rail flex items-stretch gap-x-3 max-[575px]:gap-x-2 pb-2 m-0 list-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {list.map((item, idx) => (
          <li
            key={`${item.id || item.anilistId || idx}-${idx}`}
            className="rail-cell shrink-0"
            onPointerDown={closeNow}
            onPointerEnter={(e) =>
              scheduleOpen(item, e.currentTarget, e.pointerType)
            }
            onPointerLeave={scheduleClose}
          >
            <AnimeCard
              item={item}
              navigate={navigate}
              path={path}
              language={language}
              priority={idx < 5}
            />
          </li>
        ))}
      </ul>

      {/* Floating edge-aware preview (portal → body, never clipped) */}
      {preview_ && (
        <HoverPreviewCard
          item={preview_.item}
          anchorRect={preview_.rect}
          onRequestClose={closeNow}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
        />
      )}
    </section>
  );
}
