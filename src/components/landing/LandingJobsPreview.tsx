"use client";
import Link from "next/link";
import { ArrowRight, MapPin, Wifi, Lock } from "lucide-react";
import { useInView } from "@/lib/hooks/useInView";

export interface JobPreview {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  isRemote: boolean;
  createdAt: string;
}

interface Props {
  jobs: JobPreview[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const TYPE_LABELS: Record<string, string> = {
  "full-time":  "Full-time",
  "part-time":  "Part-time",
  contract:     "Contract",
  internship:   "Internship",
};

export function LandingJobsPreview({ jobs }: Props) {
  const { ref: leftRef,  inView: leftIn  } = useInView(0.3);
  const { ref: rightRef, inView: rightIn } = useInView(0.15);

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#3B0010 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24 items-start">

          {/* ── Left: heading + CTA ── */}
          <div
            ref={leftRef}
            className={`lg:sticky lg:top-28 transition-all duration-700 ease-out ${
              leftIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <p className="text-[11px] font-semibold text-gold-600 tracking-[0.25em] uppercase mb-4">
              Job Board
            </p>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Your next role is waiting.
            </h2>
            <p className="text-lg text-gray-400 font-light leading-relaxed mb-10 max-w-sm">
              Browse job postings from companies actively looking for SLSU CEN graduates. Sign up to view full details and apply.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-navy-800 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(59,0,16,0.2)]"
            >
              Browse all jobs
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          {/* ── Right: job cards ── */}
          <div ref={rightRef} className="space-y-4">
            {jobs.map((job, i) => (
                <Link
                  key={job.id}
                  href="/signup"
                  className={`group relative block rounded-3xl border border-gray-100 bg-gray-50/80 p-6
                    hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(59,0,16,0.07)] hover:border-transparent
                    transition-all duration-300 ease-out
                    ${rightIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: rightIn ? `${i * 100}ms` : "0ms" }}
                >
                  {/* Top accent on hover */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-semibold text-navy-700 uppercase tracking-wide">
                          {TYPE_LABELS[job.type] ?? job.type}
                        </span>
                        {job.isRemote && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-gold-700">
                            <Wifi size={10} /> Remote
                          </span>
                        )}
                        {!job.isRemote && job.location && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                            <MapPin size={11} /> {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-500 group-hover:border-navy-300 group-hover:text-navy-700 transition-colors duration-200">
                      <Lock size={11} /> Apply
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] text-gray-400">{timeAgo(job.createdAt)}</p>
                </Link>
            ))}

            {/* Sign-up nudge */}
            {(
              <div className={`rounded-3xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-5 flex items-center justify-between gap-4 transition-all duration-700 ${rightIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: rightIn ? "400ms" : "0ms" }}>
                <p className="text-sm text-navy-600 font-medium">
                  Sign up to see all open positions and apply directly.
                </p>
                <Link href="/signup" className="shrink-0 text-sm font-semibold text-navy-800 hover:text-navy-900 underline underline-offset-2 transition-colors">
                  Join free →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
