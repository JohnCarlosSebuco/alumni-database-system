import React from "react";
import Link from "next/link";
import { MapPin, Clock, Users, Wifi, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { Job } from "@/lib/types/job.types";

interface JobCardProps {
  job: Job;
  href?: string;
}

const typeStyle: Record<string, string> = {
  "Full-time":  "bg-blue-50   text-blue-700   border-blue-100",
  "Part-time":  "bg-purple-50 text-purple-700 border-purple-100",
  "Contract":   "bg-orange-50 text-orange-700 border-orange-100",
  "Internship": "bg-teal-50   text-teal-700   border-teal-100",
  "Freelance":  "bg-pink-50   text-pink-700   border-pink-100",
};

const companyColors = [
  "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-orange-500", "bg-rose-600", "bg-teal-600", "bg-indigo-600",
];

function companyColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return companyColors[h % companyColors.length];
}

function deadlineSoon(deadline: string) {
  const days = (new Date(deadline).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= 7;
}

function deadlinePast(deadline: string) {
  return new Date(deadline).getTime() < Date.now();
}

export function JobCard({ job, href }: JobCardProps) {
  const url = href ?? `/jobs/${job.id}`;
  const soon = deadlineSoon(job.deadline);
  const past = deadlinePast(job.deadline);
  const initial = job.company?.charAt(0)?.toUpperCase() ?? "?";
  const avatarBg = companyColor(job.company ?? "");

  return (
    <Link href={url} className="block group">
      <div className="flex flex-col gap-0 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150 overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-navy-800 to-navy-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

        <div className="p-5 space-y-4">
          {/* Header: company avatar + title + type badge */}
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white text-base font-bold",
                avatarBg
              )}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-navy-800 transition-colors leading-snug line-clamp-1">
                  {job.title}
                </h3>
                <span
                  className={cn(
                    "flex-shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                    typeStyle[job.type] ?? "bg-gray-100 text-gray-600 border-gray-200"
                  )}
                >
                  {job.type}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{job.company}</p>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {job.description}
            </p>
          )}

          {/* Tags: industry */}
          {job.industry && (
            <span className="inline-block rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[11px] text-gray-500 font-medium">
              {job.industry}
            </span>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 pt-1 border-t border-gray-50">
            <span className="flex items-center gap-1">
              {job.isRemote ? (
                <><Wifi size={11} className="text-teal-500" /><span className="text-teal-600 font-medium">Remote</span></>
              ) : (
                <><MapPin size={11} />{job.location || "—"}</>
              )}
            </span>

            <span className="flex items-center gap-1">
              <Users size={11} />
              {job.applicantCount ?? 0} applicant{(job.applicantCount ?? 0) !== 1 ? "s" : ""}
            </span>

            <span
              className={cn(
                "ml-auto flex items-center gap-1",
                soon ? "text-red-600 font-semibold" : past ? "text-gray-300 line-through" : ""
              )}
            >
              <Clock size={11} className={soon ? "text-red-500" : ""} />
              {soon ? "Closing soon · " : "Deadline: "}
              {formatDate(job.deadline)}
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-end px-5 py-2.5 bg-gray-50/60 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-700 group-hover:text-navy-900 transition-colors">
            View details <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
