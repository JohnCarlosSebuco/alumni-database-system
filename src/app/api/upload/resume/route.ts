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

  try {
    const bucket = admin.storage().bucket();
    const filePath = `jobs/${jobId}/resumes/${decoded.uid}/${file.name}`;
    const fileRef = bucket.file(filePath);

    const buffer = await file.arrayBuffer();
    await fileRef.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    });

    const signedUrl = await fileRef.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    console.log("Resume URL stored:", signedUrl[0]);
    return NextResponse.json({ url: signedUrl[0] });
  } catch (err) {
    console.error("Resume upload error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
