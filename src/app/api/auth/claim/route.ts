import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { surname, email } = body ?? {};

  if (!surname || !email) {
    return NextResponse.json({ error: "Surname and email are required." }, { status: 400 });
  }

  const normSurname = String(surname).trim().toLowerCase();
  const normEmail   = String(email).trim().toLowerCase();

  // Look up the exact email — emails are unique so this returns at most one doc
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

  // Verify the supplied surname matches the last word of displayName
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

  return NextResponse.json({
    displayName: data.displayName ?? null,
    course: data.course ?? null,
    batchYear: data.batchYear ?? null,
  });
}
