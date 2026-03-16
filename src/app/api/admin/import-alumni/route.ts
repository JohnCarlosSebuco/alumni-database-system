import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import crypto from "crypto";
import { read, utils } from "xlsx";

// ── Auth helper ──────────────────────────────────────────────────────────────
async function verifyAdminCaller(req: Request) {
  const sessionCookie = req.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("__session="))
    ?.split("=")[1];
  if (!sessionCookie) return null;
  const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  const snap = await admin.firestore().collection("users").doc(decoded.uid).get();
  const role = snap.data()?.role;
  if (role !== "admin" && role !== "super_admin") return null;
  return decoded;
}

// ── Column mapping ───────────────────────────────────────────────────────────
// Each entry: canonical field name → list of normalized aliases to match against
const COLUMN_ALIASES: Record<string, string[]> = {
  email: [
    "email address", "email", "e mail", "gmail", "email add", "emailaddress", "e-mail",
  ],
  firstName: [
    "first name", "given name", "firstname", "first names", "given names", "first",
  ],
  lastName: [
    "last name", "surname", "family name", "lastname", "last", "family",
  ],
  middleName: ["middle name", "middlename", "middle", "middle initial"],
  course: [
    // Normalize "Degree and Program / Course Taken" → "degree and program   course taken"
    "degree and program   course taken",
    "degree and program course taken",
    "degree and program",
    "course taken",
    "course",
    "program",
    "degree",
    "degree program",
    "degree   program",
  ],
  batchYear: [
    "batch year", "batch", "year graduated", "year of graduation",
    "graduation year", "school year graduated",
  ],
  birthday: ["birthday", "date of birth", "birth date", "birthdate", "dob"],
  isEmployed: [
    "are you presently employed",
    "employment status",
    "presently employed",
    "employed",
    "are you employed",
    "currently employed",
  ],
  studentId: [
    "alumni id no", "student id no", "alumni id no.", "student id no.",
    "alumni id", "student id", "id number", "id no", "id no.",
    "alumniid", "studentid",
  ],
  sex: ["sex assigned at birth", "sex", "gender", "sex at birth", "biological sex"],
  contactNumber: [
    "contact number", "phone number", "mobile number", "contact no",
    "phone", "mobile", "cellphone", "cell number", "telephone",
  ],
  civilStatus: ["civil status", "marital status", "civil marital status"],
  locality: [
    "locality of residence", "locality", "address",
    "city municipality", "city", "municipality", "barangay",
    "residence", "home address", "place of residence",
  ],
  currentPosition: [
    "present position   designation",
    "present position designation",
    "present position",
    "position",
    "job title",
    "designation",
    "occupation",
    "current position",
  ],
  currentCompany: [
    "name of company   organization",
    "name of company organization",
    "name of company",
    "company",
    "employer",
    "organization",
    "workplace",
    "company name",
  ],
  honors: [
    "honors or awards received", "honors", "awards",
    "honors awards", "achievements", "academic honors",
  ],
  courseAligned: [
    "is your first job current job related to the course you took up in college",
    "job related to course",
    "course aligned",
    "is job related to course",
    "course related job",
    "first job related to course",
  ],
  timeToFirstJob: [
    "after graduation how long did it take you to land your first job",
    "time to first job",
    "how long to first job",
    "waiting time",
    "employment waiting time",
  ],
};

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function buildResolver(headers: string[]) {
  const fieldToHeader: Record<string, string> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const header of headers) {
      const nh = normKey(header);
      if (aliases.some((a) => a === nh)) {
        if (!fieldToHeader[field]) fieldToHeader[field] = header;
        break;
      }
    }
    // Second pass: partial match (header contains alias)
    if (!fieldToHeader[field]) {
      for (const header of headers) {
        const nh = normKey(header);
        if (aliases.some((a) => nh.includes(a) || a.includes(nh))) {
          if (!fieldToHeader[field]) fieldToHeader[field] = header;
          break;
        }
      }
    }
  }

  return {
    get: (row: Record<string, unknown>, field: string): unknown =>
      fieldToHeader[field] !== undefined ? row[fieldToHeader[field]] : undefined,
    detected: fieldToHeader,
  };
}

// ── Value normalizers ────────────────────────────────────────────────────────
function normStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "n/a" ? null : s;
}

function normBool(v: unknown): boolean {
  if (!v) return false;
  return String(v).trim().toLowerCase().startsWith("y");
}

function normTimeToFirstJob(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s.includes("less than 3") || s.includes("lt3") || s.includes("<3")) return "lt3mo";
  if (s.includes("3") && s.includes("6")) return "3to6mo";
  if (s.includes("7") || s.includes("12")) return "7to12mo";
  if (s.includes("more than") || s.includes("year") || s.includes(">1") || s.includes("gt1")) return "gt1yr";
  if (s.includes("not yet") || s.includes("never") || s.includes("unemployed")) return "not_yet";
  return undefined;
}

// Returns true/false when a clear Yes/No answer is present, undefined when column is absent
function normBoolOrUndef(v: unknown): boolean | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "n/a") return undefined;
  return s.startsWith("y");
}

function normBirthday(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "number") {
    const d = new Date(Math.floor(v - 25569) * 86400 * 1000);
    return d.toISOString().split("T")[0];
  }
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return s;
}

