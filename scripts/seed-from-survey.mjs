/**
 * One-time seed script to import alumni from the Google Forms survey XLSX.
 * Usage: node scripts/seed-from-survey.mjs
 *
 * Reads:  public/Development of an Alumni Database System...xlsx
 * Writes: scripts/seed-survey-results.json
 *
 * For each row:
 *  - Creates Firebase Auth account (emailVerified: true, random temp password)
 *  - Sets custom claim role: "alumni"
 *  - Writes Firestore users/{uid} doc with all survey fields
 *  - Writes Firestore users/{uid}/profile/data subcollection (pre-filled)
 *  - Sends password reset email via Firebase REST API
 *  - Skips rows with no/invalid email or already-existing accounts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { read, utils } from "xlsx";
import crypto from "crypto";

// ── Firebase config ───────────────────────────────────────────────────────────
const serviceAccount = {
  projectId: "alumni-database-system-8329f",
  clientEmail: "firebase-adminsdk-fbsvc@alumni-database-system-8329f.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVhEbJK9khOene\nD9GyN4YT7lJaLjbi5XUMQ92NG3ChzuymEP3PyukiJXiHlpMOzQFfGvrsFpBNavYe\ny/q9heeKNS6Nvn3ZtJ2Ioe4oxA31L4VQuOAIjTNq2gZvUfeT8Hoi2hwDbqPgi3Ii\nbui3GhrTEEGOMRH3Urxve/19rKedXmbUdKCFdBYrXvQKAfsHDW7m8s2nkleyWl9d\ns9Z0HeQJmfE61LaUmbu4sF3Xbi8Sba6IvbJKNNojgo1lCMw/NCTPqKbxklV8U57d\ngYJeJq03JvspsGRY1dL56UAJx5eXD4t0sJu52yovUHkDMFlqTKtgic+y6g+YcGTJ\ndk81tmYDAgMBAAECggEAApn5KVLnaj6VJR6LDqMMreE9qZNzs+HOLPuZTmLu+wrl\nOFZ6xlg2U1zp06tCKzN4zKMb0yF7qLQJKD5OC2j+dg4Br+0akcAALtXXA0O2AnXS\nENrrMdZTGvyNSveya1xAo8V04i3VNdRlAo84mVlEW1vFVfFy6bgnF8F8PZ/UR1an\nMoyNJWmxMls/6V/9enxc9fUnCB7ART47A2Uh8or5w6xZRdrRgZxkJjOHOGu7Azk3\nY7MxlFcoboDgEsrn1eIv9mq8cgK6qqEXyNsr6lK4pRo+mUhEDs6qsghX5IXmNK12\naBdcjuCScuSiTVrFCEn8tH3gLZrBImk34NZexqkA8QKBgQDG1jZE6/Gh4MdKSSEN\npY+c7JJsp1uCn06ToKyfg9vpGydKclOkAHGJEk3/9LMbmhm9fy2/8SiAW2rHvq3r\nlUGFJrkweRKQjN3XgZdxvpTepqEBDhmzSzsgSvN8hs7wu/+cAUmWf/MqH82XO4qP\nvUxZz5jYGzKz3bocwN1ie0x8dQKBgQDAgEGiKpu38+W7D3o7qIjpxIiyLa1Y9NmT\n0w+jB8itry0ZXQq9z9WR1dv8ZdIaT80qPaUVaT1P2eNdbPuL4V0Cb04jfiL+KvnS\nuVmx/t+WzG1IynHDq6+HOqAl18CuvodByLPIns7g8T+lnXTjGIjqUInNDaklEsRk\nb+DJ/LlplwKBgH4sYmWb30ocq/ncq+fP/nDSwhvGm1ApLSCK3d+fOcYTH/yizaaN\nTX5wqiRYr+s8/0Z7VJmvO0cwO3Mi8ZRDsz7+EpfKzFgDu6ZMKsDX8fnTfOmBfBeF\nDrDwPs/vb5PdiFcDjiG9cZ1ybvCfrM6HjdKT5GaF48e1VKt4S0N6AFAdAoGAVKQQ\nN82kSm3jRSy5AiJIkQDpWe7bmZGPWYAkD/sMMdIkclKGto77yPPPllru1sLf4wLX\n42IyozmazylsMUUWMEvgf5qmqDsdPZph5fG7PgMEyky5WN/UfhE4+Wq0PiFoN3SY\nGE47iIyK/7cL/g57pQtki9TF2pc14zOOE0IcBGECgYAsCi3NDdrhp9JVxkBchFwX\nWFYUS1nN9x2G4DA7FBiKLsRoRAMqWkferZt0VKZrhjUAGR/MfJW5KFJ/A5E4BN22\n1AzRzli0raUGqodIx5RsU/FJ9rzHoQ1qtsWx/T3EZTnijDbvAQOZvxTf4QKbNJLF\nWfqYwgnAi/1sIUuGZOIptQ==\n-----END PRIVATE KEY-----\n",
};

// Firebase Web API key — used only for sending password reset emails (public key)
const FIREBASE_API_KEY = "AIzaSyAAFIYVsViLd-njDd9AoOzm_GWEsT8Kemw";

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db   = getFirestore();

// ── Column header → field mapping ─────────────────────────────────────────────
// These are the exact header strings from "Form Responses 1" sheet.
const COL = {
  email:            "Email Address",
  firstName:        "First Name",
  lastName:         "Last Name",
  middleName:       "Middle Name",
  sex:              "Sex assigned at birth",
  birthday:         "Birthday",
  locality:         "Locality of Residence (Municipality & Province)",
  civilStatus:      "Civil Status",
  contactNumber:    "Contact Number",
  studentId:        "Alumni ID No. / Student ID No.",
  course:           "Degree and Program / Course Taken",
  batchYear:        "Batch",
  honors:           "Honors or awards received",
  isEmployed:       "Are you presently employed?",
  employmentStatus: "If employed, what is your present employment status?",
  currentPosition:  "Present Position / Designation (do not abbreviate)",
  currentCompany:   "Name of Company / Organization (do not abbreviate)",
  companyAddress:   "Company / Organization Address",
  industryType:     "Major line of business of the company you are currently employed in.",
  courseAligned:    "Is your first job/current job related to the course you took up in college?",
  timeToFirstJob:   "After graduation, how long did it take you to land your first job?",
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

function excelSerialToISO(serial) {
  if (!serial || typeof serial !== "number") return null;
  const utcDays = Math.floor(serial - 25569);
  const d = new Date(utcDays * 86400 * 1000);
  return d.toISOString().split("T")[0];
}

function normStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "n/a" ? null : s;
}

function normBool(v) {
  if (!v) return false;
  return String(v).trim().toLowerCase().startsWith("y");
}

function normBoolOrNull(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "n/a") return null;
  return s.startsWith("y");
}

function normBirthday(v) {
  if (!v) return null;
  if (typeof v === "number") return excelSerialToISO(v);
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return s;
}

function normBatchYear(v) {
  if (!v) return null;
  const n = Math.round(parseFloat(String(v)));
  return isNaN(n) ? null : n;
}

function normTimeToFirstJob(v) {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("less than 3") || s.includes("<3")) return "lt3mo";
  if (s.includes("3") && s.includes("6"))            return "3to6mo";
  if (s.includes("7") || s.includes("12"))           return "7to12mo";
  if (s.includes("more than") || s.includes("year") || s.includes(">1") || s.includes("gt1")) return "gt1yr";
  if (s.includes("not yet") || s.includes("never") || s.includes("unemployed")) return "not_yet";
  return undefined;
}

/**
 * Combine a Yes/No flag column with its detail column into a single raw string.
 * e.g. "Yes: Civil Service Passer, PRC License"
 *      "No"
 *      null (if no answer)
 */
