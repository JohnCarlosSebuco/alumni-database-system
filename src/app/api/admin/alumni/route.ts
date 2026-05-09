import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import crypto from "crypto";
import { syncSet } from "@/lib/firebase/sync";

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

export async function POST(req: Request) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { firstName, lastName, email, batchYear, course, studentId,
            middleName, sex, birthday, contactNumber, civilStatus,
            locality, currentPosition, currentCompany, honors, isEmployed } =
      (await req.json()) as {
        firstName: string;
        lastName: string;
        email: string;
        batchYear?: string | number;
        course?: string;
        studentId?: string;
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

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }

    const displayName = `${firstName.trim()} ${lastName.trim()}`;
    // Temp password — user will reset it via "Forgot Password"
    const tempPassword = crypto.randomBytes(16).toString("hex");

    const userRecord = await admin.auth().createUser({
      email: email.trim(),
      displayName,
      password: tempPassword,
      emailVerified: true, // admin-created accounts skip email verification
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "alumni" });

    const now = new Date().toISOString();
    const userDoc = {
      uid: userRecord.uid,
      email: email.trim(),
      role: "alumni",
      displayName,
      photoURL: null,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      profileComplete: 0,
      batchYear: batchYear ? Number(batchYear) : null,
      department: "College of Engineering",
      course: course ?? null,
      studentId: studentId?.trim() ?? "",
      notifPrefs: { jobs: true, events: true },
      ...(middleName     && { middleName }),
      ...(sex            && { sex }),
      ...(birthday       && { birthday }),
      ...(contactNumber  && { contactNumber }),
      ...(civilStatus    && { civilStatus }),
      ...(locality       && { locality }),
      ...(currentPosition && { currentPosition }),
      ...(currentCompany  && { currentCompany }),
      ...(honors          && { honors }),
      ...(isEmployed !== undefined && { isEmployed }),
    };

    await admin.firestore().collection("users").doc(userRecord.uid).set(userDoc);
    await syncSet("users", userRecord.uid, userDoc);

    return NextResponse.json(userDoc, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message ?? "";
    if (msg.includes("email-already-exists")) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create alumni account." }, { status: 500 });
  }
}
