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

export const dynamic = 'force-dynamic';

export default function NewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: JobFormInput) => {
    setLoading(true);
    try {
      await addDoc(jobsRef(), {
        ...data,
        applicantCount: 0,
        postedBy: user?.uid ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (data.status === "active" && user) {
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

      success("Job posting created!");
      router.push("/admin/jobs");
    } catch {
      toastError("Failed to create job posting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Job Posting"
        breadcrumbs={[{ label: "Admin" }, { label: "Jobs", href: "/admin/jobs" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <JobForm onSubmit={handleSubmit} loading={loading} />
        </CardBody>
      </Card>
    </div>
  );
}
