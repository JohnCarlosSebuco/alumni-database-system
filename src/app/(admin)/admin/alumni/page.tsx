"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useAlumni } from "@/lib/hooks/useAlumni";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlumniTable } from "@/components/alumni/AlumniTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export const dynamic = 'force-dynamic';

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEAR_OPTIONS = [
  { value: "", label: "All years" },
  ...Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
    const y = CURRENT_YEAR - i;
    return { value: String(y), label: String(y) };
  }),
];
const COURSE_OPTIONS = [
  { value: "", label: "All programs" },
  { value: "Bachelor of Science in Industrial Engineering", label: "BS Industrial Engineering" },
  { value: "Bachelor of Science in Electronics Engineering", label: "BS Electronics Engineering" },
  { value: "Bachelor of Science in Mechanical Engineering", label: "BS Mechanical Engineering" },
];
const EMPLOYMENT_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "employed", label: "Employed" },
  { value: "unemployed", label: "Unemployed" },
];

export default function AdminAlumniPage() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  const { alumni, loading, hasMore, loadMore } = useAlumni({
    batchYear: batchYear ? Number(batchYear) : undefined,
  });

  const filtered = alumni.filter((a) => {
    if (search && !a.displayName?.toLowerCase().includes(search.toLowerCase()) &&
        !a.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (course && a.course !== course) return false;
    if (employmentStatus === "employed" && a.isEmployed !== true) return false;
    if (employmentStatus === "unemployed" && a.isEmployed !== false) return false;
    return true;
  });

  const hasClientFilters = !!(search || course || employmentStatus);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni Directory"
        breadcrumbs={[{ label: "Admin" }, { label: "Alumni" }]}
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Search by name or email..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          options={COURSE_OPTIONS}
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="max-w-[220px]"
        />
        <Select
          options={BATCH_YEAR_OPTIONS}
          value={batchYear}
          onChange={(e) => setBatchYear(e.target.value)}
          className="max-w-[140px]"
        />
        <Select
          options={EMPLOYMENT_OPTIONS}
          value={employmentStatus}
          onChange={(e) => setEmploymentStatus(e.target.value)}
          className="max-w-[160px]"
        />
        <span className="text-sm text-gray-500">{filtered.length} alumni</span>
      </div>

      <AlumniTable
        alumni={filtered}
        loading={loading}
        hasMore={hasMore && !hasClientFilters && !batchYear}
        onLoadMore={loadMore}
      />
    </div>
  );
}
