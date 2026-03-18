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
import { Modal } from "@/components/ui/Modal";
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
import { TrainingTab } from "@/components/profile/tabs/TrainingTab";
import {
  User, GraduationCap, Briefcase, Clock, Award, Trophy, BookOpen, Heart,
  Trash2, Pencil, Mail, BookMarked,
} from "lucide-react";
import type { UserDoc, AlumniProfile } from "@/lib/types/alumni.types";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "personal",   label: "Personal",    icon: <User size={14} /> },
  { key: "education",  label: "Education",   icon: <GraduationCap size={14} /> },
  { key: "training",   label: "Training",    icon: <BookMarked size={14} /> },
  { key: "employment", label: "Employment",  icon: <Briefcase size={14} /> },
  { key: "history",    label: "Work History",icon: <Clock size={14} /> },
  { key: "licenses",   label: "Licenses",    icon: <Award size={14} /> },
  { key: "awards",     label: "Awards",      icon: <Trophy size={14} /> },
  { key: "research",   label: "Research",    icon: <BookOpen size={14} /> },
  { key: "community",  label: "Community",   icon: <Heart size={14} /> },
];

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});
const COURSE_OPTIONS = [
  { value: "Bachelor of Science in Industrial Engineering", label: "BS Industrial Engineering" },
  { value: "Bachelor of Science in Electronics Engineering", label: "BS Electronics Engineering" },
  { value: "Bachelor of Science in Mechanical Engineering", label: "BS Mechanical Engineering" },
];

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  batchYear: string;
  course: string;
  studentId: string;
  isActive: boolean;
}

export default function AdminAlumniDetailPage() {
  const { alumniId } = useParams<{ alumniId: string }>();
  const router = useRouter();
  const { userDoc: callerDoc } = useAuth();
  const { success, error } = useToast();

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: "", lastName: "", email: "", batchYear: "", course: "", studentId: "", isActive: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Partial<EditForm>>({});

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

  function openEdit() {
    if (!userDoc) return;
    const parts = userDoc.displayName?.split(" ") ?? [];
    const firstName = parts.slice(0, -1).join(" ") || parts[0] || "";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    setEditForm({
      firstName,
      lastName,
      email: userDoc.email ?? "",
      batchYear: userDoc.batchYear ? String(userDoc.batchYear) : "",
      course: userDoc.course ?? "",
      studentId: userDoc.studentId ?? "",
      isActive: userDoc.isActive ?? true,
    });
    setEditErrors({});
    setShowEdit(true);
  }

  function validateEdit(): boolean {
    const errs: Partial<EditForm> = {};
    if (!editForm.firstName.trim()) errs.firstName = "Required";
    if (!editForm.lastName.trim()) errs.lastName = "Required";
    if (!editForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
      errs.email = "Valid email required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEdit()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/alumni/${alumniId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");

      // Optimistically update local state
      const displayName = `${editForm.firstName.trim()} ${editForm.lastName.trim()}`;
      setUserDoc((prev) =>
        prev
          ? {
              ...prev,
              displayName,
              email: editForm.email.trim(),
              batchYear: editForm.batchYear ? Number(editForm.batchYear) : null,
              course: editForm.course || null,
              studentId: editForm.studentId,
              isActive: editForm.isActive,
            }
          : prev
      );
      setShowEdit(false);
      success("Alumni account updated successfully.");
    } catch (e) {
      error((e as Error).message);
    } finally {
      setEditLoading(false);
    }
  }

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

  const isAdmin = callerDoc?.role === "admin" || callerDoc?.role === "super_admin";

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
          isAdmin ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Pencil size={14} />}
                onClick={openEdit}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={15} />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Delete confirmation */}
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

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Alumni Account" size="md">
        <form onSubmit={handleEdit} className="p-6 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
              {editErrors.firstName && <p className="mt-1 text-xs text-red-500">{editErrors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
              {editErrors.lastName && <p className="mt-1 text-xs text-red-500">{editErrors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
            </div>
            {editErrors.email && <p className="mt-1 text-xs text-red-500">{editErrors.email}</p>}
          </div>

          {/* Batch Year + Course */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
              <select
                value={editForm.batchYear}
                onChange={(e) => setEditForm((f) => ({ ...f, batchYear: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              >
                <option value="">Select year</option>
                {BATCH_YEAR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={editForm.course}
                onChange={(e) => setEditForm((f) => ({ ...f, course: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              >
                <option value="">Select course</option>
                {COURSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student / Alumni ID No.</label>
            <input
              type="text"
              placeholder="e.g. CEN25-0010"
              value={editForm.studentId}
              onChange={(e) => setEditForm((f) => ({ ...f, studentId: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Account active</p>
              <p className="text-xs text-gray-400">Inactive accounts cannot sign in</p>
            </div>
            <button
              type="button"
              onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                editForm.isActive ? "bg-navy-800" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  editForm.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <ProfileHeader userDoc={userDoc} profile={profile} editable={false} />

      <Card>
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} className="px-2" />
        <CardBody>
          {(() => {
            const p = profile ?? {
              firstName: "", lastName: "", birthDate: "", gender: "", address: "", contactNumber: "",
              education: [], currentEmployment: { isEmployed: false, employerName: "", position: "", industry: "", employmentType: "", startDate: "", city: "" },
              employmentHistory: [], licenses: [], awards: [], research: [], communityExtension: [], training: [],
            };
            return (
              <>
                {activeTab === "personal"   && <PersonalInfoTab profile={p} />}
                {activeTab === "education"  && <EducationTab profile={p} />}
                {activeTab === "training"   && <TrainingTab profile={p} userDoc={userDoc ?? undefined} />}
                {activeTab === "employment" && <EmploymentTab profile={p} />}
                {activeTab === "history"    && <EmploymentHistoryTab profile={p} userDoc={userDoc ?? undefined} />}
                {activeTab === "licenses"   && <LicensesTab profile={p} userDoc={userDoc ?? undefined} />}
                {activeTab === "awards"     && <AwardsTab profile={p} userDoc={userDoc ?? undefined} />}
                {activeTab === "research"   && <ResearchTab profile={p} userDoc={userDoc ?? undefined} />}
                {activeTab === "community"  && <CommunityExtensionTab profile={p} userDoc={userDoc ?? undefined} />}
              </>
            );
          })()}
        </CardBody>
      </Card>
    </div>
  );
}
