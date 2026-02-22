"use client";
import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import loadingCat from "@/assets/loading-cat.json";

const MIN_MS = 2500;
const FADE_MS = 400;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showLoader(instant: boolean) {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // Instant = no transition (called on click, must block immediately)
    overlay.style.transition = instant ? "none" : `opacity ${FADE_MS}ms ease-in-out`;
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";

    content.style.transition = instant ? "none" : `opacity ${FADE_MS}ms ease-in-out`;
    content.style.opacity = "0";

    timerRef.current = setTimeout(hideLoader, MIN_MS);
  }

  function hideLoader() {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    overlay.style.transition = `opacity ${FADE_MS}ms ease-in-out`;
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";

    content.style.transition = `opacity ${FADE_MS}ms ease-in-out`;
    content.style.opacity = "1";
  }

  useEffect(() => {
    // Initial page load: fade in smoothly
    requestAnimationFrame(() => showLoader(false));

    // Intercept link clicks BEFORE Next.js processes them (capture phase)
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same page (hash-only) — skip
        if (url.pathname + url.search === window.location.pathname + window.location.search) return;
        showLoader(true); // instant: block the page immediately
      } catch {}
    }

    // Browser back/forward
    function handlePopState() {
      showLoader(true);
    }

    document.addEventListener("click", handleClick, true); // capture phase
    window.addEventListener("popstate", handlePopState);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Always mounted — opacity controlled via refs, no React state delay */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <Lottie
          animationData={loadingCat}
          loop
          autoplay
          style={{ width: 380, height: 380 }}
        />
        <div style={{ marginTop: "-24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #7b1028 0%, #c0392b 60%, #e8a020 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.025em",
            }}
          >
            AlumNayan
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", letterSpacing: "0.18em", textTransform: "uppercase", fontStyle: "italic", fontWeight: 500 }}>
            Connect. Grow. Give Back.
          </p>
          <div style={{ marginTop: "12px", height: "1px", width: "128px", background: "linear-gradient(to right, transparent, #d1d5db, transparent)" }} />
          <p style={{ marginTop: "12px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9ca3af" }}>
            Loading…
          </p>
        </div>
      </div>

      {/* Page content — hidden until loader finishes */}
      <div ref={contentRef} style={{ opacity: 0 }}>
        {children}
      </div>
    </>
  );
}
