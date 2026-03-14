"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventRef, getDoc, updateDoc } from "@/lib/firebase/firestore";
import { uploadEventBanner } from "@/lib/cloudinary/upload";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
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

  if (loading) return <PageLoader />;
  if (!event) return <p className="p-8 text-gray-500">Event not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Event"
        breadcrumbs={[{ label: "Admin" }, { label: "Events", href: "/admin/events" }, { label: "Edit" }]}
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
    </div>
  );
}
