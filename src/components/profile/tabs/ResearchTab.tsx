import React from "react";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumniProfile } from "@/lib/types/alumni.types";

interface Props { profile: AlumniProfile }

export function ResearchTab({ profile }: Props) {
  if (!profile.research?.length) {
    return (
      <EmptyState
        icon={<BookOpen size={40} />}
        title="No research publications"
        description="Add research publications in the profile editor."
      />
    );
  }
  return (
    <div className="space-y-4">
      {profile.research.map((r) => (
        <div key={r.id} className="rounded-xl border border-gray-100 p-4">
          <p className="font-semibold text-gray-900">{r.title}</p>
          <p className="text-sm text-gray-600">{r.publishedIn} · {r.year}</p>
          {r.coAuthors && <p className="text-xs text-gray-500 mt-1">Co-authors: {r.coAuthors}</p>}
          {r.doiOrLink && (
            <a href={r.doiOrLink} target="_blank" rel="noopener noreferrer"
              className="text-xs text-navy-800 underline mt-1 inline-block">
              View Publication
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
