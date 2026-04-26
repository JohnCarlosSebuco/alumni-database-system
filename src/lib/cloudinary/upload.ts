// Cloudinary unsigned upload helper
// Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and " +
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  formData.append("folder", folder);
  formData.append("access_control", JSON.stringify([{ access_type: "public" }]));

  const isDocument = file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".doc") || file.name.endsWith(".docx");
  const endpoint = isDocument ? "raw/upload" : "auto/upload";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const url = data.secure_url as string;

  // For documents, add attachment flag to ensure proper download behavior
  if (isDocument && url) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }

  return url;
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `alumnayan/profiles/${uid}`);
}

export async function uploadResume(uid: string, jobId: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `alumnayan/resumes/${uid}/${jobId}`);
}

export async function uploadEventBanner(eventId: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `alumnayan/events/${eventId}`);
}

export async function uploadLicense(uid: string, licenseId: string, file: File): Promise<string> {
  return uploadToCloudinary(file, `alumnayan/licenses/${uid}/${licenseId}`);
}
