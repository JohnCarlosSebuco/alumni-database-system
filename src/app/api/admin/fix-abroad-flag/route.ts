import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import { isAbroadAddress } from "@/lib/utils/courseAlignment";

async function verifyAdminCaller(req: Request) {
  const sessionCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) return null;
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    const snap = await admin.firestore().collection("users").doc(decoded.uid).get();
    const role = snap.data()?.role;
    if (role !== "admin" && role !== "super_admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/fix-abroad-flag
 *
 * Scans all alumni UserDocs in Firestore and sets isAbroad = true for any
 * record whose companyAddress or locality contains an international location
 * keyword — unless isAbroad is already explicitly set (true or false).
 *
 * Returns { updated, skipped }.
 */
export async function POST(req: Request) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = admin.firestore();
    const snap = await db.collection("users").where("role", "==", "alumni").get();

    const now = new Date().toISOString();
    let updated = 0;
    let skipped = 0;

    // Firestore batch allows max 500 writes per commit
    const BATCH_SIZE = 499;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snap.docs) {
      const data = doc.data();

      // Respect explicit overrides — only fill in when isAbroad is unset
      if (typeof data.isAbroad === "boolean") {
        skipped++;
        continue;
      }

      const companyAddress = typeof data.companyAddress === "string" ? data.companyAddress : null;
      const locality       = typeof data.locality       === "string" ? data.locality       : null;

      if (!isAbroadAddress(companyAddress) && !isAbroadAddress(locality)) {
        skipped++;
        continue;
      }

      batch.update(doc.ref, { isAbroad: true, updatedAt: now });
      updated++;
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) await batch.commit();

    return NextResponse.json({ updated, skipped });
  } catch (err: unknown) {
    console.error("[/api/admin/fix-abroad-flag]", err);
    return NextResponse.json({ error: "Fix failed. Please try again." }, { status: 500 });
  }
}
