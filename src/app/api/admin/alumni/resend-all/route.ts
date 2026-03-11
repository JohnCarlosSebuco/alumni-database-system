import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

async function verifyAdminCaller(req: Request) {
  const sessionCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) return null;
  const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  const snap = await admin.firestore().collection("users").doc(decoded.uid).get();
  const role = snap.data()?.role;
  if (role !== "admin" && role !== "super_admin") return null;
  return decoded;
}

async function sendPasswordResetEmail(email: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to send reset email");
  }
}

export async function POST(req: Request) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const snapshot = await admin
      .firestore()
      .collection("users")
      .where("importedByAdmin", "==", true)
      .where("isClaimed", "==", false)
      .get();

    let sent = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
      const email = doc.data().email as string | undefined;
      if (!email) { failed++; continue; }
      try {
        await sendPasswordResetEmail(email);
        sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ sent, failed });
  } catch {
    return NextResponse.json({ error: "Failed to resend emails." }, { status: 500 });
  }
}
