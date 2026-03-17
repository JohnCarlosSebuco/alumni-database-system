"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { addDoc, jobsRef } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { JobForm } from "@/components/jobs/JobForm";
import { useToast } from "@/components/ui/Toast";
import type { JobFormInput } from "@/lib/utils/validators";

export const dynamic = "force-dynamic";

export default function AlumniNewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobFormInput) => {
    if (!user) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      await addDoc(jobsRef(), {
        ...data,
        status: "active",
        postedBy: user.uid,
        applicantCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      success("Job posting created!");
      router.push("/jobs");
    } catch {
      toastError("Failed to create job posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a Job"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Jobs", href: "/jobs" },
          { label: "Post a Job" },
        ]}
      />
      <Card>
        <CardBody>
          <JobForm
            defaultValues={{ status: "active" }}
            onSubmit={handleSubmit}
            loading={loading}
            hideStatus
          />
        </CardBody>
      </Card>
    </div>
  );
}
