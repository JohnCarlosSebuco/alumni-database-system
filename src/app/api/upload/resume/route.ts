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

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    console.error("Cloudinary not configured");
    return NextResponse.json({ error: "Upload service not configured" }, { status: 500 });
  }

  try {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", preset);
    uploadFormData.append("folder", `alumnayan/resumes/${decoded.uid}/${jobId}`);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Cloudinary upload failed:", err);
      return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (err) {
    console.error("Resume upload error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
