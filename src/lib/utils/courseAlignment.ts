const KEYWORDS: Record<string, string[]> = {
  "Bachelor of Science in Industrial Engineering": [
    "logistics", "supply chain", "production", "quality", "industrial", "manufacturing",
    "procurement", "process", "warehouse", "inventory", "lean", "six sigma",
    "safety officer", "planning", "operations", "plant manager", "ie", "erp",
  ],
  "Bachelor of Science in Electronics Engineering": [
    "telecom", "electronics", "semiconductor", "rf", "embedded", "network", "circuit",
    "pcb", "signal", "systems engineer", "technical support", "ict", "communication",
    "automation", "plc", "ece", "instrumentation", "avionics", "broadcast",
  ],
  "Bachelor of Science in Mechanical Engineering": [
    "mechanical", "maintenance", "hvac", "facilities", "equipment", "fabrication",
    "machining", "manufacturing engineer", "design engineer", "plant", "power",
    "bim", "piping", "structural", "thermal", "fluid", "tooling", "welding",
    "me", "reliability", "rotating equipment",
  ],
};

export function isCourseAligned(jobTitle: string, course: string | null): boolean {
  if (!jobTitle || !course) return false;
  const lower = jobTitle.toLowerCase();
  const keywords = KEYWORDS[course] ?? [];
  return keywords.some((kw) => lower.includes(kw));
}

export interface OutcomeRates {
  recentGraduatePlacementRate: number; // alumni 0-2 years out, % course-aligned employed
  midCareerAlignmentRate: number;       // alumni 3-5 years out, % course-aligned employed
  establishedCareerAlignmentRate: number; // alumni 6+ years out, % course-aligned employed
  recentTotal: number;
  recentAligned: number;
  midCareerTotal: number;
  midCareerAligned: number;
  establishedCareerTotal: number;
  establishedCareerAligned: number;
}

export interface AlumniForOutcome {
  batchYear: number | null;
  course: string | null;
  isEmployed?: boolean;
  currentPosition?: string;
  // Explicit survey answer — preferred over keyword inference when present
  courseAligned?: boolean;
  locality?: string;   // residence/work location text
  isAbroad?: boolean;  // explicit survey flag
  researchRaw?: string;            // "Yes: details" or "No"
  communityExtensionRaw?: string;  // "Yes: details" or "No"
  industryType?: string;           // Major line of business
}

function isAligned(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  // Prefer the direct survey answer when available
  if (typeof a.courseAligned === "boolean") return a.courseAligned;
  // Fall back to keyword matching for alumni who answered before this field existed
  return isCourseAligned(a.currentPosition ?? "", a.course);
}

export interface CohortRow {
  batchYear: number;
  evalYear: number;       // batchYear + 5 (5-year tracking cycle)
  yearsOut: number;       // currentYear - batchYear
  total: number;
  employed: number;
  employmentRate: number;
  aligned: number;
  alignmentRate: number;
}

export function computeCohortBreakdown(alumni: AlumniForOutcome[]): CohortRow[] {
  const currentYear = new Date().getFullYear();
  const map = new Map<number, { total: number; employed: number; aligned: number }>();

  for (const a of alumni) {
    if (!a.batchYear) continue;
    if (!map.has(a.batchYear)) map.set(a.batchYear, { total: 0, employed: 0, aligned: 0 });
    const row = map.get(a.batchYear)!;
    row.total++;
    if (a.isEmployed === true) row.employed++;
    if (isAligned(a)) row.aligned++;
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([batchYear, row]) => ({
      batchYear,
      evalYear: batchYear + 5,
      yearsOut: currentYear - batchYear,
      total: row.total,
      employed: row.employed,
      employmentRate: row.total > 0 ? Math.round((row.employed / row.total) * 100) : 0,
      aligned: row.aligned,
      alignmentRate: row.total > 0 ? Math.round((row.aligned / row.total) * 100) : 0,
    }));
}

export type WaitingTimeBucket = "lt3mo" | "3to6mo" | "7to12mo" | "gt1yr" | "not_yet";

