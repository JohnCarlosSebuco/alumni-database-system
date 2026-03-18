/**
 * One-time update script to patch existing alumni in Firestore with
 * missing survey fields (awardsRaw, trainingRaw) and recalculate profileComplete.
 *
 * Usage: node scripts/update-survey-fields.mjs
 *
 * For each row in the survey XLSX:
 *  - Finds existing user by email
 *  - Updates user doc with awardsRaw, trainingRaw (+ backfills licensesRaw, researchRaw, communityExtensionRaw)
 *  - Recalculates profileComplete
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { read, utils } from "xlsx";

// ── Firebase config ───────────────────────────────────────────────────────────
const serviceAccount = {
  projectId: "alumni-database-system-8329f",
  clientEmail: "firebase-adminsdk-fbsvc@alumni-database-system-8329f.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVhEbJK9khOene\nD9GyN4YT7lJaLjbi5XUMQ92NG3ChzuymEP3PyukiJXiHlpMOzQFfGvrsFpBNavYe\ny/q9heeKNS6Nvn3ZtJ2Ioe4oxA31L4VQuOAIjTNq2gZvUfeT8Hoi2hwDbqPgi3Ii\nbui3GhrTEEGOMRH3Urxve/19rKedXmbUdKCFdBYrXvQKAfsHDW7m8s2nkleyWl9d\ns9Z0HeQJmfE61LaUmbu4sF3Xbi8Sba6IvbJKNNojgo1lCMw/NCTPqKbxklV8U57d\ngYJeJq03JvspsGRY1dL56UAJx5eXD4t0sJu52yovUHkDMFlqTKtgic+y6g+YcGTJ\ndk81tmYDAgMBAAECggEAApn5KVLnaj6VJR6LDqMMreE9qZNzs+HOLPuZTmLu+wrl\nOFZ6xlg2U1zp06tCKzN4zKMb0yF7qLQJKD5OC2j+dg4Br+0akcAALtXXA0O2AnXS\nENrrMdZTGvyNSveya1xAo8V04i3VNdRlAo84mVlEW1vFVfFy6bgnF8F8PZ/UR1an\nMoyNJWmxMls/6V/9enxc9fUnCB7ART47A2Uh8or5w6xZRdrRgZxkJjOHOGu7Azk3\nY7MxlFcoboDgEsrn1eIv9mq8cgK6qqEXyNsr6lK4pRo+mUhEDs6qsghX5IXmNK12\naBdcjuCScuSiTVrFCEn8tH3gLZrBImk34NZexqkA8QKBgQDG1jZE6/Gh4MdKSSEN\npY+c7JJsp1uCn06ToKyfg9vpGydKclOkAHGJEk3/9LMbmhm9fy2/8SiAW2rHvq3r\nlUGFJrkweRKQjN3XgZdxvpTepqEBDhmzSzsgSvN8hs7wu/+cAUmWf/MqH82XO4qP\nvUxZz5jYGzKz3bocwN1ie0x8dQKBgQDAgEGiKpu38+W7D3o7qIjpxIiyLa1Y9NmT\n0w+jB8itry0ZXQq9z9WR1dv8ZdIaT80qPaUVaT1P2eNdbPuL4V0Cb04jfiL+KvnS\nuVmx/t+WzG1IynHDq6+HOqAl18CuvodByLPIns7g8T+lnXTjGIjqUInNDaklEsRk\nb+DJ/LlplwKBgH4sYmWb30ocq/ncq+fP/nDSwhvGm1ApLSCK3d+fOcYTH/yizaaN\nTX5wqiRYr+s8/0Z7VJmvO0cwO3Mi8ZRDsz7+EpfKzFgDu6ZMKsDX8fnTfOmBfBeF\nDrDwPs/vb5PdiFcDjiG9cZ1ybvCfrM6HjdKT5GaF48e1VKt4S0N6AFAdAoGAVKQQ\nN82kSm3jRSy5AiJIkQDpWe7bmZGPWYAkD/sMMdIkclKGto77yPPPllru1sLf4wLX\n42IyozmazylsMUUWMEvgf5qmqDsdPZph5fG7PgMEyky5WN/UfhE4+Wq0PiFoN3SY\nGE47iIyK/7cL/g57pQtki9TF2pc14zOOE0IcBGECgYAsCi3NDdrhp9JVxkBchFwX\nWFYUS1nN9x2G4DA7FBiKLsRoRAMqWkferZt0VKZrhjUAGR/MfJW5KFJ/A5E4BN22\n1AzRzli0raUGqodIx5RsU/FJ9rzHoQ1qtsWx/T3EZTnijDbvAQOZvxTf4QKbNJLF\nWfqYwgnAi/1sIUuGZOIptQ==\n-----END PRIVATE KEY-----\n",
};

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db   = getFirestore();

// ── Column header → field mapping ─────────────────────────────────────────────
const COL = {
  email:            "Email Address",
  course:           "Degree and Program / Course Taken",
  batchYear:        "Batch",
  honors:           "Honors or awards received",
  hasLicenses:      "Do you have professional licenses or certifications? (For ex: Civil Service Passer, PRC License, etc.)",
  licensesDetail:   "If YES, please specify:",
  hasResearch:      "Have you participated in research, innovations, or major projects after graduation?",
  researchDetail:   "If YES, please specify: 4",
  hasCommunity:     "Have you participated in community extension, outreach, or volunteer programs?",
  communityDetail:  "If YES, please specify: 5",
  hasTraining:      "Have you attended professional training/seminars?",
  trainingDetail:   "If YES, please specify: 2",
  hasAwards:        "Have you received any academic or professional awards/recognition?",
  awardsDetail:     "If YES, please specify: 3",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function normStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "n/a" ? null : s;
}

function buildRaw(yesNoVal, detailVal) {
  const flag   = normStr(yesNoVal);
  const detail = normStr(detailVal);
  if (!flag) return null;
  return detail ? `${flag}: ${detail}` : flag;
}

function extractDetail(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  const stripped = s.replace(/^(yes|no)\s*:\s*/i, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (["n/a", "na", "none", "yes", "no", ""].includes(lower)) return null;
  return stripped;
}

