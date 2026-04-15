"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobRef, getDoc, updateDoc, deleteDoc } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { JobForm } from "@/components/jobs/JobForm";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import type { Job } from "@/lib/types/job.types";
import type { JobFormInput } from "@/lib/utils/validators";

export const dynamic = 'force-dynamic';

export default function EditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    getDoc(jobRef(jobId)).then((snap) => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() } as Job);
      setLoading(false);
    });
  }, [jobId]);

  const handleSubmit = async (data: JobFormInput) => {
    if (!jobId) return;
    setSaving(true);
    try {
      const prevStatus = job?.status;
      await updateDoc(jobRef(jobId), { ...data, updatedAt: new Date().toISOString() });

      if (data.status === "active" && prevStatus !== "active" && user) {
        const idToken = await user.getIdToken();
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            type: "job_posted",
            title: "New Job Opportunity",
            body: `${data.title} at ${data.company} is now open for applications.`,
            link: "/jobs",
          }),
        });
      }

      success("Job posting updated!");
      router.push("/admin/jobs");
    } catch {
      toastError("Failed to update job posting.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;
    setDeleting(true);
    try {
      await deleteDoc(jobRef(jobId));
      success("Job posting deleted.");
      router.push("/admin/jobs");
    } catch {
      toastError("Failed to delete job posting.");
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return <p className="p-8 text-gray-500">Job not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Job Posting"
        breadcrumbs={[{ label: "Admin" }, { label: "Jobs", href: "/admin/jobs" }, { label: "Edit" }]}
        actions={
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Job
          </Button>
        }
      />
      <Card>
        <CardBody>
          <JobForm
            defaultValues={{
              title: job.title, company: job.company, description: job.description,
              type: job.type, industry: job.industry, location: job.location,
              isRemote: job.isRemote, deadline: job.deadline, status: job.status,
            }}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </CardBody>
      </Card>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Job Posting</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete <span className="font-medium text-gray-700">{job.title}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