export interface WaitingTimeRow {
  bucket:     WaitingTimeBucket;
  label:      string;
  count:      number;
  percentage: number;
  color:      string;
}

const WAITING_TIME_META: { bucket: WaitingTimeBucket; label: string; color: string }[] = [
  { bucket: "lt3mo",   label: "Less than 3 months", color: "#22c55e" },
  { bucket: "3to6mo",  label: "3–6 months",          color: "#14b8a6" },
  { bucket: "7to12mo", label: "7–12 months",          color: "#f59e0b" },
  { bucket: "gt1yr",   label: "More than a year",     color: "#ef4444" },
  { bucket: "not_yet", label: "Still unemployed",      color: "#94a3b8" },
];

export function computeWaitingTimeBreakdown(
  alumni: (AlumniForOutcome & { timeToFirstJob?: string })[]
): WaitingTimeRow[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const a of alumni) {
    if (!a.timeToFirstJob) continue;
    counts[a.timeToFirstJob] = (counts[a.timeToFirstJob] ?? 0) + 1;
    total++;
  }

  return WAITING_TIME_META.map(({ bucket, label, color }) => ({
    bucket,
    label,
    count:      counts[bucket] ?? 0,
    percentage: total > 0 ? Math.round(((counts[bucket] ?? 0) / total) * 100) : 0,
    color,
  }));
}

// ── College Goals / POE / GA ─────────────────────────────────────────────────

const LEADERSHIP_KEYWORDS = [
  "manager", "management", "supervisor", "superintendent", "director",
  "chief", "head of", "lead", "team lead", "team leader", "vp",
  "vice president", "president", "ceo", "cto", "cfo", "coo",
  "executive", "coordinator", "administrator", "principal",
  "dean", "department head", "section head", "officer in charge",
  "general manager", "assistant manager", "project manager",
  "operations manager", "branch manager", "area manager",
];

const RESEARCH_INDUSTRY_KEYWORDS = [
  "research", "r&d", "technology", "tech", "innovation", "it",
  "information technology", "software", "engineering", "biotech",
  "pharmaceutical", "semiconductor", "electronics", "telecommunications",
  "data", "analytics", "artificial intelligence", "ai", "machine learning",
  "robotics", "automation", "energy", "renewable", "startup",
];

function hasParticipation(raw?: string): boolean {
  if (!raw) return false;
  return raw.toLowerCase().startsWith("yes");
}

const GLOBAL_KEYWORDS = [
  "usa", "united states", "new york", "california", "canada", "australia",
  "singapore", "hong kong", "japan", "korea", "south korea", "uae", "dubai",
  "qatar", "saudi", "saudi arabia", "kuwait", "bahrain", "oman", "uk",
  "england", "london", "germany", "france", "italy", "spain", "netherlands",
  "switzerland", "new zealand", "malaysia", "taiwan", "china", "abroad",
  "overseas", "international", "expat",
];

const RESEARCH_KEYWORDS = [
  "research", "r&d", "researcher", "scientist", "innovation", "innovate",
  "laboratory", "lab technician", "development engineer", "technology",
  "technologist", "academic", "professor", "faculty", "lecturer",
  "instructor", "thesis", "publication", "patent", "data scientist",
  "data analyst", "process engineer", "quality engineer",
];

const COMMUNITY_KEYWORDS = [
  "community", "extension", "sustainability", "sustainable", "environmental",
  "conservation", "ngo", "non-government", "non government", "volunteer",
  "social worker", "social development", "outreach", "welfare", "public service",
  "government service", "barangay", "lgu", "deped", "doh", "dswd", "dole",
  "municipal", "provincial", "city hall", "resource management",
  "empowerment", "livelihood",
];

export function isGlobalContext(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  if (typeof a.isAbroad === "boolean") return a.isAbroad;
  const loc = (a.locality ?? "").toLowerCase();
  return GLOBAL_KEYWORDS.some((kw) => loc.includes(kw));
}

