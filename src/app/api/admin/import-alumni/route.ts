import { NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import crypto from "crypto";
import { calculateProfileComplete } from "@/lib/utils/profileComplete";
import { isAbroadAddress } from "@/lib/utils/courseAlignment";

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
  employmentStatus: [
    "if employed what is your present employment status",
    "employment status",
    "present employment status",
    "employment type",
  ],
  companyAddress: [
    "company   organization address",
    "company organization address",
    "company address",
    "organization address",
    "office address",
    "work address",
  ],
  industryType: [
    "major line of business of the company you are currently employed in",
    "major line of business",
    "line of business",
    "industry",
    "industry type",
    "business type",
  ],
  licensesRaw: [
    "do you have professional licenses or certifications",
    "professional licenses",
    "licenses or certifications",
    "licenses certifications",
    "certifications",
  ],
  researchRaw: [
    "have you participated in research innovations or major projects after graduation",
    "participated in research",
    "research innovations",
    "research or innovations",
    "research projects",
  ],
  communityExtensionRaw: [
    "have you participated in community extension outreach or volunteer programs",
    "participated in community extension",
    "community extension outreach",
    "community extension",
    "volunteer programs",
  ],
  awardsRaw: [
    "have you received any academic or professional awards recognition",
    "academic or professional awards",
    "awards recognition",
    "awards received",
  ],
  trainingRaw: [
    "have you attended professional training seminars",
    "professional training seminars",
    "training seminars",
    "professional training",
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
  licensesDetail: [
    "if yes please specify",
    "if yes  please specify",
    "specify licenses",
    "licenses details",
  ],
  researchDetail: [
    "if yes please specify  4",
    "if yes  please specify  4",
    "specify research",
    "research details",
  ],
  communityDetail: [
    "if yes please specify  5",
    "if yes  please specify  5",
    "specify community",
    "community details",
  ],
  trainingDetail: [
    "if yes please specify  2",
    "if yes  please specify  2",
    "specify training",
    "training details",
  ],
  awardsDetail: [
    "if yes please specify  3",
    "if yes  please specify  3",
    "specify awards",
    "awards details",
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

/** Combine a Yes/No flag column with its detail column into a single raw string. */
function buildRaw(yesNo: unknown, detail: unknown): string | null {
  const flag = normStr(yesNo);
  const det  = normStr(detail);
  if (!flag) return null;
  return det ? `${flag}: ${det}` : flag;
}

/** Extract meaningful detail text from a raw "Yes: <detail>" string. */
function extractDetail(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  const stripped = s.replace(/^(yes|no)\s*:\s*/i, "").trim();
  if (!stripped) return null;
  const lower = stripped.toLowerCase();
  if (["n/a", "na", "none", "yes", "no", ""].includes(lower)) return null;
  return stripped;
}

/** Parse degree string into { degree, fieldOfStudy }. */
function parseDegree(courseStr: string): { degree: string; fieldOfStudy: string } {
  const parts = courseStr.split(" in ");
  if (parts.length >= 2) {
    return { degree: parts[0].trim(), fieldOfStudy: parts.slice(1).join(" in ").trim() };
  }
  return { degree: courseStr.trim(), fieldOfStudy: "" };
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

    const { read, utils } = await import("xlsx");

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
    const updated: { email: string; uid: string }[] = [];
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

      // Check if user already exists — in both Auth AND Firestore
      let existingUid: string | null = null;
      let isOrphan = false;
      try {
        const existingUser = await admin.auth().getUserByEmail(email);
        const fsSnap = await admin.firestore().collection("users").doc(existingUser.uid).get();
        if (fsSnap.exists) {
          existingUid = existingUser.uid; // truly exists in both → skip
        } else {
          isOrphan = true;
          existingUid = existingUser.uid; // orphan: Auth exists but Firestore missing → repair
        }
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
      const employmentStatus    = normStr(resolver.get(row, "employmentStatus"));
      const companyAddress      = normStr(resolver.get(row, "companyAddress"));
      const industryType        = normStr(resolver.get(row, "industryType"));
      // Derive isAbroad from explicit column first, then from company/locality address text
      let isAbroad              = normBoolOrUndef(resolver.get(row, "isAbroad"));
      if (isAbroad === undefined && (isAbroadAddress(companyAddress) || isAbroadAddress(locality))) {
        isAbroad = true;
      }
      // Resolve detail columns via aliases, falling back to hardcoded headers
      const licensesRaw         = buildRaw(resolver.get(row, "licensesRaw"), resolver.get(row, "licensesDetail") ?? row["If YES, please specify:"]);
      const researchRaw         = buildRaw(resolver.get(row, "researchRaw"), resolver.get(row, "researchDetail") ?? row["If YES, please specify: 4"]);
      const communityExtensionRaw = buildRaw(resolver.get(row, "communityExtensionRaw"), resolver.get(row, "communityDetail") ?? row["If YES, please specify: 5"]);
      const awardsRaw         = buildRaw(resolver.get(row, "awardsRaw"), resolver.get(row, "awardsDetail") ?? row["If YES, please specify: 3"]);
      const trainingRaw       = buildRaw(resolver.get(row, "trainingRaw"), resolver.get(row, "trainingDetail") ?? row["If YES, please specify: 2"]);
      const jobAt1yr = normStr(resolver.get(row, "jobAt1yr"));
      const jobAt2yr = normStr(resolver.get(row, "jobAt2yr"));
      const jobAt5yr = normStr(resolver.get(row, "jobAt5yr"));
      const jobAt8yr = normStr(resolver.get(row, "jobAt8yr"));

      // Build structured profile arrays from raw survey data
      const educationArr: Record<string, unknown>[] = [];
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

      const licensesArr: Record<string, unknown>[] = [];
      const licDetail = extractDetail(licensesRaw);
      if (licDetail) licensesArr.push({ id: crypto.randomBytes(10).toString("hex"), name: licDetail, issuingBody: "", licenseNumber: "", dateIssued: "", fileURL: "" });

      const awardsArr: Record<string, unknown>[] = [];
      const awardDetail = extractDetail(awardsRaw);
      if (awardDetail) awardsArr.push({ id: crypto.randomBytes(10).toString("hex"), title: awardDetail, grantedBy: "", year: 0, description: "" });

      const researchArr: Record<string, unknown>[] = [];
      const researchDetail = extractDetail(researchRaw);
      if (researchDetail) researchArr.push({ id: crypto.randomBytes(10).toString("hex"), title: researchDetail, coAuthors: "", publishedIn: "", year: 0, doiOrLink: "" });

      const communityArr: Record<string, unknown>[] = [];
      const communityDetail = extractDetail(communityExtensionRaw);
      if (communityDetail) communityArr.push({ id: crypto.randomBytes(10).toString("hex"), programName: communityDetail, organization: "", role: "", startDate: "", endDate: "" });

      const trainingArr: Record<string, unknown>[] = [];
      const trainingDetail = extractDetail(trainingRaw);
      if (trainingDetail) trainingArr.push({ id: crypto.randomBytes(10).toString("hex"), title: trainingDetail, provider: "", dateCompleted: "", certificateURL: "", description: "" });

      try {
        if (existingUid && !isOrphan) {
          // Skip existing alumni — Import New mode only creates new records
          skipped.push({ email, reason: "Already exists" });
        } else {
          // ── CREATE new alumni or REPAIR orphan ──
          let uid: string;
          if (isOrphan) {
            // Reuse existing Auth UID, just create missing Firestore doc
            uid = existingUid!;
          } else {
            // Create new Auth user
            const tempPassword = crypto.randomBytes(32).toString("hex");
            const userRecord = await admin.auth().createUser({
              email,
              password: tempPassword,
              displayName,
              emailVerified: true,
            });

            uid = userRecord.uid;
            await admin.auth().setCustomUserClaims(uid, { role: "alumni" });
          }

          const userDoc: Record<string, unknown> = {
            uid,
            email,
            role: "alumni",
            displayName,
            photoURL: null,
            createdAt: isOrphan ? now : now, // keep original createdAt if orphan repair
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
          if (employmentStatus)            userDoc.employmentStatus = employmentStatus;
          if (companyAddress)              userDoc.companyAddress = companyAddress;
          if (industryType)                userDoc.industryType = industryType;
          if (licensesRaw)                 userDoc.licensesRaw = licensesRaw;
          if (researchRaw)                 userDoc.researchRaw = researchRaw;
          if (communityExtensionRaw)       userDoc.communityExtensionRaw = communityExtensionRaw;
          if (awardsRaw)                   userDoc.awardsRaw = awardsRaw;
          if (trainingRaw)                 userDoc.trainingRaw = trainingRaw;
          if (jobAt1yr)                    userDoc.jobAt1yr = jobAt1yr;
          if (jobAt2yr)                    userDoc.jobAt2yr = jobAt2yr;
          if (jobAt5yr)                    userDoc.jobAt5yr = jobAt5yr;
          if (jobAt8yr)                    userDoc.jobAt8yr = jobAt8yr;
          if (isAbroad !== undefined)      userDoc.isAbroad = isAbroad;

          userDoc.profileComplete = calculateProfileComplete({
            firstName, lastName, birthday, sex: sex ?? undefined,
            contactNumber: contactNumber ?? undefined,
            locality: locality ?? undefined,
            batchYear, course, department: "College of Engineering",
            isEmployed, currentCompany: currentCompany ?? undefined,
            currentPosition: currentPosition ?? undefined,
            licensesRaw: licensesRaw ?? undefined,
            researchRaw: researchRaw ?? undefined,
            communityExtensionRaw: communityExtensionRaw ?? undefined,
          });

          const cleanDoc = Object.fromEntries(
            Object.entries(userDoc).filter(([, v]) => v !== null)
          );

          try {
            await admin.firestore().collection("users").doc(uid).set(cleanDoc);

            await admin
              .firestore()
              .collection("users").doc(uid)
              .collection("profile").doc("data")
              .set({
                firstName, lastName,
                birthDate: birthday ?? "", gender: sex ?? "",
                civilStatus: civilStatus ?? "", contactNumber: contactNumber ?? "",
                address: locality ?? "",
                currentEmployment: {
                  isEmployed: isEmployed ?? false,
                  employerName: currentCompany ?? "", position: currentPosition ?? "",
                  industry: industryType ?? "", employmentType: employmentStatus ?? "",
                  startDate: "", city: companyAddress ?? "",
                },
                education: educationArr, employmentHistory: [],
                licenses: licensesArr, awards: awardsArr,
                research: researchArr, communityExtension: communityArr,
                training: trainingArr,
              });

            created.push({ email, uid });
          } catch (fsErr: unknown) {
            // Rollback: if we just created the Auth user but Firestore write failed, delete the Auth user
            if (!isOrphan) {
              await admin.auth().deleteUser(uid).catch(() => {});
            }
            throw fsErr;
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        failed.push({ email, reason: msg.includes("email-already-exists") ? "Already exists" : msg });
      }
    }

    return NextResponse.json({
      created: created.length,
      updated: updated.length,
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
