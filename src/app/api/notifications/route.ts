import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const idToken = authHeader?.replace("Bearer ", "");
    if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.role !== "admin" && decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const db = admin.firestore();
    await db.collection("notifications").add({
      recipientId: "all",
      type: body.type,
      title: body.title,
      body: body.body,
      link: body.link,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
