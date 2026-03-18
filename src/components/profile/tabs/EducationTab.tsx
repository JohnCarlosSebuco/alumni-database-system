import React from "react";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile } from "@/lib/types/alumni.types";

interface Props { profile: AlumniProfile }

export function EducationTab({ profile }: Props) {
  if (!profile.education?.length) {
    return (
      <EmptyState
        icon={<GraduationCap size={40} />}
        title="No education records added yet."
        description="Add your educational background in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {profile.education.map((edu) => (
        <div key={edu.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <GraduationCap size={18} className="text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {edu.fieldOfStudy ? `${edu.degree} in ${edu.fieldOfStudy}` : edu.degree}
              </p>
              <p className="text-sm text-gray-600">{edu.institution}</p>
              <p className="text-xs text-gray-400 mt-1">
                {edu.yearStarted} — {edu.yearEnded ?? "Present"}
                {edu.honors && ` · ${edu.honors}`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
