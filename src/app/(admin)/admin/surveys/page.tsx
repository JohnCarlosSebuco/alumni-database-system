"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ClipboardList,
  FileText,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { getDocs } from "@/lib/firebase/firestore";
import { surveysRef } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { Survey, SurveyStatus } from "@/lib/types/survey.types";

export const dynamic = "force-dynamic";

type FilterKey = "all" | SurveyStatus;

const statusConfig: Record<
  SurveyStatus,
  { label: string; dot: string; row: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    dot: "bg-green-500",
    row: "text-green-700 bg-green-50 border-green-200",
    icon: <CheckCircle2 size={12} />,
  },
  draft: {
    label: "Draft",
    dot: "bg-amber-400",
    row: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <Clock3 size={12} />,
  },
  closed: {
    label: "Closed",
    dot: "bg-gray-400",
    row: "text-gray-500 bg-gray-100 border-gray-200",
    icon: <XCircle size={12} />,
  },
};

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    getDocs(surveysRef()).then((snap) => {
      setSurveys(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Survey)));
      setLoading(false);
    });
  }, []);

  const counts = useMemo(
    () => ({
      all: surveys.length,
      active: surveys.filter((s) => s.status === "active").length,
      draft: surveys.filter((s) => s.status === "draft").length,
      closed: surveys.filter((s) => s.status === "closed").length,
    }),
    [surveys]
  );

  const visible = useMemo(
    () => (filter === "all" ? surveys : surveys.filter((s) => s.status === filter)),
    [surveys, filter]
  );

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",    label: "All",    count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "draft",  label: "Draft",  count: counts.draft },
    { key: "closed", label: "Closed", count: counts.closed },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveys"
        breadcrumbs={[{ label: "Admin" }, { label: "Surveys" }]}
        actions={
          <Link href="/admin/surveys/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              New Survey
            </Button>
          </Link>
        }
      />

      {/* ── Stats strip ── */}
      {!loading && surveys.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",  value: counts.all,    color: "bg-navy-50  text-navy-800",  dot: "bg-navy-400" },
            { label: "Active", value: counts.active, color: "bg-green-50 text-green-800", dot: "bg-green-500" },
            { label: "Draft",  value: counts.draft,  color: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
            { label: "Closed", value: counts.closed, color: "bg-gray-50  text-gray-600",  dot: "bg-gray-400" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 border border-transparent",
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
        <SkeletonTable rows={5} />
      ) : surveys.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="No surveys yet"
          description="Create your first survey to collect structured feedback from your alumni."
          action={
            <Link href="/admin/surveys/new">
              <Button variant="primary">Create Survey</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-0 border-b border-gray-100 overflow-x-auto">
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
              <p className="text-sm text-gray-400">
                No {filter} surveys found.
              </p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((survey) => {
                  const sc = statusConfig[survey.status];
                  const isCustom = survey.type === "custom";
                  const qCount = survey.questions?.length ?? 0;

                  return (
                    <tr
                      key={survey.id}
                      className="group hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Title + description + question count */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="block"
                        >
                          <p className="font-semibold text-gray-900 group-hover:text-navy-800 transition-colors">
                            {survey.title}
                          </p>
                          {survey.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">
                              {survey.description}
                            </p>
                          )}
                          {isCustom && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {qCount} question{qCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </Link>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border",
                            isCustom
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-purple-50 text-purple-700 border-purple-100"
                          )}
                        >
                          {isCustom ? (
                            <FileText size={11} />
                          ) : (
                            <ExternalLink size={11} />
                          )}
                          {isCustom ? "Custom" : "Google Form"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border",
                            sc.row
                          )}
                        >
                          {sc.icon}
                          {sc.label}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4 text-sm text-gray-400 hidden lg:table-cell">
                        {formatDate(survey.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/surveys/${survey.id}`}
                          className="flex items-center justify-end text-gray-300 group-hover:text-navy-700 transition-colors"
                          title="Open survey"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
