import React from "react";
import { Award } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile }

export function LicensesTab({ profile }: Props) {
  if (!profile.licenses?.length) {
    return (
      <EmptyState
        icon={<Award size={40} />}
        title="No licenses"
        description="Add professional licenses in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {profile.licenses.map((lic) => (
        <div key={lic.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{lic.name}</p>
              <p className="text-sm text-gray-600">{lic.issuingBody}</p>
              <p className="text-xs text-gray-400 mt-1">
                License No.: {lic.licenseNumber || "—"} · Issued: {lic.dateIssued ? formatDate(lic.dateIssued) : "—"}
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