function normBatchYear(v: unknown): number | null {
  if (!v) return null;
  const n = Math.round(parseFloat(String(v)));
  return isNaN(n) ? null : n;
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext ?? "")) {
      return NextResponse.json(
        { error: "Only .xlsx and .xls files are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    if (rows.length === 0) {
      return NextResponse.json({ error: "The spreadsheet is empty." }, { status: 400 });
    }

    const headers = Object.keys(rows[0]);
    const resolver = buildResolver(headers);

    const created: { email: string; uid: string }[] = [];
    const skipped: { email: string; reason: string }[] = [];
    const failed:  { email: string; reason: string }[] = [];

    const now = new Date().toISOString();

    for (const row of rows) {
      // Email — try resolver first, then common fallback column names
      const rawEmail = normStr(
        resolver.get(row, "email") ??
        row["Email Address"] ??
        row["Email"] ??
        row["email"]
      );

      if (!rawEmail) {
        skipped.push({ email: "(blank)", reason: "No email address" });
        continue;
      }

      const email = rawEmail.toLowerCase();

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        failed.push({ email, reason: "Invalid email format" });
        continue;
      }

      // Duplicate check
      try {
        await admin.auth().getUserByEmail(email);
        skipped.push({ email, reason: "Already exists" });
        continue;
      } catch (e: unknown) {
        if ((e as { code?: string }).code !== "auth/user-not-found") {
          failed.push({ email, reason: "Error checking account" });
          continue;
        }
      }

      // Extract profile fields
      const firstName     = normStr(resolver.get(row, "firstName")) ?? "";
      const lastName      = normStr(resolver.get(row, "lastName"))  ?? "";
      const displayName   = [firstName, lastName].filter(Boolean).join(" ") || email;
      const course        = normStr(resolver.get(row, "course"));
      const batchYear     = normBatchYear(resolver.get(row, "batchYear"));
      const birthday      = normBirthday(resolver.get(row, "birthday"));
      const isEmployed    = normBool(resolver.get(row, "isEmployed"));
      const studentId     = normStr(resolver.get(row, "studentId"));
      const middleName    = normStr(resolver.get(row, "middleName"));
      const sex           = normStr(resolver.get(row, "sex"));
      const contactNumber = normStr(resolver.get(row, "contactNumber"));
      const civilStatus   = normStr(resolver.get(row, "civilStatus"));
      const locality      = normStr(resolver.get(row, "locality"));
      const currentPosition = normStr(resolver.get(row, "currentPosition"));
      const currentCompany  = normStr(resolver.get(row, "currentCompany"));
      const honors          = normStr(resolver.get(row, "honors"));
      const courseAligned   = normBoolOrUndef(resolver.get(row, "courseAligned"));
      const timeToFirstJob  = normTimeToFirstJob(resolver.get(row, "timeToFirstJob"));

      try {
        const tempPassword = crypto.randomBytes(32).toString("hex");
        const userRecord = await admin.auth().createUser({
          email,
          password: tempPassword,
          displayName,
          emailVerified: true,
        });

        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "alumni" });

        const userDoc: Record<string, unknown> = {
          uid: userRecord.uid,
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
          course,
          studentId,
          notifPrefs: { jobs: true, events: true },
          importedByAdmin: true,
          isClaimed: false,
          isEmployed,
        };

        if (middleName)                 userDoc.middleName = middleName;
        if (sex)                        userDoc.sex = sex;
        if (birthday)                   userDoc.birthday = birthday;
        if (contactNumber)              userDoc.contactNumber = contactNumber;
        if (civilStatus)                userDoc.civilStatus = civilStatus;
        if (locality)                   userDoc.locality = locality;
        if (currentPosition)            userDoc.currentPosition = currentPosition;
        if (currentCompany)             userDoc.currentCompany = currentCompany;
        if (honors)                     userDoc.honors = honors;
        if (courseAligned !== undefined) userDoc.courseAligned = courseAligned;
        if (timeToFirstJob)              userDoc.timeToFirstJob = timeToFirstJob;

        // Strip null values for clean Firestore docs
        const cleanDoc = Object.fromEntries(
          Object.entries(userDoc).filter(([, v]) => v !== null)
        );

        await admin.firestore().collection("users").doc(userRecord.uid).set(cleanDoc);

        const profileDoc: Record<string, unknown> = {
          firstName,
          lastName,
          birthDate:     birthday      ?? "",
          gender:        sex           ?? "",
          civilStatus:   civilStatus   ?? "",
          contactNumber: contactNumber ?? "",
          address:       locality      ?? "",
          currentEmployment: {
            isEmployed:     isEmployed ?? false,
            employerName:   currentCompany  ?? "",
            position:       currentPosition ?? "",
            industry:       "",
            employmentType: "",
            startDate:      "",
            city:           "",
          },
          education:          [],
          employmentHistory:  [],
          licenses:           [],
          awards:             [],
          research:           [],
          communityExtension: [],
        };

        await admin
          .firestore()
          .collection("users").doc(userRecord.uid)
          .collection("profile").doc("data")
          .set(profileDoc);

        created.push({ email, uid: userRecord.uid });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        failed.push({ email, reason: msg.includes("email-already-exists") ? "Already exists" : msg });
      }
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
      failed:  failed.length,
      failedRows: failed,
      detectedColumns: resolver.detected,
    });
  } catch (err: unknown) {
    console.error("[/api/admin/import-alumni]", err);
    return NextResponse.json({ error: "Import failed. Please try again." }, { status: 500 });
  }
}
