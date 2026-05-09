import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import { syncUpdate } from "@/lib/firebase/sync";

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

// GET — fetch emailVerified status from Firebase Auth
export async function GET(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid } = await params;
    const userRecord = await admin.auth().getUser(uid);
    return NextResponse.json({ emailVerified: userRecord.emailVerified });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid } = await params;
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const { firstName, lastName, email, batchYear, course, studentId, isActive, emailVerified,
            middleName, sex, birthday, contactNumber, civilStatus,
            locality, currentPosition, currentCompany, honors, isEmployed } =
      (await req.json()) as {
        firstName?: string;
        lastName?: string;
        email?: string;
        batchYear?: string | number;
        course?: string;
        studentId?: string;
        isActive?: boolean;
        emailVerified?: boolean;
        middleName?: string;
        sex?: string;
        birthday?: string;
        contactNumber?: string;
        civilStatus?: string;
        locality?: string;
        currentPosition?: string;
        currentCompany?: string;
        honors?: string;
        isEmployed?: boolean;
      };

    const displayName =
      firstName && lastName ? `${firstName.trim()} ${lastName.trim()}` : undefined;

    // Update Firebase Auth record
    const authUpdate: admin.auth.UpdateRequest = {};
    if (displayName) authUpdate.displayName = displayName;
    if (email?.trim()) authUpdate.email = email.trim();
    if (emailVerified !== undefined) authUpdate.emailVerified = emailVerified;
    if (Object.keys(authUpdate).length > 0) {
      await admin.auth().updateUser(uid, authUpdate);
    }

    // Build Firestore update payload
    const firestoreUpdate: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (displayName) firestoreUpdate.displayName = displayName;
    if (email?.trim()) firestoreUpdate.email = email.trim();
    if (batchYear !== undefined) firestoreUpdate.batchYear = batchYear ? Number(batchYear) : null;
    if (course !== undefined) firestoreUpdate.course = course ?? null;
    if (studentId !== undefined) firestoreUpdate.studentId = studentId.trim();
    if (isActive !== undefined) firestoreUpdate.isActive = isActive;
    if (middleName    !== undefined) firestoreUpdate.middleName    = middleName;
    if (sex           !== undefined) firestoreUpdate.sex           = sex;
    if (birthday      !== undefined) firestoreUpdate.birthday      = birthday;
    if (contactNumber !== undefined) firestoreUpdate.contactNumber = contactNumber;
    if (civilStatus   !== undefined) firestoreUpdate.civilStatus   = civilStatus;
    if (locality      !== undefined) firestoreUpdate.locality      = locality;
    if (currentPosition !== undefined) firestoreUpdate.currentPosition = currentPosition;
    if (currentCompany  !== undefined) firestoreUpdate.currentCompany  = currentCompany;
    if (honors          !== undefined) firestoreUpdate.honors          = honors;
    if (isEmployed      !== undefined) firestoreUpdate.isEmployed      = isEmployed;

    await admin.firestore().collection("users").doc(uid).update(firestoreUpdate);
    await syncUpdate("users", uid, firestoreUpdate);

    return NextResponse.json({ success: true, ...firestoreUpdate });
  } catch (err: unknown) {
    const msg = (err as Error).message ?? "";
    if (msg.includes("email-already-exists")) {
      return NextResponse.json({ error: "That email is already in use by another account." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update alumni account." }, { status: 500 });
  }
}
