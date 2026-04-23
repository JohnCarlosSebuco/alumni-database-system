import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";

export async function POST(req: Request) {
  const sessionCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let decoded;
  try {
    decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const jobId = formData.get("jobId") as string;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!jobId) return NextResponse.json({ error: "No jobId provided" }, { status: 400 });

  const storage = admin.storage().bucket();
  const filePath = `jobs/${jobId}/resumes/${decoded.uid}/${file.name}`;
  const fileRef = storage.file(filePath);

  try {
    const buffer = await file.arrayBuffer();
    await fileRef.save(Buffer.from(buffer), {
      metadata: { contentType: file.type },
    });

    const [url] = await fileRef.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Resume upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
