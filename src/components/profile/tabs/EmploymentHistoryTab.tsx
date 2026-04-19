import React from "react";
import { Briefcase, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile, UserDoc } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile; userDoc?: UserDoc }

const JOB_INTERVALS = [
  { key: "jobAt1yr" as const, label: "Within 1 Year from Graduation" },
  { key: "jobAt2yr" as const, label: "Within 2 Years from Graduation" },
  { key: "jobAt5yr" as const, label: "Within 5 Years from Graduation" },
  { key: "jobAt8yr" as const, label: "Within 8 Years from Graduation" },
];

export function EmploymentHistoryTab({ profile, userDoc }: Props) {
  const hasHistory = profile.employmentHistory?.length > 0;
  const hasIntervals = userDoc && JOB_INTERVALS.some((j) => userDoc[j.key]);

  if (!hasHistory && !hasIntervals) {
    return (
      <EmptyState
        icon={<Briefcase size={40} />}
        title="No work history added yet."
        description="Add past work experience in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-6">
      {hasHistory && (
        <div className="space-y-4">
          {profile.employmentHistory.map((h) => (
            <div key={h.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{h.position}</p>
                  <p className="text-sm text-gray-600">{h.employerName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(h.startDate)} — {h.endDate ? formatDate(h.endDate) : "Present"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {h.isCourseAligned !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.isCourseAligned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {h.isCourseAligned ? "Course-aligned" : "Not aligned"}
                    </span>
                  )}
                  {h.isAbroad && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Abroad</span>
                  )}
                </div>
              </div>
              {h.responsibilities && (
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{h.responsibilities}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {hasIntervals && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-gray-500" />
            Employment Timeline from Survey
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {JOB_INTERVALS.map((j) => {
              const val = userDoc?.[j.key];
              if (!val) return null;
              return (
                <div key={j.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">{j.label}</p>
                  <p className="text-sm text-gray-800">{val}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
