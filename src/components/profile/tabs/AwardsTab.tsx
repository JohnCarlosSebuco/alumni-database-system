import React from "react";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SurveyDataBanner } from "@/components/profile/SurveyDataBanner";
import type { AlumniProfile, UserDoc } from "@/lib/types/alumni.types";

interface Props { profile: AlumniProfile; userDoc?: UserDoc }

export function AwardsTab({ profile, userDoc }: Props) {
  const hasItems = profile.awards?.length > 0;
  const hasSurvey = userDoc?.awardsRaw;

  if (!hasItems && !hasSurvey) {
    return (
      <EmptyState
        icon={<Trophy size={40} />}
        title="No awards or recognitions added yet."
        description="Add awards and recognitions in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {hasSurvey && <SurveyDataBanner label="Awards & Recognition" rawText={userDoc.awardsRaw!} />}
      {profile.awards.map((a) => (
        <div key={a.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 flex-shrink-0">
              <Trophy size={18} className="text-gold-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{a.title}</p>
              <p className="text-sm text-gray-600">{a.grantedBy} · {a.year}</p>
              {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
