import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request, { params }: { params: { jobId: string } }) {
  const sessionCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let decoded;
  try {
    decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = params;
  const { resumeURL, coverNote, displayName, email, batchYear } = await req.json();

  const db = admin.firestore();
  const applicantRef = db.collection("jobs").doc(jobId).collection("applicants").doc(decoded.uid);

  const existing = await applicantRef.get();
  if (existing.exists) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  await applicantRef.set({
    userId: decoded.uid,
    displayName,
    email,
    batchYear: batchYear ?? null,
    appliedAt: new Date().toISOString(),
    resumeURL,
    coverNote,
    status: "pending",
  });

  await db.collection("jobs").doc(jobId).update({
    applicantCount: admin.firestore.FieldValue.increment(1),
  });

  return NextResponse.json({ ok: true });
}