function buildRaw(yesNoVal, detailVal) {
  const flag   = normStr(yesNoVal);
  const detail = normStr(detailVal);
  if (!flag) return null;
  return detail ? `${flag}: ${detail}` : flag;
}

/**
 * Extract meaningful detail text from a raw "Yes: <detail>" string.
 * Returns null if no usable detail (just "Yes"/"No", or "N/A"/"NA"/"None"/empty).
 */
function extractDetail(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  // Strip "Yes: " or "No: " prefix
  const stripped = s.replace(/^(yes|no)\s*:\s*/i, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (["n/a", "na", "none", "yes", "no", ""].includes(lower)) return null;
  return stripped;
}

/**
 * Parse a degree string like "Bachelor of Science in Industrial Engineering"
 * into { degree, fieldOfStudy }.
 */
function parseDegree(courseStr) {
  if (!courseStr) return { degree: "", fieldOfStudy: "" };
  const parts = courseStr.split(" in ");
  if (parts.length >= 2) {
    return { degree: parts[0].trim(), fieldOfStudy: parts.slice(1).join(" in ").trim() };
  }
  return { degree: courseStr.trim(), fieldOfStudy: "" };
}

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

async function sendPasswordResetEmail(email) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to send password reset email");
  }
}

// ── Resolve XLSX file path ────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

