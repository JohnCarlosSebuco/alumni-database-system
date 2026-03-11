import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { surname, email, password } = body ?? {};

  if (!surname || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const normSurname = String(surname).trim().toLowerCase();
  const normEmail   = String(email).trim().toLowerCase();

  // Re-verify the full lookup server-side — email + surname must both match
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("email", "==", normEmail)
    .where("importedByAdmin", "==", true)
    .where("isClaimed", "==", false)
    .get();

  if (snapshot.empty) {
    return NextResponse.json(
      { error: "No unclaimed account found with that email." },
      { status: 404 }
    );
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  const nameLower = String(data.displayName ?? "").toLowerCase();
  const parts = nameLower.trim().split(/\s+/);
  const lastWord = parts[parts.length - 1] ?? "";
  const nameMatch = lastWord === normSurname || nameLower.endsWith(` ${normSurname}`);

  if (!nameMatch) {
    return NextResponse.json(
      { error: "Surname does not match the account on record." },
      { status: 404 }
    );
  }

  const uid = doc.id;

  try {
    await admin.auth().updateUser(uid, { password });
    const customToken = await admin.auth().createCustomToken(uid);
    return NextResponse.json({ customToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
