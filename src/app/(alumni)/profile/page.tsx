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
import {
  User, GraduationCap, Briefcase, Clock, Award,
  Trophy, BookOpen, Heart,
} from "lucide-react";

export const dynamic = 'force-dynamic';

const TABS = [
  { key: "personal",   label: "Personal",   icon: <User size={14} /> },
  { key: "education",  label: "Education",  icon: <GraduationCap size={14} /> },
  { key: "employment", label: "Employment", icon: <Briefcase size={14} /> },
  { key: "history",    label: "Work History",icon: <Clock size={14} /> },
  { key: "licenses",   label: "Licenses",   icon: <Award size={14} /> },
  { key: "awards",     label: "Awards",     icon: <Trophy size={14} /> },
  { key: "research",   label: "Research",   icon: <BookOpen size={14} /> },
  { key: "community",  label: "Community",  icon: <Heart size={14} /> },
];

export default function ProfilePage() {
  const { userDoc } = useAuth();
  const { profile, loading } = useProfile();
  const [activeTab, setActiveTab] = useState("personal");

  if (loading || !userDoc) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />

      <ProfileHeader userDoc={userDoc} profile={profile} editable />

      <Card>
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} className="px-2" />
        <CardBody>
          {!profile ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              Your profile is empty. <a href="/profile/edit" className="text-navy-800 underline">Fill it in now</a>.
            </p>
          ) : (
            <>
              {activeTab === "personal"   && <PersonalInfoTab profile={profile} />}
              {activeTab === "education"  && <EducationTab profile={profile} />}
              {activeTab === "employment" && <EmploymentTab profile={profile} />}
              {activeTab === "history"    && <EmploymentHistoryTab profile={profile} />}
              {activeTab === "licenses"   && <LicensesTab profile={profile} />}
              {activeTab === "awards"     && <AwardsTab profile={profile} />}
              {activeTab === "research"   && <ResearchTab profile={profile} />}
              {activeTab === "community"  && <CommunityExtensionTab profile={profile} />}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
