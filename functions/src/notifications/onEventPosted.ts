import * as admin from "firebase-admin";
import { firestore } from "firebase-functions/v1";

export const onEventPosted = firestore
  .document("events/{eventId}")
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!after) return;
    if (before?.status === after.status) return;
    if (after.status !== "published") return;

    const db = admin.firestore();
    await db.collection("notifications").add({
      recipientId: "all",
      type: "event_posted",
      title: `New Event: ${after.title}`,
      body: `${after.type} — ${after.title}. ${after.isVirtual ? "Online event" : after.location}. Date: ${after.startDate}`,
      link: `/events/${context.params.eventId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: { eventId: context.params.eventId },
    });

    console.log(`Event posted notification sent for event: ${context.params.eventId}`);
  });
