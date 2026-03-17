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

export const dynamic = "force-dynamic";

const ALUMNI_STATUS_OPTIONS = [
  { value: "active", label: "Active (visible to alumni)" },
  { value: "closed", label: "Closed" },
];

export default function AlumniEditJobPage() {
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
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Job;
        setJob(data);
      }
      setLoading(false);
    });
  }, [jobId]);

  useEffect(() => {
    if (!loading && (!job || (user && job.postedBy !== user.uid))) {
      router.replace("/jobs");
    }
  }, [loading, job, user, router]);

  const handleSubmit = async (data: JobFormInput) => {
    if (!jobId) return;
    setSaving(true);
    try {
      await updateDoc(jobRef(jobId), { ...data, updatedAt: new Date().toISOString() });
      success("Job posting updated!");
      router.push(`/jobs/${jobId}`);
    } catch {
      toastError("Failed to update job posting.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Job Posting"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Jobs", href: "/jobs" },
          { label: job.title, href: `/jobs/${jobId}` },
          { label: "Edit" },
        ]}
      />
      <Card>
        <CardBody>
          <JobForm
            defaultValues={{
              title: job.title,
              company: job.company,
              description: job.description,
              type: job.type,
              industry: job.industry,
              location: job.location,
              isRemote: job.isRemote,
              deadline: job.deadline,
              status: job.status === "draft" ? "active" : job.status,
            }}
            onSubmit={handleSubmit}
            loading={saving}
            statusOptions={ALUMNI_STATUS_OPTIONS}
          />
        </CardBody>
      </Card>
    </div>
  );
}
