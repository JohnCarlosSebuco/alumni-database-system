import React from "react";
import { Award } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SurveyDataBanner } from "@/components/profile/SurveyDataBanner";
import type { AlumniProfile, UserDoc } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile; userDoc?: UserDoc }

export function LicensesTab({ profile, userDoc }: Props) {
  const hasItems = profile.licenses?.length > 0;
  const hasSurvey = userDoc?.licensesRaw;

  if (!hasItems && !hasSurvey) {
    return (
      <EmptyState
        icon={<Award size={40} />}
        title="No licenses or certifications added yet."
        description="Add professional licenses in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {hasSurvey && <SurveyDataBanner label="Licenses & Certifications" rawText={userDoc.licensesRaw!} />}
      {profile.licenses.map((lic) => (
        <div key={lic.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{lic.name}</p>
              <p className="text-sm text-gray-600">{lic.issuingBody}</p>
              <p className="text-xs text-gray-400 mt-1">
                License No.: {lic.licenseNumber || "\u2014"} · Issued: {lic.dateIssued ? formatDate(lic.dateIssued) : "\u2014"}
              </p>
            </div>
            {lic.fileURL && (
              <a href={lic.fileURL} target="_blank" rel="noopener noreferrer"
                className="text-xs text-navy-800 underline whitespace-nowrap">
                View File
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
