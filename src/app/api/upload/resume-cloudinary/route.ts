import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "raw",
      folder: `alumnayan/resumes/${decoded.uid}/${jobId}`,
      public_id: file.name.replace(/\.[^/.]+$/, ""),
      flags: "attachment",
      access_control: [{ access_type: "public" }],
    });

    const url = result.secure_url;
    console.log("Resume uploaded:", url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Resume upload error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
