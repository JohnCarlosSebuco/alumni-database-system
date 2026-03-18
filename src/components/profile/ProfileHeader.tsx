"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { calculateProfileComplete } from "@/lib/utils/profileComplete";
import { updateDoc, userDocRef } from "@/lib/firebase/firestore";
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

  // Lazy recalculation: if profileComplete is 0 but profile has data, recalculate and persist
  const didRecalc = useRef(false);
  const computed = calculateProfileComplete({
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    displayName: userDoc.displayName,
    birthday: userDoc.birthday,
    sex: userDoc.sex,
    contactNumber: userDoc.contactNumber ?? profile?.contactNumber,
    locality: userDoc.locality,
    batchYear: userDoc.batchYear,
    course: userDoc.course,
    department: userDoc.department,
    isEmployed: userDoc.isEmployed,
    currentCompany: userDoc.currentCompany,
    currentPosition: userDoc.currentPosition,
    licensesRaw: userDoc.licensesRaw,
    researchRaw: userDoc.researchRaw,
    communityExtensionRaw: userDoc.communityExtensionRaw,
    birthDate: profile?.birthDate,
    gender: profile?.gender,
    address: profile?.address,
    licenses: profile?.licenses,
    research: profile?.research,
    communityExtension: profile?.communityExtension,
    currentEmployment: profile?.currentEmployment,
  });

  const displayPercent = (userDoc.profileComplete === 0 && computed > 0) ? computed : (userDoc.profileComplete ?? 0);

  useEffect(() => {
    if (userDoc.profileComplete === 0 && computed > 0 && !didRecalc.current) {
      didRecalc.current = true;
      updateDoc(userDocRef(userDoc.uid), { profileComplete: computed }).catch(() => {});
    }
  }, [userDoc.uid, userDoc.profileComplete, computed]);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 p-4 sm:p-6 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <Avatar src={userDoc.photoURL} name={fullName} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{fullName}</h1>
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
              variant={(profile?.currentEmployment?.isEmployed ?? userDoc.isEmployed) ? "success" : "warning"}
            >
              {(profile?.currentEmployment?.isEmployed ?? userDoc.isEmployed) ? "Employed" : "Seeking Opportunities"}
            </Badge>
          </div>
        </div>
        <div className="flex sm:flex-col items-center gap-2">
          <CompletionRing percent={displayPercent} />
          <span className="text-xs text-navy-300">Profile</span>
        </div>
        {editable && (
          <Link href="/profile/edit" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" leftIcon={<Edit2 size={14} />} className="w-full sm:w-auto">
              Edit Profile
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
