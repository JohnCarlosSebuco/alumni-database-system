"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/lib/hooks/useInView";

const steps = [
  {
    step: "01",
    title: "Sign Up",
    desc: "Create your free alumni account in under 2 minutes using your SLSU email or personal address.",
  },
  {
    step: "02",
    title: "Build Your Profile",
    desc: "Complete all 8 sections — employment, education, licenses, awards, and more.",
  },
  {
    step: "03",
    title: "Stay Connected",
    desc: "Apply to jobs, RSVP to events, and get real-time updates from your alma mater.",
  },
];

export function LandingHowItWorks() {
  const { ref: headRef,  inView: headIn  } = useInView(0.3);
  const { ref: stepsRef, inView: stepsIn } = useInView(0.15);
  const { ref: ctaRef,   inView: ctaIn   } = useInView(0.5);

  return (
    <section
      id="how-it-works"
      className="relative py-16 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(188,28,66,0.12) 0%, transparent 60%), #3B0010",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Top gradient fade from white */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`text-center mb-14 md:mb-24 transition-all duration-700 ease-out ${
            headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[11px] font-semibold text-gold-500 tracking-[0.25em] uppercase mb-4">
            Getting Started
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Three steps to connection.
          </h2>
          <p className="mt-5 text-navy-300 text-lg font-light max-w-xl mx-auto leading-relaxed">
            Joining AlumNayan is fast, free, and built for every SLSU CEN graduate.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative grid md:grid-cols-3 gap-6 lg:gap-10">

          {/* Animated connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(100%/6)] right-[calc(100%/6)] h-px">
            {/* Inactive track */}
            <div className="absolute inset-0 bg-navy-700/60" />
            {/* Animated fill */}
            <div
              className="absolute inset-0 origin-left bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 transition-transform duration-1200 ease-out"
              style={{
                transform: stepsIn ? "scaleX(1)" : "scaleX(0)",
                transitionDuration: "1200ms",
              }}
            />
          </div>

          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`relative flex flex-col items-center text-center transition-all duration-600 ease-out ${
                stepsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: stepsIn ? `${i * 180}ms` : "0ms" }}
            >
              {/* Gold circle */}
              <div
                className={`relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gold-500 text-navy-900 text-lg font-bold mb-8 transition-all duration-300 ${
                  stepsIn ? "shadow-[0_0_32px_rgba(245,158,11,0.45)]" : ""
                }`}
              >
                {s.step}
                {/* Ring pulse (fires once step is in view) */}
                {stepsIn && (
                  <span
                    className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping"
                    style={{ animationDuration: "2s", animationDelay: `${i * 200}ms` }}
                  />
                )}
              </div>

              {/* Glassmorphism card */}
              <div
                className="w-full rounded-3xl p-7 text-left transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{s.title}</h3>
                <p className="text-navy-300 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className={`mt-12 md:mt-20 text-center transition-all duration-700 ease-out ${
            ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: ctaIn ? "400ms" : "0ms" }}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gold-500 px-9 py-4 text-base font-semibold text-navy-900 hover:bg-gold-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_4px_24px_rgba(245,158,11,0.35)]"
          >
            Join AlumNayan Now
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
