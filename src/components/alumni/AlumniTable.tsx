"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";
import { formatDate, batchYearLabel } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { UserDoc } from "@/lib/types/alumni.types";

interface AlumniTableProps {
  alumni: UserDoc[];
  loading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEdit?: (a: UserDoc) => void;
  onDelete?: (a: UserDoc) => void;
}

function ProfileBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-green-500" : value >= 40 ? "bg-amber-400" : "bg-red-400";
  const label =
    value >= 80
      ? "text-green-700 bg-green-50 border-green-200"
      : value >= 40
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
          label
        )}
      >
        {value}%
      </span>
    </div>
  );
}

export function AlumniTable({
  alumni,
  loading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
}: AlumniTableProps) {
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

  const hasActions = !!(onEdit || onDelete);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Alumni
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
              Program
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Batch
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Profile
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              Joined
            </th>
            <th className="px-5 py-3 w-[120px]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {alumni.map((a) => (
            <tr key={a.uid} className="group hover:bg-gray-50/70 transition-colors">
              {/* Alumni name + email */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar src={a.photoURL} name={a.displayName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate leading-tight">
                        {a.displayName}
                      </p>
                      {a.isActive === false && (
                        <span className="flex-shrink-0 rounded-full bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{a.email}</p>
                  </div>
                </div>
              </td>

              {/* Program */}
              <td className="px-5 py-3.5 hidden md:table-cell">
                <p className="text-xs font-medium text-gray-600 truncate max-w-[180px]">
                  {a.course ?? a.department ?? "—"}
                </p>
              </td>

              {/* Batch */}
              <td className="px-5 py-3.5 hidden lg:table-cell">
                <span className="text-sm text-gray-600">{batchYearLabel(a.batchYear)}</span>
              </td>

              {/* Profile completion */}
              <td className="px-5 py-3.5">
                <ProfileBar value={a.profileComplete ?? 0} />
              </td>

              {/* Joined */}
              <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">
                {formatDate(a.createdAt)}
              </td>

              {/* Actions */}
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  {hasActions && (
                    <>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(a)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(a)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                  <Link
                    href={`/admin/alumni/${a.uid}`}
                    title="View profile"
                    className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-navy-800 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="flex justify-center border-t border-gray-100 p-4">
          <Button variant="ghost" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
