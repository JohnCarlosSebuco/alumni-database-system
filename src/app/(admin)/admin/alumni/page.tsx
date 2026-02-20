"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useAlumni } from "@/lib/hooks/useAlumni";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlumniTable } from "@/components/alumni/AlumniTable";
import { Input } from "@/components/ui/Input";

export const dynamic = 'force-dynamic';

export default function AdminAlumniPage() {
  const [search, setSearch] = useState("");
  const { alumni, loading, hasMore, loadMore } = useAlumni();

  const filtered = alumni.filter((a) =>
    search === "" ||
    a.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni Directory"
        breadcrumbs={[{ label: "Admin" }, { label: "Alumni" }]}
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name, email, or department..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-gray-500">{filtered.length} alumni</span>
      </div>

      <AlumniTable
        alumni={filtered}
        loading={loading}
        hasMore={hasMore && !search}
        onLoadMore={loadMore}
      />
    </div>
  );
}
