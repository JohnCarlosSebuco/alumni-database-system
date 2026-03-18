"use client";
import { useInView } from "@/lib/hooks/useInView";
import { Wrench, Radio, Settings2 } from "lucide-react";

const programs = [
  {
    abbr: "BSECE",
    full: "Electronics & Communications Engineering",
    desc: "Design, develop, and maintain electronic and communication systems — from circuit boards to telecommunications infrastructure.",
    icon: Radio,
  },
  {
    abbr: "BSME",
    full: "Mechanical Engineering",
    desc: "Design, analyze, and manufacture mechanical systems — from machines and thermal systems to robotics and energy technology.",
    icon: Wrench,
  },
  {
    abbr: "BSIE",
    full: "Industrial Engineering",
    desc: "Optimize processes, reduce waste, and improve systems across manufacturing, logistics, and operations management.",
    icon: Settings2,
  },
];

export function LandingPrograms() {
  const { ref: headRef, inView: headIn } = useInView(0.3);
  const { ref: gridRef, inView: gridIn } = useInView(0.1);

  return (
    <section className="relative py-16 md:py-32 bg-white overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#3B0010 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          ref={headRef}
          className={`text-center mb-12 md:mb-20 transition-all duration-700 ease-out ${
            headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[11px] font-semibold text-gold-600 tracking-[0.25em] uppercase mb-4">
            College of Engineering
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Three programs, one community.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
            AlumNayan is built exclusively for graduates of SLSU's College of Engineering — every program, every batch.
          </p>
        </div>

        {/* Program cards */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {programs.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.abbr}
                className={`group relative rounded-3xl border border-gray-100 bg-white p-6 md:p-9 overflow-hidden
                  hover:-translate-y-1.5 hover:shadow-[0_12px_48px_rgba(59,0,16,0.08)] hover:border-transparent
                  transition-all duration-300 ease-out
                  ${gridIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: gridIn ? `${i * 100}ms` : "0ms" }}
              >
                {/* Top gold accent line on hover */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-gold-400 mb-8 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: "linear-gradient(135deg, #3B0010 0%, #800024 100%)",
                    boxShadow: "0 4px 16px rgba(59,0,16,0.25)",
                  }}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>

                {/* Program abbreviation */}
                <p className="text-3xl md:text-4xl font-bold text-navy-900 tracking-tight mb-1">
                  {p.abbr}
                </p>

                {/* Full name */}
                <p className="text-sm font-semibold text-gray-500 mb-4 leading-snug">
                  {p.full}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
