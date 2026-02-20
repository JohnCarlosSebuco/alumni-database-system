"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { attendeesRef, eventRef, getDocs, getDoc, updateDoc, doc } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils/formatters";
import { Users } from "lucide-react";
import type { AlumniEvent, EventAttendee } from "@/lib/types/event.types";
import { db } from "@/lib/firebase/firestore";

export const dynamic = 'force-dynamic';

export default function AttendeesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { success, error: toastError } = useToast();
  const [event, setEvent] = useState<AlumniEvent | null>(null);
  const [attendees, setAttendees] = useState<(EventAttendee & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getDoc(eventRef(eventId)),
      getDocs(attendeesRef(eventId)),
    ]).then(([evSnap, attSnap]) => {
      if (evSnap.exists()) setEvent({ id: evSnap.id, ...evSnap.data() } as AlumniEvent);
      setAttendees(attSnap.docs.map((d) => ({ id: d.id, ...d.data() } as EventAttendee & { id: string })));
      setLoading(false);
    });
  }, [eventId]);

  const toggleAttended = async (attendeeId: string, attended: boolean) => {
    if (!eventId) return;
    try {
      await updateDoc(doc(db, "events", eventId, "attendees", attendeeId), { attended });
      setAttendees((prev) => prev.map((a) => a.id === attendeeId ? { ...a, attended } : a));
      success("Attendance updated.");
    } catch {
      toastError("Failed to update attendance.");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Attendees — ${event?.title ?? ""}`}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Events", href: "/admin/events" },
          { label: "Attendees" },
        ]}
      />

      <Card>
        <CardBody className="p-0">
          {attendees.length === 0 ? (
            <EmptyState
              icon={<Users size={48} />}
              title="No RSVPs yet"
              description="Alumni who RSVP to this event will appear here."
              className="py-16"
            />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">RSVP Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.displayName}</p>
                      <p className="text-xs text-gray-500">{a.email}{a.batchYear ? ` · Batch ${a.batchYear}` : ""}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(a.rsvpAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAttended(a.id, !a.attended)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          a.attended
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {a.attended ? "✓ Present" : "Mark Present"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