function parseDegree(courseStr) {
  if (!courseStr) return { degree: "", fieldOfStudy: "" };
  const parts = courseStr.split(" in ");
  if (parts.length >= 2) {
    return { degree: parts[0].trim(), fieldOfStudy: parts.slice(1).join(" in ").trim() };
  }
  return { degree: courseStr.trim(), fieldOfStudy: "" };
}

import crypto from "crypto";

function calcProfileComplete(d) {
  let s = 0;
  if (d.firstName || d.displayName?.split(" ")[0]) s += 10;
  if (d.lastName || d.displayName?.split(" ").slice(1).join(" ")) s += 10;
  if (d.birthday) s += 5;
  if (d.sex) s += 5;
  if (d.contactNumber) s += 5;
  if (d.locality) s += 5;
  if (d.batchYear) s += 10;
  if (d.course) s += 5;
  if (d.department) s += 5;
  if (d.isEmployed !== undefined && d.isEmployed !== null) {
    if (d.isEmployed) {
      if (d.currentCompany && d.currentPosition) s += 15;
      else if (d.currentCompany || d.currentPosition) s += 10;
      else s += 5;
    } else s += 15;
  }
  if (d.licensesRaw?.toLowerCase().startsWith("yes")) s += 10;
  if (d.researchRaw?.toLowerCase().startsWith("yes")) s += 10;
  if (d.communityExtensionRaw?.toLowerCase().startsWith("yes")) s += 5;
  return Math.min(s, 100);
}

// ── Resolve XLSX file path ────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

let xlsxPath;
try {
  const files = readdirSync(publicDir);
  const match = files.find(
    (f) => f.toLowerCase().includes("responses") && f.toLowerCase().endsWith(".xlsx")
  );
  if (!match) throw new Error("Survey XLSX not found in public/");
  xlsxPath = join(publicDir, match);
  console.log(`\n📂 Using file: ${match}`);
} catch (e) {
  console.error("❌ Could not find survey XLSX:", e.message);
  process.exit(1);
}

const workbook = read(readFileSync(xlsxPath), { type: "buffer" });
const sheetName =
  workbook.SheetNames.find((n) => n.toLowerCase().includes("form responses")) ??
  workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows  = utils.sheet_to_json(sheet, { defval: null });

console.log(`📋 Loaded ${rows.length} rows from sheet "${sheetName}".\n`);

// ── Main loop ─────────────────────────────────────────────────────────────────
let updated = 0, skipped = 0, notFound = 0, failed = 0;

