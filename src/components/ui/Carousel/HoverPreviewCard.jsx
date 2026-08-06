/* eslint-disable react/prop-types */
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faStar,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";

import { useLanguage } from "@/src/context/LanguageContext";
import getSafeTitle from "@/src/utils/getSafetitle";
import { createAnimeSlug } from "@/src/utils/slug.utils";
import WatchLaterButton from "@/src/components/auth/WatchLaterButton";

/**
 * HoverPreviewCard — a floating, edge-aware preview panel (Netflix / Crunchyroll
 * style) rendered through a React portal onto <body> so it can never be clipped
 * by the carousel's `overflow:hidden` scroller.
 *
 * The panel prefers to open to the RIGHT of the hovered card; if that would
 * overflow the viewport it flips to the LEFT. Vertically it centres on the card
 * and is clamped inside the viewport. It fades + scales in with a buttery
 * cubic-bezier so it feels flagship-quality and stays on the GPU
 * (transform + opacity only).
 *
 * Props:
 *   item            the anime data object (same shape AnimeCard consumes)
 *   anchorRect      DOMRect of the hovered card cell (viewport coords)
 *   onRequestClose  called when the user wants it gone
 *   onPointerEnter  keeps the panel open while the pointer is over it
 *   onPointerLeave  schedules a close when the pointer leaves the panel
 */
const PANEL_W = 340;
const GAP = 14;

export default function HoverPreviewCard({
  item,
  anchorRect,
  onRequestClose,
  onPointerEnter,
  onPointerLeave,
}) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null); // { left, top, origin }
  const [shown, setShown] = useState(false);

  const id = item?.id || item?.anilistId || item?.malId;
  const title = getSafeTitle(
    item?.title || item?.name,
    language,
    item?.japanese_title || item?.titleJapanese
  );
  const slug = createAnimeSlug(item?.title || item?.name || "anime", id);
  const poster =
    item?.poster ||
    item?.image ||
    item?.cover ||
    item?.coverImage?.extraLarge ||
    item?.coverImage?.large ||
    "";
  const score = item?.score || item?.rating || item?.tvInfo?.rating;
  const sub = item?.tvInfo?.sub ?? item?.sub;
  const dub = item?.tvInfo?.dub ?? item?.dub;
  const type = item?.tvInfo?.showType || item?.type || item?.format || "TV";
  const episodes =
    item?.tvInfo?.eps ||
    item?.episodes ||
    item?.totalEpisodes ||
    item?.tvInfo?.sub ||
    null;
  const duration = item?.tvInfo?.duration || item?.duration;
  const genres = Array.isArray(item?.genres) ? item.genres.slice(0, 4) : [];
  const synopsis =
    item?.description ||
    item?.synopsis ||
    item?.overview ||
    "";

  // Compute an edge-aware position once we have the anchor + panel size.
  useLayoutEffect(() => {
    if (!anchorRect) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const panelH = panelRef.current?.offsetHeight || 420;

    // Prefer right of the card; flip left if it would overflow.
    let left = anchorRect.right + GAP;
    let origin = "left center";
    if (left + PANEL_W > vw - 8) {
      left = anchorRect.left - GAP - PANEL_W;
      origin = "right center";
    }
    // Last-resort clamp if neither side fits (very narrow viewport).
    if (left < 8) {
      left = Math.max(8, Math.min(vw - PANEL_W - 8, anchorRect.left));
      origin = "center top";
    }

    // Vertically centre on the card, then clamp into the viewport.
    let top = anchorRect.top + anchorRect.height / 2 - panelH / 2;
    top = Math.max(8, Math.min(top, vh - panelH - 8));

    setPos({ left, top, origin });

    // Kick the fade/scale-in on the next frame.
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [anchorRect]);

  if (!anchorRect || !item) return null;

  const watchHref = `/watch/${slug}`;

  return createPortal(
    <div
      ref={panelRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{
        position: "fixed",
        left: pos ? pos.left : -9999,
        top: pos ? pos.top : -9999,
        width: PANEL_W,
        zIndex: 9999,
        transformOrigin: pos?.origin || "center",
        opacity: shown ? 1 : 0,
        transform: shown
          ? "translate3d(0,0,0) scale(1)"
          : "translate3d(0,0,0) scale(0.92)",
        transition:
          "opacity 165ms cubic-bezier(0.16,1,0.3,1), transform 165ms cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform, opacity",
      }}
      className="rounded-2xl overflow-hidden bg-[#0f0f14] ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
    >
      {/* Poster header */}
      <div className="relative w-full pb-[52%] overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-[#151515]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f14] via-[#0f0f14]/30 to-transparent" />
        <span className="absolute top-2.5 right-2.5 bg-[#ffbade] text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded">
          {typeof type === "string" ? type.split(" ").shift() : "TV"}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 pt-2 -mt-6 relative">
        <h3 className="text-white font-bold text-[16px] leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 mt-2.5 text-[11px]">
          {score && (
            <span className="inline-flex items-center gap-1 text-[#fbbf24] font-bold">
              <FontAwesomeIcon icon={faStar} className="text-[9px]" />
              {score}
            </span>
          )}
          {sub && (
            <span className="inline-flex items-center gap-1 bg-white/10 text-white px-1.5 py-0.5 rounded">
              <FontAwesomeIcon icon={faClosedCaptioning} className="text-[9px]" />
              {sub}
            </span>
          )}
          {dub && (
            <span className="inline-flex items-center gap-1 bg-white/10 text-white px-1.5 py-0.5 rounded">
              <FontAwesomeIcon icon={faMicrophone} className="text-[9px]" />
              {dub}
            </span>
          )}
          {episodes && (
            <span className="bg-white/10 text-white px-1.5 py-0.5 rounded">
              {episodes} eps
            </span>
          )}
          {duration && duration !== "?" && duration !== "m" && (
            <span className="bg-white/10 text-white px-1.5 py-0.5 rounded">
              {duration}
            </span>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {genres.map((g) => (
              <span
                key={g}
                className="text-[10px] text-gray-300 border border-white/15 rounded-full px-2 py-0.5"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Synopsis */}
        {synopsis && (
          <p className="text-[12px] text-gray-400 leading-relaxed mt-3 line-clamp-3">
            {String(synopsis).replace(/<[^>]*>/g, "")}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => {
              onRequestClose?.();
              navigate(watchHref);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#ffbade] hover:bg-white text-black font-bold text-[13px] rounded-lg py-2.5 transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[11px]" />
            Watch
          </button>

          <WatchLaterButton
            mediaId={String(id)}
            watchId={slug}
            title={title}
            poster={poster}
            variant="icon"
            showLabel={false}
            className="shrink-0"
          />

          <Link
            to={`/${slug}`}
            onClick={() => onRequestClose?.()}
            aria-label="View details"
            className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-300"
          >
            <FontAwesomeIcon icon={faStar} className="text-[13px]" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
