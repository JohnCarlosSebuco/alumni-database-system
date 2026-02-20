import * as admin from "firebase-admin";
import { https } from "firebase-functions/v1";

interface ReportFilters {
  department?: string;
  batchYear?: number;
  isEmployed?: boolean;
  format: "csv" | "pdf";
}

export const generateReport = https.onCall(async (data: ReportFilters, context) => {
  if (!context.auth) {
    throw new https.HttpsError("unauthenticated", "Must be authenticated.");
  }

  const tokenRole = context.auth.token.role;
  if (tokenRole !== "admin") {
    throw new https.HttpsError("permission-denied", "Admin access required.");
  }

  const db = admin.firestore();
  let q: FirebaseFirestore.Query = db.collection("users").where("role", "==", "alumni");

  if (data.department) q = q.where("department", "==", data.department);
  if (data.batchYear)  q = q.where("batchYear", "==", data.batchYear);

  const snap = await q.get();
  const rows = snap.docs.map((d) => {
    const a = d.data();
    return {
      uid:             d.id,
      name:            a.displayName ?? "",
      email:           a.email ?? "",
      department:      a.department ?? "",
      course:          a.course ?? "",
      batchYear:       a.batchYear ?? "",
      profileComplete: a.profileComplete ?? 0,
      createdAt:       a.createdAt ?? "",
    };
  });

  return { rows, total: rows.length };
});