for (const row of rows) {
  const rawEmail = normStr(row[COL.email] ?? row["Email"] ?? row["email"]);
  if (!rawEmail) { skipped++; continue; }
  const email = rawEmail.toLowerCase();

  // Find user by email
  let uid;
  try {
    const userRecord = await auth.getUserByEmail(email);
    uid = userRecord.uid;
  } catch {
    notFound++;
    continue;
  }

  // Read existing user doc
  const docRef = db.collection("users").doc(uid);
  const snap   = await docRef.get();
  if (!snap.exists) { notFound++; continue; }
  const existing = snap.data();

  // Build raw fields from XLSX
  const licensesRaw         = buildRaw(row[COL.hasLicenses], row[COL.licensesDetail]);
  const researchRaw         = buildRaw(row[COL.hasResearch], row[COL.researchDetail]);
  const communityExtensionRaw = buildRaw(row[COL.hasCommunity], row[COL.communityDetail]);
  const trainingRaw         = buildRaw(row[COL.hasTraining], row[COL.trainingDetail]);
  const awardsRaw           = buildRaw(row[COL.hasAwards], row[COL.awardsDetail]);

  // Build update payload — only add fields that are missing or new
  const updates = {};

  if (licensesRaw && !existing.licensesRaw)                 updates.licensesRaw = licensesRaw;
  if (researchRaw && !existing.researchRaw)                 updates.researchRaw = researchRaw;
  if (communityExtensionRaw && !existing.communityExtensionRaw) updates.communityExtensionRaw = communityExtensionRaw;
  if (trainingRaw)  updates.trainingRaw  = trainingRaw;
  if (awardsRaw)    updates.awardsRaw    = awardsRaw;

  // Merge existing + updates to recalculate profileComplete
  const merged = { ...existing, ...updates };
  const newComplete = calcProfileComplete(merged);
  if (newComplete !== existing.profileComplete) {
    updates.profileComplete = newComplete;
  }

  if (Object.keys(updates).length === 0) {
    skipped++;
    continue;
  }

  try {
    updates.updatedAt = new Date().toISOString();
    await docRef.update(updates);

    // ── Patch profile subcollection ──
    const profileRef = db.collection("users").doc(uid).collection("profile").doc("data");
    const profileSnap = await profileRef.get();
    const profileUpdates = {};

    if (profileSnap.exists) {
      const profileData = profileSnap.data();

      // Education — seed if empty
      if ((!profileData.education || profileData.education.length === 0)) {
        const course = normStr(row[COL.course]);
        if (course) {
          const { degree: degStr, fieldOfStudy } = parseDegree(course);
          const rawHonors = normStr(row[COL.honors]);
          const honorsClean = rawHonors && !["n/a", "na", "none"].includes(rawHonors.toLowerCase()) && !/^\d+\s*[a-z]$/i.test(rawHonors.trim()) ? rawHonors : "";
          const batchYr = existing.batchYear ?? null;
          profileUpdates.education = [{
            id: crypto.randomBytes(10).toString("hex"),
            institution: "Southern Luzon State University",
            degree: degStr, fieldOfStudy,
            yearStarted: batchYr ? batchYr - 4 : 0,
            yearEnded: batchYr,
            honors: honorsClean,
          }];
        }
      }

      // Licenses
      if ((!profileData.licenses || profileData.licenses.length === 0) && licensesRaw) {
        const det = extractDetail(licensesRaw);
        if (det) profileUpdates.licenses = [{ id: crypto.randomBytes(10).toString("hex"), name: det, issuingBody: "", licenseNumber: "", dateIssued: "", fileURL: "" }];
      }

      // Awards
      if ((!profileData.awards || profileData.awards.length === 0) && awardsRaw) {
        const det = extractDetail(awardsRaw);
        if (det) profileUpdates.awards = [{ id: crypto.randomBytes(10).toString("hex"), title: det, grantedBy: "", year: 0, description: "" }];
      }

      // Research
      if ((!profileData.research || profileData.research.length === 0) && researchRaw) {
        const det = extractDetail(researchRaw);
        if (det) profileUpdates.research = [{ id: crypto.randomBytes(10).toString("hex"), title: det, coAuthors: "", publishedIn: "", year: 0, doiOrLink: "" }];
      }

      // Community Extension
      if ((!profileData.communityExtension || profileData.communityExtension.length === 0) && communityExtensionRaw) {
        const det = extractDetail(communityExtensionRaw);
        if (det) profileUpdates.communityExtension = [{ id: crypto.randomBytes(10).toString("hex"), programName: det, organization: "", role: "", startDate: "", endDate: "" }];
      }

      // Training
      if ((!profileData.training || profileData.training.length === 0) && trainingRaw) {
        const det = extractDetail(trainingRaw);
        if (det) profileUpdates.training = [{ id: crypto.randomBytes(10).toString("hex"), title: det, provider: "", dateCompleted: "", certificateURL: "", description: "" }];
      }
      // Ensure training field exists
      if (profileData.training === undefined && !profileUpdates.training) {
        profileUpdates.training = [];
      }

      if (Object.keys(profileUpdates).length > 0) {
        await profileRef.update(profileUpdates);
      }
    }

    console.log(`  ✓ Updated: ${email} (profileComplete: ${existing.profileComplete} → ${updates.profileComplete ?? existing.profileComplete}${Object.keys(profileUpdates).length > 0 ? `, profile fields: ${Object.keys(profileUpdates).join(", ")}` : ""})`);
    updated++;
  } catch (err) {
    console.log(`  ✗ Failed: ${email} — ${err.message}`);
    failed++;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────");
console.log(`✅ Updated:   ${updated}`);
console.log(`⏭  Skipped:   ${skipped}`);
console.log(`🔍 Not found: ${notFound}`);
console.log(`❌ Failed:    ${failed}`);
console.log("─────────────────────────────────────────\n");

process.exit(0);