export function isResearchInnovation(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  if (hasParticipation(a.researchRaw)) return true;
  const pos = (a.currentPosition ?? "").toLowerCase();
  return RESEARCH_KEYWORDS.some((kw) => pos.includes(kw));
}

export function isCommunityExtension(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  if (hasParticipation(a.communityExtensionRaw)) return true;
  const pos = (a.currentPosition ?? "").toLowerCase();
  return COMMUNITY_KEYWORDS.some((kw) => pos.includes(kw));
}

export function isLeadershipManagement(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  const pos = (a.currentPosition ?? "").toLowerCase();
  return LEADERSHIP_KEYWORDS.some((kw) => pos.includes(kw));
}

export function isResearchIndustry(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  const ind = (a.industryType ?? "").toLowerCase();
  return RESEARCH_INDUSTRY_KEYWORDS.some((kw) => ind.includes(kw));
}

export function isPOE1(a: AlumniForOutcome): boolean {
  return isAligned(a) || isGlobalContext(a);
}

export function isPOE2(a: AlumniForOutcome): boolean {
  return isLeadershipManagement(a) || isCommunityExtension(a);
}

export function isPOE3(a: AlumniForOutcome): boolean {
  return isResearchInnovation(a) || isResearchIndustry(a);
}

export interface POEGAStats { count: number; percentage: number; }
export interface POEGAResult {
  poe1: POEGAStats;
  poe2: POEGAStats;
  poe3: POEGAStats;
  total: number;
}

export function computePOEStats(alumni: AlumniForOutcome[]): POEGAResult {
  const total = alumni.length;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const p1 = alumni.filter(isPOE1).length;
  const p2 = alumni.filter(isPOE2).length;
  const p3 = alumni.filter(isPOE3).length;
  return {
    poe1: { count: p1, percentage: pct(p1) },
    poe2: { count: p2, percentage: pct(p2) },
    poe3: { count: p3, percentage: pct(p3) },
    total,
  };
}

export const computeGAStats = computePOEStats;

export interface CollegeGoalStats { count: number; percentage: number; }
export interface CollegeGoalsResult {
  goal1: CollegeGoalStats;
  goal2: CollegeGoalStats;
  goal3: CollegeGoalStats;
  total: number;
}

export function computeCollegeGoals(alumni: AlumniForOutcome[]): CollegeGoalsResult {
  const total = alumni.length;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const g1 = alumni.filter(isGlobalContext).length;
  const g2 = alumni.filter(isResearchInnovation).length;
  const g3 = alumni.filter(isCommunityExtension).length;
  return {
    goal1: { count: g1, percentage: pct(g1) },
    goal2: { count: g2, percentage: pct(g2) },
    goal3: { count: g3, percentage: pct(g3) },
    total,
  };
}

// ──────────────────────────────────────────────────────────────────────────────

export function computeOutcomeRates(alumni: AlumniForOutcome[]): OutcomeRates {
  const currentYear = new Date().getFullYear();

  const recent = alumni.filter(
    (a) => a.batchYear != null && a.batchYear >= currentYear - 2
  );
  const midCareer = alumni.filter(
    (a) => a.batchYear != null && a.batchYear >= currentYear - 5 && a.batchYear <= currentYear - 3
  );
  const established = alumni.filter(
    (a) => a.batchYear != null && a.batchYear <= currentYear - 6
  );

  const recentAligned       = recent.filter(isAligned).length;
  const midCareerAligned    = midCareer.filter(isAligned).length;
  const establishedAligned  = established.filter(isAligned).length;

  return {
    recentGraduatePlacementRate: recent.length > 0 ? Math.round((recentAligned / recent.length) * 100) : 0,
    midCareerAlignmentRate: midCareer.length > 0 ? Math.round((midCareerAligned / midCareer.length) * 100) : 0,
    establishedCareerAlignmentRate: established.length > 0 ? Math.round((establishedAligned / established.length) * 100) : 0,
    recentTotal: recent.length,
    recentAligned,
    midCareerTotal: midCareer.length,
    midCareerAligned,
    establishedCareerTotal: established.length,
    establishedCareerAligned: establishedAligned,
  };
}
