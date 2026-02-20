"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { eventsRef, addDoc } from "@/lib/firebase/firestore";
import { uploadEventBanner } from "@/lib/cloudinary/upload";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";
import { useToast } from "@/components/ui/Toast";
import type { EventFormInput } from "@/lib/utils/validators";

export const dynamic = 'force-dynamic';

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: EventFormInput, bannerFile: File | null) => {
    setLoading(true);
    try {
      const docRef = await addDoc(eventsRef(), {
        ...data,
        bannerURL: "",
        rsvpCount: 0,
        createdBy: user?.uid ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (bannerFile) {
        const { updateDoc, eventRef } = await import("@/lib/firebase/firestore");
        const bannerURL = await uploadEventBanner(docRef.id, bannerFile);
        await updateDoc(eventRef(docRef.id), { bannerURL });
      }

      if (data.status === "published" && user) {
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

      success("Event created!");
      router.push("/admin/events");
    } catch {
      toastError("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Event"
        breadcrumbs={[{ label: "Admin" }, { label: "Events", href: "/admin/events" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <EventForm onSubmit={handleSubmit} loading={loading} />
        </CardBody>
      </Card>
    </div>
  );
}
