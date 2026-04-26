"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { applicantsRef, jobRef, getDocs, getDoc, updateDoc, doc } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils/formatters";
import { Users, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Job, JobApplicant, ApplicantStatus } from "@/lib/types/job.types";
import { db } from "@/lib/firebase/firestore";

export const dynamic = 'force-dynamic';

const statusBadge: Record<ApplicantStatus, "default" | "info" | "success" | "error"> = {
  pending:     "default",
  reviewed:    "info",
  shortlisted: "success",
  rejected:    "error",
};

export default function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { success, error: toastError } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<(JobApplicant & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  useEffect(() => {
    if (!jobId) return;
    Promise.all([
      getDoc(jobRef(jobId)),
      getDocs(applicantsRef(jobId)),
    ]).then(([jobSnap, appSnap]) => {
      if (jobSnap.exists()) setJob({ id: jobSnap.id, ...jobSnap.data() } as Job);
      setApplicants(appSnap.docs.map((d) => ({ id: d.id, ...d.data() } as JobApplicant & { id: string })));
      setLoading(false);
    });
  }, [jobId]);

  const updateStatus = async (applicantId: string, status: ApplicantStatus) => {
    if (!jobId) return;
    try {
      await updateDoc(doc(db, "jobs", jobId, "applicants", applicantId), { status });
      setApplicants((prev) => prev.map((a) => a.id === applicantId ? { ...a, status } : a));
      success("Status updated.");
    } catch {
      toastError("Failed to update status.");
    }
  };

  const openDeleteModal = (applicantId: string, displayName: string) => {
    setConfirmDeleteId(applicantId);
    setConfirmDeleteName(displayName);
  };

  const confirmDelete = async () => {
    if (!jobId || !confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId: confirmDeleteId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete");
      }

      setApplicants((prev) => prev.filter((a) => a.id !== confirmDeleteId));
      success("Application deleted.");
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    } catch {
      toastError("Failed to delete application.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Applicants — ${job?.title ?? ""}`}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Jobs", href: "/admin/jobs" },
          { label: "Applicants" },
        ]}
      />

      <Card>
        <CardBody className="p-0">
          {applicants.length === 0 ? (
            <EmptyState
              icon={<Users size={48} />}
              title="No applicants yet"
              description="Applicants will appear here once alumni start applying."
              className="py-16"
            />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Applied</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resume</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.displayName}</p>
                      <p className="text-xs text-gray-500">{a.email}</p>
                      {a.coverNote && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic">"{a.coverNote}"</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(a.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <Select
                        options={[
                          { value: "pending",     label: "Pending" },
                          { value: "reviewed",    label: "Reviewed" },
                          { value: "shortlisted", label: "Shortlisted" },
                          { value: "rejected",    label: "Rejected" },
                        ]}
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value as ApplicantStatus)}
                        className="text-xs py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {a.resumeURL ? (
                        <a
                          href={a.resumeURL}
                          download
                          className="flex items-center gap-1 text-navy-800 hover:text-navy-600 text-xs font-medium"
                        >
                          Download <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No resume</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:text-error"
                        leftIcon={<Trash2 size={14} />}
                        loading={deletingId === a.id}
                        onClick={() => openDeleteModal(a.id, a.displayName)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={confirmDeleteId !== null}
        onClose={() => {
          setConfirmDeleteId(null);
          setConfirmDeleteName("");
        }}
        title="Delete Application"
        size="sm"
      >
        <div className="p-6 space-y-6">
          <p className="text-gray-700">
            Are you sure you want to delete the application from <span className="font-semibold">{confirmDeleteName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmDeleteId(null);
                setConfirmDeleteName("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-error hover:bg-error/90"
              loading={deletingId === confirmDeleteId}
              onClick={confirmDelete}
            >
              Delete Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
