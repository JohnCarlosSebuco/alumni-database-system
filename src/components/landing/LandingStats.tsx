"use client";
import { useEffect, useRef } from "react";
import { useInView } from "@/lib/hooks/useInView";

interface CountUpProps {
  numeric: number;
  suffix: string;
  started: boolean;
}

function CountUp({ numeric, suffix, started }: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started) return;
    const el = spanRef.current;
    if (!el) return;

    const duration = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - start, duration);
      const eased = 1 - Math.pow(1 - elapsed / duration, 3);
      el.textContent = Math.round(eased * numeric).toLocaleString() + suffix;
      if (elapsed < duration) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [started, numeric, suffix]);

  return <span ref={spanRef}>{"0" + suffix}</span>;
}

interface LandingStatsProps {
  alumni:   number;
  programs: number;
  jobs:     number;
  events:   number;
}

export function LandingStats({ alumni, programs, jobs, events }: LandingStatsProps) {
  const stats = [
    { numeric: alumni,   suffix: "+", label: "CEN Alumni" },
    { numeric: programs, suffix: "",  label: "Engineering Programs" },
    { numeric: jobs,     suffix: "+", label: "Job Postings" },
    { numeric: events,   suffix: "+", label: "Events Held" },
  ];
  const { ref: leftRef,  inView: leftIn  } = useInView(0.3);
  const { ref: rightRef, inView: rightIn } = useInView(0.2);

  return (
    <section className="bg-navy-900 border-t border-navy-800 py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-center">

          {/* ── Left: editorial copy ── */}
          <div
            ref={leftRef}
            className={`transition-all duration-700 ease-out ${
              leftIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <p className="text-[11px] font-semibold text-gold-500 tracking-[0.28em] uppercase mb-6">
              By the Numbers
            </p>
            <h2 className="text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Connecting CEN<br />
              graduates since<br />
              day one.
            </h2>
            <p className="mt-6 text-navy-300 text-base leading-relaxed max-w-sm">
              AlumNayan is the official alumni platform for the SLSU College of
              Engineering — where careers grow and connections last a lifetime.
            </p>
          </div>

          {/* ── Right: stacked stat rows ── */}
          <div ref={rightRef}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group flex items-center justify-between py-7 border-b border-navy-800 transition-all duration-500 ease-out ${
                  rightIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: rightIn ? `${i * 110}ms` : "0ms" }}
              >
                {/* Label */}
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-500 group-hover:text-gold-400 transition-colors duration-200">
                  {s.label}
                </span>

                {/* Number */}
                <span className="text-5xl font-bold text-white tabular-nums group-hover:text-gold-400 transition-colors duration-200">
                  <CountUp numeric={s.numeric} suffix={s.suffix} started={rightIn} />
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
