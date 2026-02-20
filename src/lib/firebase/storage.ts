import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import app from "./config";

export const storage = getStorage(app);

export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  return uploadFile(`users/${uid}/profile-photo`, file);
}

export async function uploadResume(uid: string, jobId: string, file: File): Promise<string> {
  return uploadFile(`jobs/${jobId}/resumes/${uid}/${file.name}`, file);
}

export async function uploadLicense(uid: string, licenseId: string, file: File): Promise<string> {
  return uploadFile(`users/${uid}/licenses/${licenseId}`, file);
}

export async function uploadEventBanner(eventId: string, file: File): Promise<string> {
  return uploadFile(`events/${eventId}/banner`, file);
}
