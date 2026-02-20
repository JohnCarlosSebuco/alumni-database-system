"use client";

import React from "react";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UserDoc, AlumniProfile } from "@/lib/types/alumni.types";

interface ProfileHeaderProps {
  userDoc: UserDoc;
  profile: AlumniProfile | null;
  editable?: boolean;
}

function CompletionRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" className="stroke-gray-200" />
        <circle
          cx="36" cy="36" r={r} fill="none" strokeWidth="6"
          className="stroke-gold-500"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-navy-800">{percent}%</span>
    </div>
  );
}

export function ProfileHeader({ userDoc, profile, editable }: ProfileHeaderProps) {
  const fullName =
    userDoc.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    "Alumni";

  return (
    <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar src={userDoc.photoURL} name={fullName} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{fullName}</h1>
          <p className="text-navy-200 text-sm mt-1">
            {userDoc.course} · {userDoc.department}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {userDoc.batchYear && (
              <Badge variant="navy" className="bg-navy-700 text-navy-100">
                Batch {userDoc.batchYear}
              </Badge>
            )}
            <Badge
              variant={profile?.currentEmployment?.isEmployed ? "success" : "warning"}
            >
              {profile?.currentEmployment?.isEmployed ? "Employed" : "Seeking Opportunities"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CompletionRing percent={userDoc.profileComplete ?? 0} />
          <span className="text-xs text-navy-300">Profile</span>
        </div>
        {editable && (
          <Link href="/profile/edit">
            <Button variant="secondary" size="sm" leftIcon={<Edit2 size={14} />}>
              Edit Profile
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