// Find the survey XLSX (filename contains "Responses" and is an xlsx)
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
// Prefer "Form Responses 1" sheet, fall back to first sheet
const sheetName =
  workbook.SheetNames.find((n) => n.toLowerCase().includes("form responses")) ??
  workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows  = utils.sheet_to_json(sheet, { defval: null });

console.log(`📋 Loaded ${rows.length} rows from sheet "${sheetName}".\n`);

// Interval job columns — long multi-line headers, match dynamically
const xlsxHeaders = Object.keys(rows[0] ?? {});
const COL_INTERVAL = {
  jobAt1yr: xlsxHeaders.find(h => h.includes("1 YEAR FROM GRADUATION")) ?? null,
  jobAt2yr: xlsxHeaders.find(h => h.includes("2 YEARS FROM GRADUATION")) ?? null,
  jobAt5yr: xlsxHeaders.find(h => h.includes("5 YEARS FROM GRADUATION")) ?? null,
  jobAt8yr: xlsxHeaders.find(h => h.includes("8 YEARS FROM GRADUATION")) ?? null,
};

// ── Load optional email corrections ──────────────────────────────────────────
let emailCorrections = {};
try {
  emailCorrections = JSON.parse(
    readFileSync(join(__dirname, "email-corrections.json"), "utf8")
  );
  console.log(`📧 Loaded ${Object.keys(emailCorrections).length} email correction(s).\n`);
} catch {
  // Optional file — ignore if absent
}

// ── Main loop ─────────────────────────────────────────────────────────────────
const results = { created: [], skipped: [], failed: [] };
const now     = new Date().toISOString();

