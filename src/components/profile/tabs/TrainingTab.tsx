import React from "react";
import { BookMarked } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SurveyDataBanner } from "@/components/profile/SurveyDataBanner";
import type { AlumniProfile, UserDoc } from "@/lib/types/alumni.types";

interface Props { profile: AlumniProfile; userDoc?: UserDoc }

export function TrainingTab({ profile, userDoc }: Props) {
  const hasItems = profile.training?.length > 0;
  const hasSurvey = userDoc?.trainingRaw;

  if (!hasItems && !hasSurvey) {
    return (
      <EmptyState
        icon={<BookMarked size={40} />}
        title="No training or seminars added yet."
        description="Add professional training and seminars in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {hasSurvey && <SurveyDataBanner label="Professional Training & Seminars" rawText={userDoc.trainingRaw!} />}
      {profile.training?.map((t) => (
        <div key={t.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <BookMarked size={18} className="text-purple-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{t.title}</p>
              {t.provider && <p className="text-sm text-gray-600">{t.provider}</p>}
              {t.dateCompleted && <p className="text-xs text-gray-400 mt-1">{t.dateCompleted}</p>}
              {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
