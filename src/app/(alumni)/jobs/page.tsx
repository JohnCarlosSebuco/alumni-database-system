"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useJobs } from "@/lib/hooks/useJobs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { JobCard } from "@/components/jobs/JobCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function JobsPage() {
  const { jobs, loading } = useJobs();
  const [search, setSearch] = useState("");

  const filtered = jobs.filter((j) =>
    search === "" ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Board"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Jobs" }]}
      />

      <Input
        placeholder="Search jobs by title, company, or location..."
        leftIcon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title={search ? "No jobs match your search" : "No job postings yet"}
          description={search ? "Try a different search term." : "Check back later for new opportunities."}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
