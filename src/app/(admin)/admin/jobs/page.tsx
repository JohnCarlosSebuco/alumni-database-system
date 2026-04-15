"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Briefcase,
  Users,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  Clock3,
  XCircle,
  Wifi,
  Trash2,
} from "lucide-react";
import { useJobs } from "@/lib/hooks/useJobs";
import { jobRef, deleteDoc } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/Toast";
import type { JobStatus } from "@/lib/types/job.types";

export const dynamic = "force-dynamic";

type FilterKey = "all" | JobStatus;

const statusConfig: Record<
  JobStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    classes: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={11} />,
  },
  draft: {
    label: "Draft",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock3 size={11} />,
  },
  closed: {
    label: "Closed",
    classes: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <XCircle size={11} />,
  },
};

const typeColor: Record<string, string> = {
  "Full-time":  "bg-blue-50   text-blue-700   border-blue-100",
  "Part-time":  "bg-purple-50 text-purple-700  border-purple-100",
  "Contract":   "bg-orange-50 text-orange-700  border-orange-100",
  "Internship": "bg-teal-50   text-teal-700    border-teal-100",
};

function isDeadlineSoon(deadline: string) {
  const days = (new Date(deadline).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= 7;
}

function isDeadlinePast(deadline: string) {
  return new Date(deadline).getTime() < Date.now();
}

export default function AdminJobsPage() {
  const { jobs, loading } = useJobs({ adminView: true });
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { success, error: toastError } = useToast();

  const counts = useMemo(
    () => ({
      all:    jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      draft:  jobs.filter((j) => j.status === "draft").length,
      closed: jobs.filter((j) => j.status === "closed").length,
    }),
    [jobs]
  );

  const visible = useMemo(
    () => (filter === "all" ? jobs : jobs.filter((j) => j.status === filter)),
    [jobs, filter]
  );

  const totalApplicants = useMemo(
    () => jobs.reduce((s, j) => s + (j.applicantCount ?? 0), 0),
    [jobs]
  );

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",    label: "All",    count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "draft",  label: "Draft",  count: counts.draft },
    { key: "closed", label: "Closed", count: counts.closed },
  ];

  const allVisibleSelected =
    visible.length > 0 && visible.every((j) => selected.has(j.id));

  function toggleAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((j) => next.delete(j.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((j) => next.add(j.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDeleteOne() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(jobRef(deleteTarget.id));
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
      success("Job posting deleted.");
    } catch {
      toastError("Failed to delete job posting.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleBulkDelete() {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selected).map((id) => deleteDoc(jobRef(id))));
      success(`${selected.size} job posting${selected.size > 1 ? "s" : ""} deleted.`);
      setSelected(new Set());
    } catch {
      toastError("Failed to delete some job postings.");
    } finally {
      setDeleting(false);
      setBulkConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Postings"
        breadcrumbs={[{ label: "Admin" }, { label: "Jobs" }]}
        actions={
          <Link href="/admin/jobs/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              New Job
            </Button>
          </Link>
        }
      />

      {/* ── Stats strip ── */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: counts.all,       color: "bg-navy-50  text-navy-800",  dot: "bg-navy-400"  },
            { label: "Active",      value: counts.active,    color: "bg-green-50 text-green-800", dot: "bg-green-500" },
            { label: "Draft",       value: counts.draft,     color: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
            { label: "Applicants",  value: totalApplicants,  color: "bg-blue-50  text-blue-800",  dot: "bg-blue-400"  },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3",
                s.color
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", s.dot)} />
              <div>
                <p className="text-xl font-bold leading-none">{s.value}</p>
                <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title="No job postings yet"
          description="Create your first job posting to start receiving applications."
          action={
            <Link href="/admin/jobs/new">
              <Button variant="primary">Create Job</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {/* ── Bulk action bar ── */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-red-50 border-b border-red-100">
              <span className="text-sm font-medium text-red-700">
                {selected.size} job{selected.size > 1 ? "s" : ""} selected
              </span>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={13} />}
                onClick={() => setBulkConfirm(true)}
              >
                Delete Selected
              </Button>
            </div>
          )}

          {/* ── Filter tabs ── */}
          <div className="flex items-center border-b border-gray-100 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  filter === tab.key
                    ? "border-navy-800 text-navy-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none min-w-[18px]",
                    filter === tab.key
                      ? "bg-navy-800 text-white"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Table ── */}
          {visible.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-gray-400">No {filter} jobs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/60">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-navy-800 focus:ring-navy-700"
                      />
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Company
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Applicants
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Deadline
                    </th>
                    <th className="px-5 py-3 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((job) => {
                    const sc = statusConfig[job.status];
                    const tc = typeColor[job.type] ?? "bg-gray-100 text-gray-600 border-gray-200";
                    const soon = job.status === "active" && isDeadlineSoon(job.deadline);
                    const past = isDeadlinePast(job.deadline);

                    return (
                      <tr
                        key={job.id}
                        className={cn(
                          "group transition-colors",
                          selected.has(job.id) ? "bg-red-50/50" : "hover:bg-gray-50/80"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(job.id)}
                            onChange={() => toggleOne(job.id)}
                            className="rounded border-gray-300 text-navy-800 focus:ring-navy-700"
                          />
                        </td>

                        {/* Title + meta */}
                        <td className="px-5 py-4">
                          <Link href={`/admin/jobs/${job.id}`} className="block">
                            <p className="font-semibold text-gray-900 group-hover:text-navy-800 transition-colors">
                              {job.title}
                            </p>
                            <div className="flex items-center flex-wrap gap-2 mt-1.5">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border",
                                  tc
                                )}
                              >
                                {job.type}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                {job.isRemote ? (
                                  <><Wifi size={10} /> Remote</>
                                ) : (
                                  <><MapPin size={10} /> {job.location}</>
                                )}
                              </span>
                              {job.industry && (
                                <span className="text-[11px] text-gray-400">
                                  {job.industry}
                                </span>
                              )}
                            </div>
                          </Link>
                        </td>

                        {/* Company */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <p className="text-sm font-medium text-gray-700">{job.company}</p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border",
                              sc.classes
                            )}
                          >
                            {sc.icon}
                            {sc.label}
                          </span>
                        </td>

                        {/* Applicants */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <Link
                            href={`/admin/jobs/${job.id}/applicants`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:bg-navy-50 hover:border-navy-200 hover:text-navy-800 transition-colors"
                            title="View applicants"
                          >
                            <Users size={11} />
                            {job.applicantCount ?? 0}
                          </Link>
                        </td>

                        {/* Deadline */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs",
                              soon
                                ? "text-red-600 font-semibold"
                                : past && job.status === "active"
                                ? "text-gray-400 line-through"
                                : "text-gray-500"
                            )}
                          >
                            {soon && <Clock size={11} className="text-red-500" />}
                            {formatDate(job.deadline)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: job.id, title: job.title })}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete job"
                            >
                              <Trash2 size={14} />
                            </button>
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className="flex items-center justify-end text-gray-300 group-hover:text-navy-700 transition-colors p-1"
                            >
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Single delete modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Job Posting</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-700">{deleteTarget.title}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteOne} loading={deleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete modal ── */}
      {bulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete {selected.size} Job Posting{selected.size > 1 ? "s" : ""}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete {selected.size} selected job posting{selected.size > 1 ? "s" : ""}.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setBulkConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete} loading={deleting}>
                Delete {selected.size}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
