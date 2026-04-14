import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import { read, utils } from "xlsx";
import { isAbroadAddress } from "@/lib/utils/courseAlignment";

// ── Auth helper ───────────────────────────────────────────────────────────────
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

// ── Column aliases (subset — only fields we want to enrich) ──────────────────
const ALIASES: Record<string, string[]> = {
  email: ["email address", "email", "e mail", "gmail", "email add", "emailaddress", "e-mail"],
  timeToFirstJob: [
    "after graduation how long did it take you to land your first job",
    "time to first job",
    "how long to first job",
    "waiting time",
    "employment waiting time",
  ],
  courseAligned: [
    "is your first job current job related to the course you took up in college",
    "job related to course",
    "course aligned",
    "is job related to course",
    "course related job",
    "first job related to course",
  ],
  isAbroad: [
    "are you working abroad",
    "working abroad",
    "work abroad",
    "currently working abroad",
    "overseas worker",
    "ofw",
  ],
  companyAddress: [
    "company   organization address",
    "company organization address",
    "company address",
    "organization address",
    "office address",
    "work address",
  ],
  locality: [
    "locality of residence",
    "locality",
    "address",
    "city municipality",
    "place of residence",
    "residence",
  ],
  jobAt1yr: [
    "job within 1 year from graduation",
    "job at 1 year", "1 year job", "job 1yr",
  ],
  jobAt2yr: [
    "job within 2 years from graduation",
    "job at 2 years", "2 year job", "job 2yr",
  ],
  jobAt5yr: [
    "job within 5 years from graduation",
    "job at 5 years", "5 year job", "job 5yr",
  ],
  jobAt8yr: [
    "job within 8 years from graduation",
    "job at 8 years", "8 year job", "job 8yr",
  ],
};

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

function buildResolver(headers: string[]) {
  const map: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    for (const header of headers) {
      const nh = normKey(header);
      if (aliases.some((a) => a === nh || nh.includes(a) || a.includes(nh))) {
        if (!map[field]) { map[field] = header; break; }
      }
    }
  }
  return {
    get: (row: Record<string, unknown>, field: string): unknown =>
      map[field] !== undefined ? row[map[field]] : undefined,
    detected: map,
  };
}

function normStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "n/a" ? null : s;
}

function normBoolOrUndef(v: unknown): boolean | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "n/a") return undefined;
  return s.startsWith("y");
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

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const caller = await verifyAdminCaller(req);
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext ?? ""))
      return NextResponse.json({ error: "Only .xlsx and .xls files are supported." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    if (rows.length === 0)
      return NextResponse.json({ error: "The spreadsheet is empty." }, { status: 400 });

    const headers = Object.keys(rows[0]);
    const resolver = buildResolver(headers);

    const now = new Date().toISOString();
    let updated = 0;
    let skipped = 0;
    const failed: { email: string; reason: string }[] = [];

    const db = admin.firestore();

    for (const row of rows) {
      const rawEmail = normStr(
        resolver.get(row, "email") ?? row["Email Address"] ?? row["Email"] ?? row["email"]
      );
      if (!rawEmail) { skipped++; continue; }
      const email = rawEmail.toLowerCase();

      const timeToFirstJob = normTimeToFirstJob(resolver.get(row, "timeToFirstJob"));
      const courseAligned  = normBoolOrUndef(resolver.get(row, "courseAligned"));
      // Derive isAbroad from explicit column first, then from company/locality address text
      let isAbroad         = normBoolOrUndef(resolver.get(row, "isAbroad"));
      if (isAbroad === undefined) {
        const companyAddr  = normStr(resolver.get(row, "companyAddress"));
        const loc          = normStr(resolver.get(row, "locality"));
        if (isAbroadAddress(companyAddr) || isAbroadAddress(loc)) isAbroad = true;
      }
      const jobAt1yr       = normStr(resolver.get(row, "jobAt1yr"));
      const jobAt2yr       = normStr(resolver.get(row, "jobAt2yr"));
      const jobAt5yr       = normStr(resolver.get(row, "jobAt5yr"));
      const jobAt8yr       = normStr(resolver.get(row, "jobAt8yr"));

      // Nothing to update from this row
      if (timeToFirstJob === undefined && courseAligned === undefined && isAbroad === undefined
          && !jobAt1yr && !jobAt2yr && !jobAt5yr && !jobAt8yr) { skipped++; continue; }

      try {
        // Find user by email in Firestore
        const snap = await db.collection("users")
          .where("email", "==", email)
          .where("role", "==", "alumni")
          .limit(1)
          .get();

        if (snap.empty) { skipped++; continue; }

        const updates: Record<string, unknown> = { updatedAt: now };
        if (timeToFirstJob !== undefined) updates.timeToFirstJob = timeToFirstJob;
        if (courseAligned !== undefined)  updates.courseAligned  = courseAligned;
        if (isAbroad !== undefined)       updates.isAbroad       = isAbroad;
        if (jobAt1yr)                    updates.jobAt1yr       = jobAt1yr;
        if (jobAt2yr)                    updates.jobAt2yr       = jobAt2yr;
        if (jobAt5yr)                    updates.jobAt5yr       = jobAt5yr;
        if (jobAt8yr)                    updates.jobAt8yr       = jobAt8yr;

        await snap.docs[0].ref.update(updates);
        updated++;
      } catch (err: unknown) {
        failed.push({ email, reason: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return NextResponse.json({
      updated,
      skipped,
      failed: failed.length,
      failedRows: failed,
      detectedColumns: resolver.detected,
    });
  } catch (err: unknown) {
    console.error("[/api/admin/enrich-alumni]", err);
    return NextResponse.json({ error: "Enrich failed. Please try again." }, { status: 500 });
  }
}
