"use client";

import React from "react";
import Link from "next/link";
import { Plus, Eye, Edit } from "lucide-react";
import { useEvents } from "@/lib/hooks/useEvents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import type { EventStatus } from "@/lib/types/event.types";

export const dynamic = 'force-dynamic';

const statusBadge: Record<EventStatus, "success" | "warning" | "default"> = {
  published: "success",
  draft:     "warning",
  completed: "default",
};

export default function AdminEventsPage() {
  const { events, loading } = useEvents({ adminView: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Admin" }, { label: "Events" }]}
        actions={
          <Link href="/admin/events/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Event</Button>
          </Link>
        }
      />

      {loading ? (
        <SkeletonTable rows={5} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="No events yet"
          description="Create your first event to engage your alumni community."
          action={<Link href="/admin/events/new"><Button variant="primary">Create Event</Button></Link>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">RSVPs</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.type} · {event.isVirtual ? "Virtual" : event.location}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(event.startDate)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge[event.status]}>{event.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{event.rsvpCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/events/${event.id}/attendees`}>
                        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-800 transition-colors" title="View attendees">
                          <Eye size={15} />
                        </button>
                      </Link>
                      <Link href={`/admin/events/${event.id}`}>
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
