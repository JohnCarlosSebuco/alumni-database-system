"use client";
import Link from "next/link";
import { ArrowRight, MapPin, Video, Lock } from "lucide-react";
import { useInView } from "@/lib/hooks/useInView";

export interface EventPreview {
  id: string;
  title: string;
  type: string;
  startDate: string;
  location: string;
  isVirtual: boolean;
  rsvpCount: number;
  bannerURL?: string;
}

interface Props {
  events: EventPreview[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short" }).toUpperCase();
}

function formatDay(dateStr: string) {
  return new Date(dateStr).getDate();
}

const TYPE_COLORS: Record<string, string> = {
  seminar:   "bg-blue-50 text-blue-700",
  webinar:   "bg-purple-50 text-purple-700",
  reunion:   "bg-gold-100 text-gold-700",
  workshop:  "bg-green-50 text-green-700",
};

export function LandingEventsPreview({ events }: Props) {
  const { ref: headRef, inView: headIn } = useInView(0.3);
  const { ref: gridRef, inView: gridIn } = useInView(0.1);

  return (
    <section
      className="relative py-16 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(188,28,66,0.10) 0%, transparent 60%), #3B0010",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16 transition-all duration-700 ease-out ${
            headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <p className="text-[11px] font-semibold text-gold-500 tracking-[0.25em] uppercase mb-4">
              Upcoming Events
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Stay in the loop.
            </h2>
            <p className="mt-4 text-navy-300 text-lg font-light max-w-md leading-relaxed">
              Reunions, seminars, webinars, and more — exclusively for CEN alumni.
            </p>
          </div>
          <Link
            href="/signup"
            className="group shrink-0 inline-flex items-center gap-2 rounded-2xl border border-navy-700 px-6 py-3 text-sm font-medium text-navy-200 hover:bg-navy-800/60 hover:border-navy-600 transition-all duration-200"
          >
            View all events
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Cards */}
        <div ref={gridRef} className="grid md:grid-cols-3 gap-5">
          {events.map((ev, i) => (
              <Link
                key={ev.id}
                href="/signup"
                className={`group relative flex flex-col rounded-3xl overflow-hidden
                  hover:-translate-y-1 transition-all duration-300 ease-out
                  ${gridIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: gridIn ? `${i * 110}ms` : "0ms",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {/* Top gold line on hover */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                {/* Banner image (when present) */}
                {ev.bannerURL ? (
                  <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={ev.bannerURL}
                      alt={ev.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3B0010]/80 via-[#3B0010]/20 to-transparent" />
                    {/* Date block overlaid on image */}
                    <div className="absolute bottom-3 left-4 flex flex-col items-center justify-center rounded-xl bg-black/50 border border-gold-500/30 backdrop-blur-sm w-12 h-12">
                      <span className="text-[9px] font-bold text-gold-400 uppercase tracking-widest leading-none">
                        {formatMonth(ev.startDate)}
                      </span>
                      <span className="text-xl font-bold text-white leading-none mt-0.5">
                        {formatDay(ev.startDate)}
                      </span>
                    </div>
                    {/* Type badge overlaid on image */}
                    <span className={`absolute bottom-3 right-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider capitalize ${TYPE_COLORS[ev.type.toLowerCase()] ?? "bg-white/10 text-navy-200"}`}>
                      {ev.type}
                    </span>
                  </div>
                ) : (
                  /* No banner — keep original date + badge row */
                  <div className="px-7 pt-7">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-gold-500/10 border border-gold-500/20 w-14 h-14">
                        <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest leading-none">
                          {formatMonth(ev.startDate)}
                        </span>
                        <span className="text-2xl font-bold text-white leading-none mt-0.5">
                          {formatDay(ev.startDate)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider capitalize ${TYPE_COLORS[ev.type.toLowerCase()] ?? "bg-white/10 text-navy-200"}`}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className={`flex flex-col flex-1 px-7 pb-7 ${ev.bannerURL ? "pt-4" : "pt-0"}`}>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-white leading-snug mb-3 flex-1">
                    {ev.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-navy-400 mb-5">
                    {ev.isVirtual
                      ? <><Video size={12} className="text-navy-500" /> Online</>
                      : <><MapPin size={12} className="text-navy-500" /> {ev.location}</>
                    }
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.07] mb-5" />

                  {/* RSVP row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-navy-500">
                      {ev.rsvpCount > 0 ? `${ev.rsvpCount} going` : "Be the first to RSVP"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:text-gold-300 transition-colors duration-200">
                      <Lock size={10} /> RSVP
                    </span>
                  </div>
                </div>
              </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
