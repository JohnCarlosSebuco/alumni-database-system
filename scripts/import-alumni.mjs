/**
 * One-time script to import alumni from the Google Forms Excel export.
 * Usage: node scripts/import-alumni.mjs
 *
 * Reads: public/Alumni Database System Responses.xlsx
 * - Creates Firebase Auth accounts (emailVerified: true, random password)
 * - Sets custom claim role: "alumni"
 * - Writes Firestore user docs with all profile fields
 * - Sends password reset email via Firebase REST API
 * - Skips rows with no email or already-existing accounts
 * - Writes scripts/import-results.json summary
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { read, utils } from "xlsx";
import crypto from "crypto";

// ── Firebase config (same credentials as set-admin-role.mjs) ────────────────
const serviceAccount = {
  projectId: "alumni-database-system-8329f",
  clientEmail: "firebase-adminsdk-fbsvc@alumni-database-system-8329f.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVhEbJK9khOene\nD9GyN4YT7lJaLjbi5XUMQ92NG3ChzuymEP3PyukiJXiHlpMOzQFfGvrsFpBNavYe\ny/q9heeKNS6Nvn3ZtJ2Ioe4oxA31L4VQuOAIjTNq2gZvUfeT8Hoi2hwDbqPgi3Ii\nbui3GhrTEEGOMRH3Urxve/19rKedXmbUdKCFdBYrXvQKAfsHDW7m8s2nkleyWl9d\ns9Z0HeQJmfE61LaUmbu4sF3Xbi8Sba6IvbJKNNojgo1lCMw/NCTPqKbxklV8U57d\ngYJeJq03JvspsGRY1dL56UAJx5eXD4t0sJu52yovUHkDMFlqTKtgic+y6g+YcGTJ\ndk81tmYDAgMBAAECggEAApn5KVLnaj6VJR6LDqMMreE9qZNzs+HOLPuZTmLu+wrl\nOFZ6xlg2U1zp06tCKzN4zKMb0yF7qLQJKD5OC2j+dg4Br+0akcAALtXXA0O2AnXS\nENrrMdZTGvyNSveya1xAo8V04i3VNdRlAo84mVlEW1vFVfFy6bgnF8F8PZ/UR1an\nMoyNJWmxMls/6V/9enxc9fUnCB7ART47A2Uh8or5w6xZRdrRgZxkJjOHOGu7Azk3\nY7MxlFcoboDgEsrn1eIv9mq8cgK6qqEXyNsr6lK4pRo+mUhEDs6qsghX5IXmNK12\naBdcjuCScuSiTVrFCEn8tH3gLZrBImk34NZexqkA8QKBgQDG1jZE6/Gh4MdKSSEN\npY+c7JJsp1uCn06ToKyfg9vpGydKclOkAHGJEk3/9LMbmhm9fy2/8SiAW2rHvq3r\nlUGFJrkweRKQjN3XgZdxvpTepqEBDhmzSzsgSvN8hs7wu/+cAUmWf/MqH82XO4qP\nvUxZz5jYGzKz3bocwN1ie0x8dQKBgQDAgEGiKpu38+W7D3o7qIjpxIiyLa1Y9NmT\n0w+jB8itry0ZXQq9z9WR1dv8ZdIaT80qPaUVaT1P2eNdbPuL4V0Cb04jfiL+KvnS\nuVmx/t+WzG1IynHDq6+HOqAl18CuvodByLPIns7g8T+lnXTjGIjqUInNDaklEsRk\nb+DJ/LlplwKBgH4sYmWb30ocq/ncq+fP/nDSwhvGm1ApLSCK3d+fOcYTH/yizaaN\nTX5wqiRYr+s8/0Z7VJmvO0cwO3Mi8ZRDsz7+EpfKzFgDu6ZMKsDX8fnTfOmBfBeF\nDrDwPs/vb5PdiFcDjiG9cZ1ybvCfrM6HjdKT5GaF48e1VKt4S0N6AFAdAoGAVKQQ\nN82kSm3jRSy5AiJIkQDpWe7bmZGPWYAkD/sMMdIkclKGto77yPPPllru1sLf4wLX\n42IyozmazylsMUUWMEvgf5qmqDsdPZph5fG7PgMEyky5WN/UfhE4+Wq0PiFoN3SY\nGE47iIyK/7cL/g57pQtki9TF2pc14zOOE0IcBGECgYAsCi3NDdrhp9JVxkBchFwX\nWFYUS1nN9x2G4DA7FBiKLsRoRAMqWkferZt0VKZrhjUAGR/MfJW5KFJ/A5E4BN22\n1AzRzli0raUGqodIx5RsU/FJ9rzHoQ1qtsWx/T3EZTnijDbvAQOZvxTf4QKbNJLF\nWfqYwgnAi/1sIUuGZOIptQ==\n-----END PRIVATE KEY-----\n",
};

// Firebase API key — used to send password reset emails via REST API
// This is the Web API key (public), not the service account private key
const FIREBASE_API_KEY = "AIzaSyAAFIYVsViLd-njDd9AoOzm_GWEsT8Kemw";

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an Excel date serial (e.g. 44927) to ISO date string (YYYY-MM-DD).
 * Excel epoch is Jan 1 1900 (with the Lotus 1-2-3 leap year bug offset).
 */
function excelSerialToISO(serial) {
  if (!serial || typeof serial !== "number") return null;
  const utcDays = Math.floor(serial - 25569); // days since Unix epoch
  const ms = utcDays * 86400 * 1000;
  const d = new Date(ms);
  return d.toISOString().split("T")[0];
}

function normStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function normBool(v) {
  if (!v) return false;
  return String(v).trim().toLowerCase().startsWith("y");
}

// Returns true/false when a clear answer exists, null when the column is absent/blank
function normBoolOrNull(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "n/a") return null;
  return s.startsWith("y");
}

function normBirthday(v) {
  if (!v) return null;
  if (typeof v === "number") return excelSerialToISO(v);
  // Try parsing a string date
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return s; // keep raw if unparseable
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

// ── Main ─────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxPath = join(__dirname, "../public/Alumni Database System Responses.xlsx");

const workbook = read(readFileSync(xlsxPath), { type: "buffer" });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = utils.sheet_to_json(sheet, { defval: null });

console.log(`\n📋 Loaded ${rows.length} rows from spreadsheet.\n`);

// Load email corrections (admin edits scripts/email-corrections.json before re-running)
let emailCorrections = {};
try {
  emailCorrections = JSON.parse(readFileSync(join(__dirname, "email-corrections.json"), "utf8"));
  console.log(`📧 Loaded ${Object.keys(emailCorrections).length} email correction(s).\n`);
} catch {
  // File is optional — no corrections applied
}

const results = { created: [], skipped: [], failed: [] };
const now = new Date().toISOString();

for (const row of rows) {
  // Column names from the Google Form export — adjust if they differ slightly
  const rawEmailVal = row["Email Address"] ?? row["Email"] ?? row["email"];
  const corrected = emailCorrections[String(rawEmailVal ?? "").trim()] ?? rawEmailVal;
  const email = normStr(corrected);

  if (!email) {
    console.log("  ⚠ Skipped row — no email:", JSON.stringify(row).slice(0, 80));
    results.skipped.push({ reason: "no email", row: JSON.stringify(row).slice(0, 80) });
    continue;
  }

  // Check if account already exists
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
    // user-not-found = good, proceed
  }

  // Parse fields
  const firstName = normStr(row["First Name"] ?? row["firstname"] ?? "");
  const lastName  = normStr(row["Last Name"]  ?? row["lastname"]  ?? "");
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email;

  const batchRaw = row["Batch"] ?? row["Batch Year"];
  const batchYear = batchRaw ? Math.round(parseFloat(String(batchRaw))) : null;

  const birthdayRaw = row["Birthday"] ?? row["Date of Birth"];
  const birthday = normBirthday(birthdayRaw);

  const isEmployed = normBool(
    row["Are you presently employed?"] ??
    row["Employment Status"] ??
    row["Presently Employed"]
  );

  const userPayload = {
    uid: "", // filled after createUser
    email,
    role: "alumni",
    displayName,
    photoURL: null,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    profileComplete: 0,
    batchYear,
    department: "College of Engineering",
    course: normStr(row["Degree and Program / Course Taken"] ?? row["Degree and Program"] ?? row["Course Taken"] ?? row["Course"]),
    studentId: normStr(row["Alumni ID No."] ?? row["Student ID No."] ?? row["Alumni ID"] ?? row["Student ID"]),
    notifPrefs: { jobs: true, events: true },
    // Extended fields
    middleName: normStr(row["Middle Name"]),
    sex: normStr(row["Sex assigned at birth"] ?? row["Sex"] ?? row["Gender"]),
    birthday,
    contactNumber: normStr(row["Contact Number"] ?? row["Phone Number"]),
    civilStatus: normStr(row["Civil Status"]),
    locality: normStr(row["Locality of Residence"] ?? row["Locality"]),
    isEmployed,
    currentPosition: normStr(row["Present Position / Designation"] ?? row["Position"]),
    currentCompany: normStr(row["Name of Company / Organization"] ?? row["Company"]),
    honors: normStr(row["Honors or awards received"] ?? row["Honors"]),
    courseAligned: normBoolOrNull(
      row["Is your first job/current job related to the course you took up in college?"] ??
      row["Job related to course"] ??
      row["Course aligned"]
    ),
    // Import tracking
    importedByAdmin: true,
    isClaimed: false,
  };

  try {
    // 1. Create Auth account
    const tempPassword = crypto.randomBytes(32).toString("hex");
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName,
      emailVerified: true,
    });

    // 2. Set custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: "alumni" });

    // 3. Write Firestore doc
    userPayload.uid = userRecord.uid;
    // Remove null values to keep Firestore clean
    const doc = Object.fromEntries(
      Object.entries(userPayload).filter(([, v]) => v !== null)
    );
    await db.collection("users").doc(userRecord.uid).set(doc);

    // 4. Send password reset email
    await sendPasswordResetEmail(email);

    console.log(`  ✓ Created: ${email}`);
    results.created.push({ email, uid: userRecord.uid });
  } catch (err) {
    console.log(`  ✗ Failed: ${email} — ${err.message}`);
    results.failed.push({ email, reason: err.message });
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("\n─────────────────────────────────────────");
console.log(`✅ Created:  ${results.created.length}`);
console.log(`⏭ Skipped:  ${results.skipped.length}`);
console.log(`❌ Failed:   ${results.failed.length}`);
console.log("─────────────────────────────────────────\n");

const resultPath = join(__dirname, "import-results.json");
writeFileSync(resultPath, JSON.stringify(results, null, 2));
console.log(`Results saved to scripts/import-results.json`);

process.exit(0);
