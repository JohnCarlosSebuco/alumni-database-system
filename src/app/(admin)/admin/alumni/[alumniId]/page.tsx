"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userDocRef, profileDocRef, getDoc } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { PageLoader } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { PersonalInfoTab } from "@/components/profile/tabs/PersonalInfoTab";
import { EducationTab } from "@/components/profile/tabs/EducationTab";
import { EmploymentTab } from "@/components/profile/tabs/EmploymentTab";
import { EmploymentHistoryTab } from "@/components/profile/tabs/EmploymentHistoryTab";
import { LicensesTab } from "@/components/profile/tabs/LicensesTab";
import { AwardsTab } from "@/components/profile/tabs/AwardsTab";
import { ResearchTab } from "@/components/profile/tabs/ResearchTab";
import { CommunityExtensionTab } from "@/components/profile/tabs/CommunityExtensionTab";
import {
  User, GraduationCap, Briefcase, Clock, Award, Trophy, BookOpen, Heart, Trash2,
} from "lucide-react";
import type { UserDoc, AlumniProfile } from "@/lib/types/alumni.types";

export const dynamic = 'force-dynamic';

const TABS = [
  { key: "personal",   label: "Personal",    icon: <User size={14} /> },
  { key: "education",  label: "Education",   icon: <GraduationCap size={14} /> },
  { key: "employment", label: "Employment",  icon: <Briefcase size={14} /> },
  { key: "history",    label: "Work History",icon: <Clock size={14} /> },
  { key: "licenses",   label: "Licenses",    icon: <Award size={14} /> },
  { key: "awards",     label: "Awards",      icon: <Trophy size={14} /> },
  { key: "research",   label: "Research",    icon: <BookOpen size={14} /> },
  { key: "community",  label: "Community",   icon: <Heart size={14} /> },
];

export default function AdminAlumniDetailPage() {
  const { alumniId } = useParams<{ alumniId: string }>();
  const router = useRouter();
  const { userDoc: callerDoc } = useAuth();
  const { success, error } = useToast();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!alumniId) return;
    Promise.all([
      getDoc(userDocRef(alumniId)),
      getDoc(profileDocRef(alumniId)),
    ]).then(([userSnap, profileSnap]) => {
      if (userSnap.exists()) setUserDoc({ uid: userSnap.id, ...userSnap.data() } as UserDoc);
      if (profileSnap.exists()) setProfile(profileSnap.data() as AlumniProfile);
      setLoading(false);
    });
  }, [alumniId]);

  const handleDelete = async () => {
    if (!alumniId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/super/delete-alumni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUid: alumniId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      success("Alumni account permanently deleted.");
      router.replace("/admin/alumni");
    } catch (e) {
      error((e as Error).message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!userDoc) return <p className="p-8 text-gray-500">Alumni not found.</p>;

  const isSuperAdmin = callerDoc?.role === "super_admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={userDoc.displayName}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Alumni", href: "/admin/alumni" },
          { label: userDoc.displayName },
        ]}
        actions={
          isSuperAdmin ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={15} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Alumni Account"
        message={`This will permanently delete ${userDoc.displayName}'s account and all their data. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        loading={deleteLoading}
      />

      <ProfileHeader userDoc={userDoc} profile={profile} editable={false} />

      <Card>
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} className="px-2" />
        <CardBody>
          {!profile ? (
            <p className="text-sm text-gray-500 py-8 text-center">This alumni has not completed their profile yet.</p>
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
