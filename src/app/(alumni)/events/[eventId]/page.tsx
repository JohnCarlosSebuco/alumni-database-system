"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Video, ArrowLeft } from "lucide-react";
import { eventRef, attendeeRef, updateDoc, setDoc, increment } from "@/lib/firebase/firestore";
import { getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils/formatters";
import type { AlumniEvent } from "@/lib/types/event.types";

export const dynamic = 'force-dynamic';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [event, setEvent] = useState<AlumniEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rsvped, setRsvped] = useState(false);
  const [rsvping, setRsvping] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    getDoc(eventRef(eventId)).then((snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as AlumniEvent);
      setLoading(false);
    });
  }, [eventId]);

  useEffect(() => {
    if (!user || !eventId) return;
    getDoc(attendeeRef(eventId, user.uid)).then((snap) => setRsvped(snap.exists()));
  }, [user, eventId]);

  const handleRSVP = async () => {
    if (!user || !userDoc || !eventId) return;
    setRsvping(true);
    try {
      await setDoc(attendeeRef(eventId, user.uid), {
        userId: user.uid,
        displayName: userDoc.displayName,
        email: userDoc.email,
        batchYear: userDoc.batchYear ?? null,
        rsvpAt: new Date().toISOString(),
        attended: false,
      });
      await updateDoc(eventRef(eventId), { rsvpCount: increment(1) });
      success("RSVP confirmed! See you there.");
      setRsvped(true);
      setShowModal(false);
    } catch {
      toastError("Failed to RSVP. Please try again.");
    } finally {
      setRsvping(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return <p className="p-8 text-gray-500">Event not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {event.bannerURL && (
            <div className="rounded-2xl overflow-hidden bg-gray-100">
              <img src={event.bannerURL} alt={event.title} className="w-full object-contain" />
            </div>
          )}
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">About This Event</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <Badge variant="navy">{event.type}</Badge>

              {[
                { icon: <Calendar size={14} />, label: `${formatDate(event.startDate)} — ${formatDate(event.endDate)}` },
                { icon: event.isVirtual ? <Video size={14} /> : <MapPin size={14} />, label: event.isVirtual ? "Online / Virtual" : event.location },
                { icon: <Users size={14} />, label: `${event.rsvpCount} attendee${event.rsvpCount !== 1 ? "s" : ""}` },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                  {icon}{label}
                </div>
              ))}

              {event.isVirtual && event.meetingLink && rsvped && (
                <a
                  href={event.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center rounded-lg bg-navy-100 text-navy-800 px-4 py-2 text-sm font-medium hover:bg-navy-200 transition-colors"
                >
                  Join Meeting
                </a>
              )}

              {rsvped ? (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium text-center">
                  ✓ You are attending
                </div>
              ) : (
                <Button variant="primary" className="w-full" onClick={() => setShowModal(true)}>
                  RSVP Now
                </Button>
              )}

              <Button variant="ghost" size="sm" className="w-full" leftIcon={<ArrowLeft size={14} />} onClick={() => router.back()}>
                Back to Events
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Confirm RSVP" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            You are registering to attend <strong>{event.title}</strong> on {formatDate(event.startDate)}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" loading={rsvping} onClick={handleRSVP}>Confirm RSVP</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
