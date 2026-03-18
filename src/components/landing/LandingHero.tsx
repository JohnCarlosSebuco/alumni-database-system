"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const scrollBgRef = useRef<HTMLDivElement>(null);

  // Mouse parallax — direct DOM, no state
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (blob1Ref.current)
        blob1Ref.current.style.transform = `translate(${x * 24}px, ${y * 18}px)`;
      if (blob2Ref.current)
        blob2Ref.current.style.transform = `translate(${-x * 18}px, ${-y * 12}px)`;
      if (blob3Ref.current)
        blob3Ref.current.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Scroll parallax on bg container
  useEffect(() => {
    const el = scrollBgRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="relative h-screen flex flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% -10%, rgba(188,28,66,0.18) 0%, transparent 65%), #3B0010",
      }}
    >
      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(245,158,11,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* ── Central glow orb ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[560px] w-[560px] rounded-full bg-gold-500/8 blur-[120px]" />
      </div>

      {/* ── Parallax blobs (mouse + scroll) ── */}
      <div ref={scrollBgRef} className="absolute inset-0 pointer-events-none">
        <div
          ref={blob1Ref}
          className="absolute top-[18%] right-[-4%] h-[520px] w-[520px] rounded-full bg-gold-500/[0.07] blur-[80px] animate-float transition-transform duration-700 ease-out"
        />
        <div
          ref={blob2Ref}
          className="absolute bottom-[-10%] left-[10%] h-[420px] w-[420px] rounded-full bg-navy-600/50 blur-[70px] animate-float [animation-delay:3.5s] transition-transform duration-700 ease-out"
        />
        <div
          ref={blob3Ref}
          className="absolute top-[40%] left-[-8%] h-[300px] w-[300px] rounded-full bg-navy-700/40 blur-[60px] animate-float [animation-delay:6s] transition-transform duration-700 ease-out"
        />
        {/* Top edge gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      </div>

      {/* ── Navbar spacer ── */}
      <div className="h-16 shrink-0" />

      {/* ── Content — fills remaining space, centered ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full bg-navy-800 border border-navy-700 px-4 py-1.5 text-xs sm:text-sm text-gold-400 mb-6 md:mb-8 opacity-0"
          style={{ animation: "slideUp 0.7s ease-out 0ms forwards" }}
        >
          <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
          Exclusive alumni platform for SLSU College of Engineering
        </div>

        {/* H1 */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight text-balance mb-6 opacity-0"
          style={{ animation: "slideUp 0.7s ease-out 120ms forwards" }}
        >
          The Alumni Platform<br />
          Built for{" "}
          <span className="text-gold-500">CEN Graduates</span>
        </h1>

        {/* Subline */}
        <p
          className="text-lg md:text-xl text-navy-200 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed opacity-0"
          style={{ animation: "slideUp 0.7s ease-out 270ms forwards" }}
        >
          AlumNayan connects SLSU College of Engineering graduates with their university community.
          Discover job opportunities, attend events, and showcase your achievements — all in one place.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
          style={{ animation: "slideUp 0.7s ease-out 420ms forwards" }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-base font-semibold text-navy-900 hover:bg-gold-400 transition-colors shadow-lg"
          >
            Join AlumNayan Free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-600 px-8 py-4 text-base font-medium text-navy-100 hover:bg-navy-800 transition-colors"
          >
            Sign In
          </Link>
        </div>

      </div>
      </div>

    </section>
  );
}
