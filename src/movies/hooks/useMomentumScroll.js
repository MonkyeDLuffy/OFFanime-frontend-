import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useMomentumScroll — ONE universal, buttery-smooth horizontal scroller used by
 * EVERY rail in the app (anime + movies). It makes all rows feel identical:
 *
 *   • Mouse wheel  → vertical wheel is translated into a smooth HORIZONTAL glide
 *                    (rAF-eased, so it never feels laggy or stepwise).
 *   • Trackpad     → native 2-finger horizontal deltas pass straight through,
 *                    vertical-dominant deltas convert to horizontal.
 *   • Pointer drag → grab-and-throw with velocity tracking + inertial momentum.
 *   • Touch        → finger fling with momentum AND axis-locking, so a mostly
 *                    vertical swipe scrolls the PAGE (never steals it) while a
 *                    mostly horizontal swipe pans the rail. This is what kills
 *                    the Top-10 "vertical wobble".
 *   • Buttons      → `scrollByPage` / `glideBy` animate with easeOutCubic.
 *
 * The rail element MUST carry the `.hz-scroll` class (scroll-behavior:auto so it
 * never fights the rAF loop; overflow-y:hidden so it can't wobble vertically).
 *
 * React attaches onWheel/onTouchMove as PASSIVE listeners, so we cannot call
 * preventDefault() from them. We therefore bind `wheel` and `touchmove`
 * manually as NON-passive on the tracked element.
 *
 * Returns the refs/handlers the component spreads onto its scroll container.
 */
export default function useMomentumScroll() {
  const trackRef = useRef(null);

  const drag = useRef({
    active: false,
    moved: false,
    axis: null, // 'x' | 'y' | null (touch axis-lock)
    startX: 0,
    startY: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0, // px per ms
    pointerId: null,
    isTouch: false,
  });

  const rafRef = useRef(0);
  const wheelTarget = useRef(null); // target scrollLeft while wheel-gliding
  const [dragging, setDragging] = useState(false);

  const cancelRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const stopGlide = useCallback(() => {
    cancelRaf();
    wheelTarget.current = null;
    const el = trackRef.current;
    if (el) el.classList.remove("is-gliding");
  }, [cancelRaf]);

  const clamp = (el, v) =>
    Math.max(0, Math.min(v, el.scrollWidth - el.clientWidth));

  // ---- Inertial deceleration after a pointer/touch release ----------------
  const startMomentum = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    let velocity = drag.current.velocity * 16; // px per ~16ms frame
    if (Math.abs(velocity) < 0.6) return;

    el.classList.add("is-gliding");
    const friction = 0.95; // higher = longer glide

    const step = () => {
      velocity *= friction;
      el.scrollLeft -= velocity;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if (Math.abs(velocity) < 0.4 || atStart || atEnd) {
        stopGlide();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [stopGlide]);

  // ---- Eased programmatic paging (chevron buttons) -------------------------
  const glideTo = useCallback(
    (target, duration = 520) => {
      const el = trackRef.current;
      if (!el) return;
      cancelRaf();
      wheelTarget.current = null;
      el.classList.add("is-gliding");
      const start = el.scrollLeft;
      const dest = clamp(el, target);
      const startTime = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

      const step = (now) => {
        const p = Math.min(1, (now - startTime) / duration);
        el.scrollLeft = start + (dest - start) * ease(p);
        if (p < 1) rafRef.current = requestAnimationFrame(step);
        else stopGlide();
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [cancelRaf, stopGlide]
  );

  const glideBy = useCallback(
    (distance) => {
      const el = trackRef.current;
      if (!el) return;
      glideTo(el.scrollLeft + distance);
    },
    [glideTo]
  );

  const scrollByPage = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el) return;
      glideBy(dir * el.clientWidth * 0.85);
    },
    [glideBy]
  );

  // ---- Mouse-wheel → smooth horizontal glide -------------------------------
  // Bound manually (non-passive) so we can preventDefault the page scroll.
  const onWheelNative = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;
    // TASK 1: Never hijack a plain vertical wheel — that must always scroll
    // the page. The carousel only reacts to a horizontal-intent gesture:
    //   • horizontal trackpad swipe (|deltaX| > |deltaY|)
    //   • horizontal mouse wheel (tilt wheel → deltaX)
    //   • Shift + wheel (power-user horizontal scroll)
    const horizontalIntent =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (!horizontalIntent) return; // let the page scroll vertically

    // With Shift held on a vertical-only wheel, deltaY carries the scroll amount.
    const delta =
      e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY)
        ? e.deltaY
        : e.deltaX;
    if (delta === 0) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return; // nothing to scroll horizontally

    // Only hijack the wheel if this row can actually move that direction —
    // otherwise let the page scroll normally.
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft >= maxScroll - 1;
    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

    e.preventDefault();

    // Accumulate onto a target and ease toward it every frame for a glide
    // instead of a hard, stepwise jump.
    const base =
      wheelTarget.current == null ? el.scrollLeft : wheelTarget.current;
    wheelTarget.current = clamp(el, base + delta);

    el.classList.add("is-gliding");
    if (!rafRef.current) {
      const step = () => {
        const target = wheelTarget.current;
        if (target == null) {
          rafRef.current = 0;
          return;
        }
        const cur = el.scrollLeft;
        const diff = target - cur;
        if (Math.abs(diff) < 0.5) {
          el.scrollLeft = target;
          wheelTarget.current = null;
          rafRef.current = 0;
          el.classList.remove("is-gliding");
          return;
        }
        el.scrollLeft = cur + diff * 0.18; // smoothing factor
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }
  }, []);

  // ---- Pointer drag (mouse + pen) ------------------------------------------
  const onPointerDown = useCallback(
    (e) => {
      // Touch is handled by the dedicated touch handlers below for axis-lock.
      if (e.pointerType === "touch") return;
      const el = trackRef.current;
      if (!el) return;
      stopGlide();
      drag.current = {
        ...drag.current,
        active: true,
        moved: false,
        axis: "x",
        isTouch: false,
        startX: e.clientX,
        startY: e.clientY,
        startScroll: el.scrollLeft,
        lastX: e.clientX,
        lastT: performance.now(),
        velocity: 0,
        pointerId: e.pointerId,
      };
    },
    [stopGlide]
  );

  const onPointerMove = useCallback((e) => {
    const d = drag.current;
    if (!d.active || d.isTouch) return;
    const el = trackRef.current;
    if (!el) return;

    const delta = e.clientX - d.startX;
    if (!d.moved && Math.abs(delta) > 5) {
      d.moved = true;
      setDragging(true);
      el.classList.add("is-gliding");
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
    if (d.moved) {
      el.scrollLeft = d.startScroll - delta;
      const now = performance.now();
      const dt = now - d.lastT || 16;
      d.velocity = (e.clientX - d.lastX) / dt;
      d.lastX = e.clientX;
      d.lastT = now;
    }
  }, []);

  const endPointer = useCallback(() => {
    const d = drag.current;
    if (!d.active || d.isTouch) return;
    d.active = false;
    if (d.moved) {
      startMomentum();
      setTimeout(() => setDragging(false), 0);
    } else {
      setDragging(false);
    }
  }, [startMomentum]);

  // ---- Touch (finger) with axis-lock + momentum ----------------------------
  const onTouchStart = useCallback(
    (e) => {
      const el = trackRef.current;
      if (!el || e.touches.length !== 1) return;
      stopGlide();
      const t = e.touches[0];
      drag.current = {
        ...drag.current,
        active: true,
        moved: false,
        axis: null, // decided on first move
        isTouch: true,
        startX: t.clientX,
        startY: t.clientY,
        startScroll: el.scrollLeft,
        lastX: t.clientX,
        lastT: performance.now(),
        velocity: 0,
      };
    },
    [stopGlide]
  );

  // Non-passive so we can preventDefault ONLY when the gesture is horizontal.
  const onTouchMoveNative = useCallback((e) => {
    const d = drag.current;
    if (!d.active || !d.isTouch || e.touches.length !== 1) return;
    const el = trackRef.current;
    if (!el) return;

    const t = e.touches[0];
    const dx = t.clientX - d.startX;
    const dy = t.clientY - d.startY;

    // Decide the axis once, when the finger has moved enough to be sure.
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "x") {
        d.moved = true;
        setDragging(true);
        el.classList.add("is-gliding");
      }
    }

    // Vertical gesture → let the PAGE scroll; we do nothing (no preventDefault).
    if (d.axis === "y") return;

    // Horizontal gesture → pan the rail and swallow the page scroll.
    e.preventDefault();
    el.scrollLeft = d.startScroll - dx;
    const now = performance.now();
    const dt = now - d.lastT || 16;
    d.velocity = (t.clientX - d.lastX) / dt;
    d.lastX = t.clientX;
    d.lastT = now;
  }, []);

  const onTouchEnd = useCallback(() => {
    const d = drag.current;
    if (!d.active || !d.isTouch) return;
    d.active = false;
    const wasHorizontal = d.axis === "x";
    d.axis = null;
    if (wasHorizontal) {
      startMomentum();
      setTimeout(() => setDragging(false), 0);
    } else {
      setDragging(false);
    }
  }, [startMomentum]);

  // Suppress the click that immediately follows a real drag so cards don't
  // navigate when the user was actually panning the rail.
  const onClickCapture = useCallback((e) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Bind wheel + touchmove manually as NON-passive (React makes them passive).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheelNative, { passive: false });
    el.addEventListener("touchmove", onTouchMoveNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelNative);
      el.removeEventListener("touchmove", onTouchMoveNative);
    };
  }, [onWheelNative, onTouchMoveNative]);

  useEffect(() => () => stopGlide(), [stopGlide]);

  return {
    trackRef,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerLeave: endPointer,
      onPointerCancel: endPointer,
      onTouchStart,
      onTouchEnd,
      onClickCapture,
    },
    scrollByPage,
    glideBy,
    glideTo,
  };
}
