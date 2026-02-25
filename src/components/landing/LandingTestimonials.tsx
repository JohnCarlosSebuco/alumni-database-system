"use client";
import { useInView } from "@/lib/hooks/useInView";

const testimonials = [
  {
    quote:
      "AlumNayan helped me land my first engineering role right after graduation. Having a dedicated job board for CEN graduates made all the difference.",
    name: "Maria Santos",
    detail: "BSECE · Class of 2019",
    role: "Electrical Engineer, Meralco",
  },
  {
    quote:
      "I hadn't heard from my batch mates in years. AlumNayan made reconnecting feel effortless — it truly feels like the community never stopped.",
    name: "Juan dela Cruz",
    detail: "BSME · Class of 2016",
    role: "Mechanical Engineer, Manila",
  },
  {
    quote:
      "Managing alumni data used to take weeks every semester. With AlumNayan, everything is organized, searchable, and exportable in minutes.",
    name: "Prof. Ana Reyes",
    detail: "CEN Faculty",
    role: "Alumni Coordinator, SLSU",
  },
];

export function LandingTestimonials() {
  const { ref: headRef, inView: headIn } = useInView(0.3);
  const { ref: gridRef, inView: gridIn } = useInView(0.1);

  return (
    <section className="relative bg-navy-900 border-t border-navy-800 py-32 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Radial glow bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-navy-700/30 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`text-center mb-20 transition-all duration-700 ease-out ${
            headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[11px] font-semibold text-gold-500 tracking-[0.25em] uppercase mb-4">
            Alumni Voices
          </p>
          <h2 className="text-5xl font-bold text-white tracking-tight leading-tight">
            Hear it from graduates.
          </h2>
          <p className="mt-5 text-navy-300 text-lg font-light max-w-xl mx-auto leading-relaxed">
            CEN graduates from every batch trust AlumNayan to stay connected, grow their careers, and give back.
          </p>
        </div>

        {/* Cards */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 ease-out hover:-translate-y-1 ${
                gridIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: gridIn ? `${i * 120}ms` : "0ms",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Decorative quote mark */}
              <span
                className="absolute top-6 right-7 text-7xl leading-none text-gold-500/15 select-none pointer-events-none"
                aria-hidden="true"
              >
                "
              </span>

              {/* Quote */}
              <p className="relative text-navy-200 text-sm leading-relaxed flex-1 mb-8">
                "{t.quote}"
              </p>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gold-500/30 via-gold-400/20 to-transparent mb-6" />

              {/* Author */}
              <div>
                <p className="text-sm font-semibold text-gold-400 tracking-tight">{t.name}</p>
                <p className="text-xs text-navy-400 mt-0.5">{t.role}</p>
                <p className="text-xs text-navy-600 mt-0.5 uppercase tracking-wider">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
