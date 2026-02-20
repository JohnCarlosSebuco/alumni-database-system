"use client";

import React from "react";
import Link from "next/link";
import { Plus, Eye, Edit } from "lucide-react";
import { useJobs } from "@/lib/hooks/useJobs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import type { JobStatus } from "@/lib/types/job.types";

export const dynamic = 'force-dynamic';

const statusBadge: Record<JobStatus, "success" | "warning" | "default"> = {
  active: "success",
  draft:  "warning",
  closed: "default",
};

export default function AdminJobsPage() {
  const { jobs, loading } = useJobs({ adminView: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Postings"
        breadcrumbs={[{ label: "Admin" }, { label: "Jobs" }]}
        actions={
          <Link href="/admin/jobs/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Job</Button>
          </Link>
        }
      />

      {loading ? (
        <SkeletonTable rows={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title="No job postings yet"
          description="Create your first job posting to start receiving applications."
          action={<Link href="/admin/jobs/new"><Button variant="primary">Create Job</Button></Link>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Applicants</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.type} · {job.location}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{job.company}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge[job.status]}>{job.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{job.applicantCount}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(job.deadline)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/jobs/${job.id}/applicants`}>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-800 transition-colors" title="View applicants">
                          <Eye size={15} />
                        </button>
                      </Link>
                      <Link href={`/admin/jobs/${job.id}`}>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-800 transition-colors" title="Edit">
                          <Edit size={15} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
