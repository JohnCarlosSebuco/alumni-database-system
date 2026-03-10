import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function DELETE(req: Request) {
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
    const callerRole = callerSnap.data()?.role;
    if (callerRole !== "admin" && callerRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetUid } = (await req.json()) as { targetUid: string };

    if (!targetUid) {
      return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
    }

    if (targetUid === decoded.uid) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const db = admin.firestore();
    await Promise.all([
      db.collection("users").doc(targetUid).delete(),
      db.collection("profiles").doc(targetUid).delete(),
    ]);

    await admin.auth().deleteUser(targetUid);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete alumni" }, { status: 500 });
  }
}
