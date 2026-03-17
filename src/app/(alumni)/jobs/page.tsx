"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Briefcase, SlidersHorizontal, Plus } from "lucide-react";
import { useJobs } from "@/lib/hooks/useJobs";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobCard } from "@/components/jobs/JobCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;
type TypeFilter = (typeof JOB_TYPES)[number];
type MainTab = "board" | "my-posts";

export default function JobsPage() {
  const { user } = useAuth();
  const { jobs, loading } = useJobs();
  const { jobs: myJobs, loading: myLoading } = useJobs({ postedBy: user?.uid });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [mainTab, setMainTab] = useState<MainTab>("board");

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesType = typeFilter === "All" || j.type === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.location ?? "").toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [jobs, search, typeFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: jobs.length };
    for (const t of JOB_TYPES.slice(1)) {
      map[t] = jobs.filter((j) => j.type === t).length;
    }
    return map;
  }, [jobs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Board"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Jobs" }]}
        actions={
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
          >
            <Plus size={16} />
            Post a Job
          </Link>
        }
      />

      {/* Main tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setMainTab("board")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            mainTab === "board"
              ? "border-navy-800 text-navy-800"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Job Board
        </button>
        <button
          onClick={() => setMainTab("my-posts")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            mainTab === "my-posts"
              ? "border-navy-800 text-navy-800"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          My Posts
          {myJobs.length > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none min-w-[18px] py-0.5",
                mainTab === "my-posts" ? "bg-navy-800 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              {myJobs.length}
            </span>
          )}
        </button>
      </div>

      {mainTab === "board" && (
        <>
          {/* Search + filter bar */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  Clear
                </button>
              )}
              <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400 border-l border-gray-100 pl-3">
                <SlidersHorizontal size={13} />
                <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="flex items-center overflow-x-auto px-1">
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    typeFilter === t
                      ? "border-navy-800 text-navy-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  )}
                >
                  {t}
                  {counts[t] > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none min-w-[18px] py-0.5",
                        typeFilter === t
                          ? "bg-navy-800 text-white"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {counts[t]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={48} />}
              title={search || typeFilter !== "All" ? "No jobs match your filters" : "No job postings yet"}
              description={
                search || typeFilter !== "All"
                  ? "Try adjusting your search or filter."
                  : "Check back later for new opportunities."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </>
      )}

      {mainTab === "my-posts" && (
        <>
          {myLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : myJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={48} />}
              title="You haven't posted any jobs yet"
              description='Click "Post a Job" to share an opportunity with fellow alumni.'
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
