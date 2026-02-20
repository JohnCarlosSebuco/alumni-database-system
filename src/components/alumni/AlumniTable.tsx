"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { formatDate, batchYearLabel } from "@/lib/utils/formatters";
import type { UserDoc } from "@/lib/types/alumni.types";

interface AlumniTableProps {
  alumni: UserDoc[];
  loading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function AlumniTable({ alumni, loading, hasMore, onLoadMore }: AlumniTableProps) {
  if (loading) return <SkeletonTable rows={8} />;

  if (alumni.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="No alumni found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Alumni</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Department</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Batch</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Profile</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {alumni.map((a) => (
            <tr key={a.uid} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={a.photoURL} name={a.displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{a.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{a.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                <div className="max-w-[160px] truncate">{a.department ?? "—"}</div>
                <div className="text-xs text-gray-400 truncate">{a.course ?? ""}</div>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-gray-600">{batchYearLabel(a.batchYear)}</span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={a.profileComplete >= 80 ? "success" : a.profileComplete >= 40 ? "warning" : "error"}>
                  {a.profileComplete}%
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{formatDate(a.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/alumni/${a.uid}`}>
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-800 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="flex justify-center border-t border-gray-100 p-4">
          <Button variant="ghost" onClick={onLoadMore}>Load more</Button>
        </div>
      )}
    </div>
  );
}
