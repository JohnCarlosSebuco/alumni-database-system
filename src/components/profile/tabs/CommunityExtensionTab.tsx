import React from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile }

export function CommunityExtensionTab({ profile }: Props) {
  if (!profile.communityExtension?.length) {
    return (
      <EmptyState
        icon={<Heart size={40} />}
        title="No community extension work"
        description="Add community or extension programs in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
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
