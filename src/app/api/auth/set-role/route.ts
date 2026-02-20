import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { uid, idToken } = await req.json();

    // Verify the requesting user is the same as the uid being updated
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.uid !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await admin.auth().setCustomUserClaims(uid, { role: "alumni" });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
