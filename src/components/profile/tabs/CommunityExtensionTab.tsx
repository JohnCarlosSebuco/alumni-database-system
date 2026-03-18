import React from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SurveyDataBanner } from "@/components/profile/SurveyDataBanner";
import type { AlumniProfile, UserDoc } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile; userDoc?: UserDoc }

export function CommunityExtensionTab({ profile, userDoc }: Props) {
  const hasItems = profile.communityExtension?.length > 0;
  const hasSurvey = userDoc?.communityExtensionRaw;

  if (!hasItems && !hasSurvey) {
    return (
      <EmptyState
        icon={<Heart size={40} />}
        title="No community extension activities added yet."
        description="Add community or extension programs in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {hasSurvey && <SurveyDataBanner label="Community Extension" rawText={userDoc.communityExtensionRaw!} />}
      {profile.communityExtension.map((c) => (
        <div key={c.id} className="rounded-xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-900">{c.programName}</p>
          <p className="text-sm text-gray-600">{c.organization} · {c.role}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(c.startDate)} — {c.endDate ? formatDate(c.endDate) : "Present"}
          </p>
        </div>
      ))}
    </div>
  );
}
