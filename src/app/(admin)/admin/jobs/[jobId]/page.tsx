"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobRef, getDoc, updateDoc } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { JobForm } from "@/components/jobs/JobForm";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
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

  if (loading) return <PageLoader />;
  if (!job) return <p className="p-8 text-gray-500">Job not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Job Posting"
        breadcrumbs={[{ label: "Admin" }, { label: "Jobs", href: "/admin/jobs" }, { label: "Edit" }]}
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
    </div>
  );
}
