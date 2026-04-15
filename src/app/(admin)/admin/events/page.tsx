"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Users,
  ChevronRight,
  MapPin,
  Wifi,
  Clock,
  CheckCircle2,
  Clock3,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { useEvents } from "@/lib/hooks/useEvents";
import { eventRef, deleteDoc } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/Toast";
import type { EventStatus } from "@/lib/types/event.types";

export const dynamic = "force-dynamic";

type FilterKey = "all" | EventStatus;

const statusConfig: Record<
  EventStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  published: {
    label: "Published",
    classes: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={11} />,
  },
  draft: {
    label: "Draft",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock3 size={11} />,
  },
  completed: {
    label: "Completed",
    classes: "bg-blue-50 text-blue-700 border-blue-100",
    icon: <CheckCheck size={11} />,
  },
};

const typeColor: Record<string, string> = {
  Seminar:   "bg-purple-50 text-purple-700 border-purple-100",
  Webinar:   "bg-blue-50   text-blue-700   border-blue-100",
  Workshop:  "bg-orange-50 text-orange-700 border-orange-100",
  Reunion:   "bg-pink-50   text-pink-700   border-pink-100",
  Forum:     "bg-teal-50   text-teal-700   border-teal-100",
};

function isStartingSoon(startDate: string) {
  const days = (new Date(startDate).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= 3;
}

export default function AdminEventsPage() {
  const { events, loading } = useEvents({ adminView: true });
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { success, error: toastError } = useToast();

  const counts = useMemo(
    () => ({
      all:       events.length,
      published: events.filter((e) => e.status === "published").length,
      draft:     events.filter((e) => e.status === "draft").length,
      completed: events.filter((e) => e.status === "completed").length,
    }),
    [events]
  );

  const totalRSVPs = useMemo(
    () => events.reduce((s, e) => s + (e.rsvpCount ?? 0), 0),
    [events]
  );

  const visible = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.status === filter)),
    [events, filter]
  );

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "published", label: "Published", count: counts.published },
    { key: "draft",     label: "Draft",     count: counts.draft },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  const allVisibleSelected =
    visible.length > 0 && visible.every((e) => selected.has(e.id));

  function toggleAll() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((e) => next.delete(e.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((e) => next.add(e.id));
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
      await deleteDoc(eventRef(deleteTarget.id));
      setSelected((prev) => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
      success("Event deleted.");
    } catch {
      toastError("Failed to delete event.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleBulkDelete() {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selected).map((id) => deleteDoc(eventRef(id))));
      success(`${selected.size} event${selected.size > 1 ? "s" : ""} deleted.`);
      setSelected(new Set());
    } catch {
      toastError("Failed to delete some events.");
    } finally {
      setDeleting(false);
      setBulkConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Admin" }, { label: "Events" }]}
        actions={
          <Link href="/admin/events/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              New Event
            </Button>
          </Link>
        }
      />

      {/* ── Stats strip ── */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: counts.all,       color: "bg-navy-50  text-navy-800",  dot: "bg-navy-400"  },
            { label: "Published",   value: counts.published, color: "bg-green-50 text-green-800", dot: "bg-green-500" },
            { label: "Draft",       value: counts.draft,     color: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
            { label: "Total RSVPs", value: totalRSVPs,       color: "bg-blue-50  text-blue-800",  dot: "bg-blue-400"  },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("flex items-center gap-3 rounded-xl px-4 py-3", s.color)}
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
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="No events yet"
          description="Create your first event to engage your alumni community."
          action={
            <Link href="/admin/events/new">
              <Button variant="primary">Create Event</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {/* ── Bulk action bar ── */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-red-50 border-b border-red-100">
              <span className="text-sm font-medium text-red-700">
                {selected.size} event{selected.size > 1 ? "s" : ""} selected
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
              <p className="text-sm text-gray-400">No {filter} events found.</p>
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
                      Event
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      RSVPs
                    </th>
                    <th className="px-5 py-3 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((event) => {
                    const sc = statusConfig[event.status];
                    const tc =
                      typeColor[event.type] ??
                      "bg-gray-100 text-gray-600 border-gray-200";
                    const soon =
                      event.status === "published" && isStartingSoon(event.startDate);
                    const capacityFull =
                      event.maxAttendees !== null &&
                      event.rsvpCount >= event.maxAttendees;

                    return (
                      <tr
                        key={event.id}
                        className={cn(
                          "group transition-colors",
                          selected.has(event.id) ? "bg-red-50/50" : "hover:bg-gray-50/80"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(event.id)}
                            onChange={() => toggleOne(event.id)}
                            className="rounded border-gray-300 text-navy-800 focus:ring-navy-700"
                          />
                        </td>

                        {/* Event title + meta */}
                        <td className="px-5 py-4">
                          <Link href={`/admin/events/${event.id}`} className="block">
                            <div className="flex items-start gap-3">
                              <div className="hidden sm:flex h-11 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 items-center justify-center">
                                {event.bannerURL ? (
                                  <img
                                    src={event.bannerURL}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Calendar size={16} className="text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 group-hover:text-navy-800 transition-colors truncate">
                                  {event.title}
                                </p>
                                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border",
                                      tc
                                    )}
                                  >
                                    {event.type}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                    {event.isVirtual ? (
                                      <><Wifi size={10} /> Virtual</>
                                    ) : (
                                      <><MapPin size={10} /> {event.location}</>
                                    )}
                                  </span>
                                  {soon && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                      <Clock size={10} /> Starting soon
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Date range */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <p className="text-sm text-gray-700">{formatDate(event.startDate)}</p>
                          {event.endDate && event.endDate !== event.startDate && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              to {formatDate(event.endDate)}
                            </p>
                          )}
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

                        {/* RSVPs */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <Link
                            href={`/admin/events/${event.id}/attendees`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:bg-navy-50 hover:border-navy-200 hover:text-navy-800 transition-colors"
                            title="View attendees"
                          >
                            <Users size={11} />
                            {event.rsvpCount ?? 0}
                            {event.maxAttendees !== null && (
                              <span
                                className={cn(
                                  "ml-0.5",
                                  capacityFull ? "text-red-500 font-semibold" : "text-gray-400"
                                )}
                              >
                                / {event.maxAttendees}
                              </span>
                            )}
                          </Link>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: event.id, title: event.title })}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete event"
                            >
                              <Trash2 size={14} />
                            </button>
                            <Link
                              href={`/admin/events/${event.id}`}
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
                <h3 className="font-semibold text-gray-900">Delete Event</h3>
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
                <h3 className="font-semibold text-gray-900">Delete {selected.size} Event{selected.size > 1 ? "s" : ""}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete {selected.size} selected event{selected.size > 1 ? "s" : ""}.
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