for (const row of rows) {
  // ── Email ──
  const rawEmailVal = row[COL.email] ?? row["Email"] ?? row["email"];
  const corrected   = emailCorrections[String(rawEmailVal ?? "").trim()] ?? rawEmailVal;
  const email       = normStr(corrected)?.toLowerCase() ?? null;

  if (!email) {
    console.log("  ⚠  Skipped row — no email:", JSON.stringify(row).slice(0, 80));
    results.skipped.push({ reason: "no email", row: JSON.stringify(row).slice(0, 80) });
    continue;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log(`  ⚠  Skipped (invalid email): ${email}`);
    results.skipped.push({ email, reason: "invalid email format" });
    continue;
  }

  // ── Duplicate check ──
  try {
    await auth.getUserByEmail(email);
    console.log(`  ✗ Skipped (exists): ${email}`);
    results.skipped.push({ email, reason: "already exists" });
    continue;
  } catch (e) {
    if (e.code !== "auth/user-not-found") {
      console.log(`  ✗ Error checking ${email}:`, e.message);
      results.failed.push({ email, reason: e.message });
      continue;
    }
  }

  // ── Parse fields ──
  const firstName       = normStr(row[COL.firstName])  ?? "";
  const lastName        = normStr(row[COL.lastName])   ?? "";
  const middleName      = normStr(row[COL.middleName]);
  const sex             = normStr(row[COL.sex]);
  const birthday        = normBirthday(row[COL.birthday]);
  const locality        = normStr(row[COL.locality]);
  const civilStatus     = normStr(row[COL.civilStatus]);
  const contactNumber   = normStr(row[COL.contactNumber]);
  const studentId       = normStr(row[COL.studentId]);
  const course          = normStr(row[COL.course]);
  const batchYear       = normBatchYear(row[COL.batchYear]);
  const honors          = normStr(row[COL.honors]);
  const isEmployed      = normBool(row[COL.isEmployed]);
  const employmentStatus = normStr(row[COL.employmentStatus]);
  const currentPosition  = normStr(row[COL.currentPosition]);
  const currentCompany   = normStr(row[COL.currentCompany]);
  const companyAddress   = normStr(row[COL.companyAddress]);
  const industryType     = normStr(row[COL.industryType]);
  const courseAligned    = normBoolOrNull(row[COL.courseAligned]);
  const timeToFirstJob   = normTimeToFirstJob(row[COL.timeToFirstJob]);
  const licensesRaw      = buildRaw(row[COL.hasLicenses], row[COL.licensesDetail]);
  const researchRaw      = buildRaw(row[COL.hasResearch], row[COL.researchDetail]);
  const communityExtensionRaw = buildRaw(row[COL.hasCommunity], row[COL.communityDetail]);
  const trainingRaw    = buildRaw(row[COL.hasTraining], row[COL.trainingDetail]);
  const awardsRaw      = buildRaw(row[COL.hasAwards], row[COL.awardsDetail]);

  const jobAt1yr = COL_INTERVAL.jobAt1yr ? normStr(row[COL_INTERVAL.jobAt1yr]) : null;
  const jobAt2yr = COL_INTERVAL.jobAt2yr ? normStr(row[COL_INTERVAL.jobAt2yr]) : null;
  const jobAt5yr = COL_INTERVAL.jobAt5yr ? normStr(row[COL_INTERVAL.jobAt5yr]) : null;
  const jobAt8yr = COL_INTERVAL.jobAt8yr ? normStr(row[COL_INTERVAL.jobAt8yr]) : null;

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email;

  try {
    // 1. Create Auth account
    const tempPassword = crypto.randomBytes(32).toString("hex");
    const userRecord   = await auth.createUser({
      email,
      password: tempPassword,
      displayName,
      emailVerified: true,
    });

    // 2. Set custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: "alumni" });

    // 3. Build and write Firestore users/{uid} doc
    const userDoc = {
      uid:            userRecord.uid,
      email,
      role:           "alumni",
      displayName,
      photoURL:       null,
      createdAt:      now,
      updatedAt:      now,
      isActive:       true,
      profileComplete: 0, // will be recalculated below
      batchYear,
      department:     "College of Engineering",
      course,
      studentId,
      notifPrefs:     { jobs: true, events: true },
      isEmployed,
      importedByAdmin: true,
      isClaimed:       false,
    };

    // Only set optional fields when they have a value
    if (middleName)       userDoc.middleName       = middleName;
    if (sex)              userDoc.sex              = sex;
    if (birthday)         userDoc.birthday         = birthday;
    if (contactNumber)    userDoc.contactNumber    = contactNumber;
    if (civilStatus)      userDoc.civilStatus      = civilStatus;
    if (locality)         userDoc.locality         = locality;
    if (currentPosition)  userDoc.currentPosition  = currentPosition;
    if (currentCompany)   userDoc.currentCompany   = currentCompany;
    if (honors)           userDoc.honors           = honors;
    if (employmentStatus) userDoc.employmentStatus = employmentStatus;
    if (companyAddress)   userDoc.companyAddress   = companyAddress;
    if (industryType)     userDoc.industryType     = industryType;
    if (courseAligned !== null) userDoc.courseAligned = courseAligned;
    if (timeToFirstJob)   userDoc.timeToFirstJob   = timeToFirstJob;
    if (licensesRaw)      userDoc.licensesRaw      = licensesRaw;
    if (researchRaw)      userDoc.researchRaw      = researchRaw;
    if (communityExtensionRaw) userDoc.communityExtensionRaw = communityExtensionRaw;
    if (trainingRaw)      userDoc.trainingRaw      = trainingRaw;
    if (awardsRaw)        userDoc.awardsRaw        = awardsRaw;
    if (jobAt1yr) userDoc.jobAt1yr = jobAt1yr;
    if (jobAt2yr) userDoc.jobAt2yr = jobAt2yr;
    if (jobAt5yr) userDoc.jobAt5yr = jobAt5yr;
    if (jobAt8yr) userDoc.jobAt8yr = jobAt8yr;

    // Dynamically calculate profile completion
    userDoc.profileComplete = calcProfileComplete(userDoc);

    // Remove null values for clean Firestore docs
    const cleanDoc = Object.fromEntries(
      Object.entries(userDoc).filter(([, v]) => v !== null)
    );

    await db.collection("users").doc(userRecord.uid).set(cleanDoc);

    // 4. Write profile subcollection pre-filled from survey
    // -- Build structured arrays from raw survey data --
    const educationArr = [];
    if (course) {
      const { degree: degStr, fieldOfStudy } = parseDegree(course);
      const honorsClean = honors && !["n/a", "na", "none"].includes(honors.toLowerCase()) && !/^\d+\s*[a-z]$/i.test(honors.trim()) ? honors : "";
      educationArr.push({
        id: crypto.randomBytes(10).toString("hex"),
        institution: "Southern Luzon State University",
        degree: degStr,
        fieldOfStudy,
        yearStarted: batchYear ? batchYear - 4 : 0,
        yearEnded: batchYear ?? null,
        honors: honorsClean,
      });
    }

    const licensesArr = [];
    const licDetail = extractDetail(licensesRaw);
    if (licDetail) {
      licensesArr.push({ id: crypto.randomBytes(10).toString("hex"), name: licDetail, issuingBody: "", licenseNumber: "", dateIssued: "", fileURL: "" });
    }

    const awardsArr = [];
    const awardDetail = extractDetail(awardsRaw);
    if (awardDetail) {
      awardsArr.push({ id: crypto.randomBytes(10).toString("hex"), title: awardDetail, grantedBy: "", year: 0, description: "" });
    }

    const researchArr = [];
    const researchDetail = extractDetail(researchRaw);
    if (researchDetail) {
      researchArr.push({ id: crypto.randomBytes(10).toString("hex"), title: researchDetail, coAuthors: "", publishedIn: "", year: 0, doiOrLink: "" });
    }

    const communityArr = [];
    const communityDetail = extractDetail(communityExtensionRaw);
    if (communityDetail) {
      communityArr.push({ id: crypto.randomBytes(10).toString("hex"), programName: communityDetail, organization: "", role: "", startDate: "", endDate: "" });
    }

    const trainingArr = [];
    const trainingDetail = extractDetail(trainingRaw);
    if (trainingDetail) {
      trainingArr.push({ id: crypto.randomBytes(10).toString("hex"), title: trainingDetail, provider: "", dateCompleted: "", certificateURL: "", description: "" });
    }

    const profileDoc = {
      firstName,
      lastName,
      birthDate:     birthday      ?? "",
      gender:        sex           ?? "",
      civilStatus:   civilStatus   ?? "",
      contactNumber: contactNumber ?? "",
      address:       locality      ?? "",
      currentEmployment: {
        isEmployed:     isEmployed ?? false,
        employerName:   currentCompany   ?? "",
        position:       currentPosition  ?? "",
        industry:       industryType     ?? "",
        employmentType: employmentStatus ?? "",
        startDate:      "",
        city:           companyAddress   ?? "",
      },
      education:          educationArr,
      employmentHistory:  [],
      licenses:           licensesArr,
      awards:             awardsArr,
      research:           researchArr,
      communityExtension: communityArr,
      training:           trainingArr,
    };

    await db
      .collection("users").doc(userRecord.uid)
      .collection("profile").doc("data")
      .set(profileDoc);

    // 5. Send password reset email
    await sendPasswordResetEmail(email);

    console.log(`  ✓ Created: ${email}`);
    results.created.push({ email, uid: userRecord.uid });
  } catch (err) {
    console.log(`  ✗ Failed: ${email} — ${err.message}`);
    results.failed.push({ email, reason: err.message });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────");
console.log(`✅ Created:  ${results.created.length}`);
console.log(`⏭  Skipped:  ${results.skipped.length}`);
console.log(`❌ Failed:   ${results.failed.length}`);
console.log("─────────────────────────────────────────\n");

const resultPath = join(__dirname, "seed-survey-results.json");
writeFileSync(resultPath, JSON.stringify(results, null, 2));
console.log(`Results saved to scripts/seed-survey-results.json`);

process.exit(0);
