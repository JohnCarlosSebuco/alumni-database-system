"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { PersonalInfoTab } from "@/components/profile/tabs/PersonalInfoTab";
import { EducationTab } from "@/components/profile/tabs/EducationTab";
import { EmploymentTab } from "@/components/profile/tabs/EmploymentTab";
import { EmploymentHistoryTab } from "@/components/profile/tabs/EmploymentHistoryTab";
import { LicensesTab } from "@/components/profile/tabs/LicensesTab";
import { AwardsTab } from "@/components/profile/tabs/AwardsTab";
import { ResearchTab } from "@/components/profile/tabs/ResearchTab";
import { CommunityExtensionTab } from "@/components/profile/tabs/CommunityExtensionTab";
import { TrainingTab } from "@/components/profile/tabs/TrainingTab";
import {
  User, GraduationCap, Briefcase, Clock, Award,
  Trophy, BookOpen, Heart, BookMarked,
} from "lucide-react";

export const dynamic = 'force-dynamic';

const TABS = [
  { key: "personal",   label: "Personal",   icon: <User size={14} /> },
  { key: "education",  label: "Education",  icon: <GraduationCap size={14} /> },
  { key: "training",   label: "Training",   icon: <BookMarked size={14} /> },
  { key: "employment", label: "Employment", icon: <Briefcase size={14} /> },
  { key: "history",    label: "Work History",icon: <Clock size={14} /> },
  { key: "licenses",   label: "Licenses",   icon: <Award size={14} /> },
  { key: "awards",     label: "Awards",     icon: <Trophy size={14} /> },
  { key: "research",   label: "Research",   icon: <BookOpen size={14} /> },
  { key: "community",  label: "Community",  icon: <Heart size={14} /> },
];

const TAB_TO_STEP: Record<string, number> = {
  personal: 0,
  education: 3,
  training: 3,
  employment: 2,
  history: 3,
  licenses: 4,
  awards: 5,
  research: 6,
  community: 7,
};

export default function ProfilePage() {
  const { userDoc, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("personal");

  if (authLoading || profileLoading) return <PageLoader />;
  if (!userDoc) return <p className="p-8 text-gray-500">Unable to load your account. Please sign out and sign in again.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />

      <ProfileHeader userDoc={userDoc} profile={profile} editable editHref={`/profile/edit?step=${TAB_TO_STEP[activeTab] ?? 0}`} />

      <Card>
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} className="px-2" />
        <CardBody>
          {(() => {
            const p = profile ?? {
              firstName: "", lastName: "", birthDate: "", gender: "", address: "", contactNumber: "",
              education: [], currentEmployment: { isEmployed: false, employerName: "", position: "", industry: "", employmentType: "", startDate: "", city: "" },
              employmentHistory: [], licenses: [], awards: [], research: [], communityExtension: [], training: [],
            };
            const hasSurveyData = userDoc?.licensesRaw || userDoc?.researchRaw || userDoc?.communityExtensionRaw || userDoc?.awardsRaw || userDoc?.trainingRaw;
            const editStep = TAB_TO_STEP[activeTab] ?? 0;
            if (!profile && !hasSurveyData) {
              return (
                <p className="text-sm text-gray-500 py-8 text-center">
                  Your profile is empty. <a href={`/profile/edit?step=${editStep}`} className="text-navy-800 underline">Fill it in now</a>.
                </p>
              );
            }
            return (
              <>
                <div className="mb-6 flex justify-end">
                  <a href={`/profile/edit?step=${editStep}`} className="inline-flex items-center gap-1 text-sm text-navy-700 hover:text-navy-900 underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit this section
                  </a>
                </div>
                {activeTab === "personal"   && <PersonalInfoTab profile={p} />}
                {activeTab === "education"  && <EducationTab profile={p} />}
                {activeTab === "training"   && <TrainingTab profile={p} userDoc={userDoc} />}
                {activeTab === "employment" && <EmploymentTab profile={p} />}
                {activeTab === "history"    && <EmploymentHistoryTab profile={p} userDoc={userDoc} />}
                {activeTab === "licenses"   && <LicensesTab profile={p} userDoc={userDoc} />}
                {activeTab === "awards"     && <AwardsTab profile={p} userDoc={userDoc} />}
                {activeTab === "research"   && <ResearchTab profile={p} userDoc={userDoc} />}
                {activeTab === "community"  && <CommunityExtensionTab profile={p} userDoc={userDoc} />}
              </>
            );
          })()}
        </CardBody>
      </Card>
    </div>
  );
}
