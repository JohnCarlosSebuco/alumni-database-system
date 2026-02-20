import React from "react";
import type { AlumniProfile } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile }

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500 sm:w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}

export function PersonalInfoTab({ profile }: Props) {
  return (
    <div className="space-y-1">
      <InfoRow label="Full Name" value={[profile.firstName, profile.lastName].filter(Boolean).join(" ")} />
      <InfoRow label="Date of Birth" value={profile.birthDate ? formatDate(profile.birthDate) : undefined} />
      <InfoRow label="Gender" value={profile.gender} />
      <InfoRow label="Contact Number" value={profile.contactNumber} />
      <InfoRow label="Address" value={profile.address} />
    </div>
  );
}
