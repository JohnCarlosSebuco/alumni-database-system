/**
 * One-time patch: backfill the `courseAligned` field for all imported alumni
 * using the explicit survey answer from the spreadsheet.
 *
 * Column: "Is your first job/current job related to the course you took up in college?"
 *
 * Usage: node scripts/patch-course-alignment.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { read, utils } from "xlsx";

const serviceAccount = {
  projectId: "alumni-database-system-8329f",
  clientEmail: "firebase-adminsdk-fbsvc@alumni-database-system-8329f.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVhEbJK9khOene\nD9GyN4YT7lJaLjbi5XUMQ92NG3ChzuymEP3PyukiJXiHlpMOzQFfGvrsFpBNavYe\ny/q9heeKNS6Nvn3ZtJ2Ioe4oxA31L4VQuOAIjTNq2gZvUfeT8Hoi2hwDbqPgi3Ii\nbui3GhrTEEGOMRH3Urxve/19rKedXmbUdKCFdBYrXvQKAfsHDW7m8s2nkleyWl9d\ns9Z0HeQJmfE61LaUmbu4sF3Xbi8Sba6IvbJKNNojgo1lCMw/NCTPqKbxklV8U57d\ngYJeJq03JvspsGRY1dL56UAJx5eXD4t0sJu52yovUHkDMFlqTKtgic+y6g+YcGTJ\ndk81tmYDAgMBAAECggEAApn5KVLnaj6VJR6LDqMMreE9qZNzs+HOLPuZTmLu+wrl\nOFZ6xlg2U1zp06tCKzN4zKMb0yF7qLQJKD5OC2j+dg4Br+0akcAALtXXA0O2AnXS\nENrrMdZTGvyNSveya1xAo8V04i3VNdRlAo84mVlEW1vFVfFy6bgnF8F8PZ/UR1an\nMoyNJWmxMls/6V/9enxc9fUnCB7ART47A2Uh8or5w6xZRdrRgZxkJjOHOGu7Azk3\nY7MxlFcoboDgEsrn1eIv9mq8cgK6qqEXyNsr6lK4pRo+mUhEDs6qsghX5IXmNK12\naBdcjuCScuSiTVrFCEn8tH3gLZrBImk34NZexqkA8QKBgQDG1jZE6/Gh4MdKSSEN\npY+c7JJsp1uCn06ToKyfg9vpGydKclOkAHGJEk3/9LMbmhm9fy2/8SiAW2rHvq3r\nlUGFJrkweRKQjN3XgZdxvpTepqEBDhmzSzsgSvN8hs7wu/+cAUmWf/MqH82XO4qP\nvUxZz5jYGzKz3bocwN1ie0x8dQKBgQDAgEGiKpu38+W7D3o7qIjpxIiyLa1Y9NmT\n0w+jB8itry0ZXQq9z9WR1dv8ZdIaT80qPaUVaT1P2eNdbPuL4V0Cb04jfiL+KvnS\nuVmx/t+WzG1IynHDq6+HOqAl18CuvodByLPIns7g8T+lnXTjGIjqUInNDaklEsRk\nb+DJ/LlplwKBgH4sYmWb30ocq/ncq+fP/nDSwhvGm1ApLSCK3d+fOcYTH/yizaaN\nTX5wqiRYr+s8/0Z7VJmvO0cwO3Mi8ZRDsz7+EpfKzFgDu6ZMKsDX8fnTfOmBfBeF\nDrDwPs/vb5PdiFcDjiG9cZ1ybvCfrM6HjdKT5GaF48e1VKt4S0N6AFAdAoGAVKQQ\nN82kSm3jRSy5AiJIkQDpWe7bmZGPWYAkD/sMMdIkclKGto77yPPPllru1sLf4wLX\n42IyozmazylsMUUWMEvgf5qmqDsdPZph5fG7PgMEyky5WN/UfhE4+Wq0PiFoN3SY\nGE47iIyK/7cL/g57pQtki9TF2pc14zOOE0IcBGECgYAsCi3NDdrhp9JVxkBchFwX\nWFYUS1nN9x2G4DA7FBiKLsRoRAMqWkferZt0VKZrhjUAGR/MfJW5KFJ/A5E4BN22\n1AzRzli0raUGqodIx5RsU/FJ9rzHoQ1qtsWx/T3EZTnijDbvAQOZvxTf4QKbNJLF\nWfqYwgnAi/1sIUuGZOIptQ==\n-----END PRIVATE KEY-----\n",
};

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

const COLUMN = "Is your first job/current job related to the course you took up in college?";

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxPath = join(__dirname, "../public/Alumni Database System Responses.xlsx");

const workbook = read(readFileSync(xlsxPath), { type: "buffer" });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = utils.sheet_to_json(sheet, { defval: null });

console.log(`\n📋 Loaded ${rows.length} rows from spreadsheet.\n`);

// Check the column exists
const headers = Object.keys(rows[0] ?? {});
if (!headers.includes(COLUMN)) {
  console.error(`✗ Column not found: "${COLUMN}"`);
  console.error(`  Available columns:\n  ${headers.join("\n  ")}`);
  process.exit(1);
}

let patched = 0;
let noMatch = 0;
let skipped = 0;

for (const row of rows) {
  const rawEmail = String(row["Email Address"] ?? row["Email"] ?? "").trim().toLowerCase();
  const rawValue = row[COLUMN];

  if (!rawEmail) {
    skipped++;
    continue;
  }

  // No value in this column for this row — skip (don't overwrite with null)
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === "") {
    skipped++;
    continue;
  }

  const courseAligned = String(rawValue).trim().toLowerCase().startsWith("y");

  try {
    const userRecord = await auth.getUserByEmail(rawEmail);
    await db.collection("users").doc(userRecord.uid).update({ courseAligned });
    console.log(`  ✓ Patched: ${rawEmail} → courseAligned=${courseAligned}`);
    patched++;
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.log(`  ✗ No match: ${rawEmail}`);
    } else {
      console.log(`  ✗ Error: ${rawEmail} — ${e.message}`);
    }
    noMatch++;
  }
}

console.log("\n─────────────────────────────────────────");
console.log(`✅ Patched:  ${patched}`);
console.log(`✗ No match: ${noMatch}`);
console.log(`⏭ Skipped:  ${skipped}`);
console.log("─────────────────────────────────────────\n");

process.exit(0);
