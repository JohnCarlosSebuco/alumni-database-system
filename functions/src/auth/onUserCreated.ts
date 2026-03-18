import * as admin from "firebase-admin";
import { auth } from "firebase-functions/v1";

export const onUserCreated = auth.user().onCreate(async (user) => {
  const db = admin.firestore();

  // If the doc already exists (e.g. created by admin import), skip to avoid
  // overwriting fields like profileComplete with 0.
  const existing = await db.doc(`users/${user.uid}`).get();
  if (existing.exists) {
    console.log(`User doc already exists for ${user.uid}, skipping.`);
    // Still ensure custom claim is set
    await admin.auth().setCustomUserClaims(user.uid, { role: existing.data()?.role ?? "alumni" });
    return;
  }

  // Create user document in Firestore
  await db.doc(`users/${user.uid}`).set({
    uid: user.uid,
    email: user.email ?? "",
    role: "alumni",
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Alumni",
    photoURL: user.photoURL ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    profileComplete: 0,
    batchYear: null,
    department: null,
    course: null,
    notifPrefs: { jobs: true, events: true },
  });

  // Set custom claim: role = alumni
  await admin.auth().setCustomUserClaims(user.uid, { role: "alumni" });

  console.log(`User created: ${user.uid} (${user.email})`);
});
