import * as admin from "firebase-admin";
import { firestore } from "firebase-functions/v1";

export const onJobPosted = firestore
  .document("jobs/{jobId}")
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!after) return; // deletion
    if (before?.status === after.status) return; // no status change
    if (after.status !== "active") return; // only trigger on activation

    const db = admin.firestore();
    await db.collection("notifications").add({
      recipientId: "all",
      type: "job_posted",
      title: `New Job: ${after.title}`,
      body: `${after.company} is hiring for ${after.title}. ${after.location}${after.isRemote ? " (Remote)" : ""}. Deadline: ${after.deadline}`,
      link: `/jobs/${context.params.jobId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: { jobId: context.params.jobId },
    });

    console.log(`Job posted notification sent for job: ${context.params.jobId}`);
  });
