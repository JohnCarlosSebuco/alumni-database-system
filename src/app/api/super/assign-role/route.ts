import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import type { UserRole } from "@/lib/types/alumni.types";

export async function POST(req: Request) {
  try {
    const sessionCookie = req.headers.get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("__session="))
      ?.split("=")[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const callerSnap = await admin.firestore().collection("users").doc(decoded.uid).get();
    if (callerSnap.data()?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetUid, role } = (await req.json()) as { targetUid: string; role: UserRole };

    if (!targetUid || !["alumni", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (targetUid === decoded.uid) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    await admin
      .firestore()
      .collection("users")
      .doc(targetUid)
      .set({ role, updatedAt: new Date().toISOString() }, { merge: true });

    await admin.auth().setCustomUserClaims(targetUid, { role });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}
