"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventRef, getDoc, updateDoc, deleteDoc } from "@/lib/firebase/firestore";
import { uploadEventBanner } from "@/lib/cloudinary/upload";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import type { AlumniEvent } from "@/lib/types/event.types";
import type { EventFormInput } from "@/lib/utils/validators";

export const dynamic = 'force-dynamic';

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [event, setEvent] = useState<AlumniEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    getDoc(eventRef(eventId)).then((snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as AlumniEvent);
      setLoading(false);
    });
  }, [eventId]);

  const handleSubmit = async (data: EventFormInput, bannerFile: File | null) => {
    if (!eventId) return;
    setSaving(true);
    try {
      let bannerURL = event?.bannerURL ?? "";
      if (bannerFile) {
        bannerURL = await uploadEventBanner(eventId, bannerFile);
      }
      const payload = Object.fromEntries(
        Object.entries({ ...data, bannerURL, updatedAt: new Date().toISOString() })
          .filter(([, v]) => v !== undefined)
      );
      await updateDoc(eventRef(eventId), payload);

      if (data.status === "published" && event?.status !== "published" && user) {
        const idToken = await user.getIdToken();
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({
            type: "event_posted",
            title: "New Event",
            body: `${data.title} is now open for RSVPs.`,
            link: "/events",
          }),
        });
      }

      success("Event updated!");
      router.push("/admin/events");
    } catch {
      toastError("Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    setDeleting(true);
    try {
      await deleteDoc(eventRef(eventId));
      success("Event deleted.");
      router.push("/admin/events");
    } catch {
      toastError("Failed to delete event.");
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return <p className="p-8 text-gray-500">Event not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Event"
        breadcrumbs={[{ label: "Admin" }, { label: "Events", href: "/admin/events" }, { label: "Edit" }]}
        actions={
          <Button
            variant="danger"
            leftIcon={<Trash2 size={15} />}
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Event
          </Button>
        }
      />
      <Card>
        <CardBody>
          <EventForm
            defaultValues={{
              title: event.title, description: event.description, type: event.type,
              startDate: event.startDate, endDate: event.endDate, location: event.location,
              isVirtual: event.isVirtual, meetingLink: event.meetingLink,
              maxAttendees: event.maxAttendees, status: event.status,
            }}
            bannerURL={event.bannerURL}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </CardBody>
      </Card>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{event.title}</span>? All RSVP data for this event will also be removed.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 size={14} />}
                onClick={handleDelete}
                loading={deleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
