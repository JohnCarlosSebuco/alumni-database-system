import React from "react";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile }

export function EmploymentHistoryTab({ profile }: Props) {
  if (!profile.employmentHistory?.length) {
    return (
      <EmptyState
        icon={<Briefcase size={40} />}
        title="No employment history"
        description="Add past work experience in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {profile.employmentHistory.map((h) => (
        <div key={h.id} className="rounded-xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-900">{h.position}</p>
          <p className="text-sm text-gray-600">{h.employerName}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(h.startDate)} — {h.endDate ? formatDate(h.endDate) : "Present"}
          </p>
          {h.responsibilities && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{h.responsibilities}</p>
          )}
        </div>
      ))}
    </div>
  );
}
