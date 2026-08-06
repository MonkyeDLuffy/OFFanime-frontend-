/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

/**
 * TrailerModal — a lightweight, cinematic overlay that plays a YouTube trailer
 * inside a 16:9 iframe. Rendered once at the Spotlight level and driven by
 * whichever slide's "Watch Trailer" button was clicked.
 *
 * • Closes on backdrop click, the ✕ button, or the Escape key.
 * • Locks body scroll while open.
 * • Renders nothing when there is no url (so it's cheap to always mount).
 */
export default function TrailerModal({ url, title, onClose }) {
  useEffect(() => {
    if (!url) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    // Lock scroll on the page behind the modal.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [url, onClose]);

  if (!url) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} trailer` : "Trailer"}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-[fadeIn_.25s_ease]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1100px] aspect-video rounded-2xl overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.8)] ring-1 ring-white/10 bg-black"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute -top-1 right-0 md:-top-12 md:right-0 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 md:bg-white/10 text-white hover:bg-[#ffbade] hover:text-black transition-colors duration-300"
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg" />
        </button>

        <iframe
          src={url}
          title={title ? `${title} — Trailer` : "Trailer"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
        />
      </div>
    </div>
  );
}
