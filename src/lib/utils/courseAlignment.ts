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
  recentGraduatePlacementRate: number; // alumni from last 2 batch years, % course-aligned employed
  midCareerAlignmentRate: number;       // alumni 3-5 years out, % course-aligned employed
  recentTotal: number;
  recentAligned: number;
  midCareerTotal: number;
  midCareerAligned: number;
}

export interface AlumniForOutcome {
  batchYear: number | null;
  course: string | null;
  isEmployed?: boolean;
  currentPosition?: string;
  // Explicit survey answer — preferred over keyword inference when present
  courseAligned?: boolean;
}

function isAligned(a: AlumniForOutcome): boolean {
  if (!a.isEmployed) return false;
  // Prefer the direct survey answer when available
  if (typeof a.courseAligned === "boolean") return a.courseAligned;
  // Fall back to keyword matching for alumni who answered before this field existed
  return isCourseAligned(a.currentPosition ?? "", a.course);
}

export function computeOutcomeRates(alumni: AlumniForOutcome[]): OutcomeRates {
  const currentYear = new Date().getFullYear();

  const recent = alumni.filter(
    (a) => a.batchYear != null && a.batchYear >= currentYear - 2
  );
  const midCareer = alumni.filter(
    (a) => a.batchYear != null && a.batchYear >= currentYear - 5 && a.batchYear <= currentYear - 3
  );

  const recentAligned    = recent.filter(isAligned).length;
  const midCareerAligned = midCareer.filter(isAligned).length;

  return {
    recentGraduatePlacementRate: recent.length > 0 ? Math.round((recentAligned / recent.length) * 100) : 0,
    midCareerAlignmentRate: midCareer.length > 0 ? Math.round((midCareerAligned / midCareer.length) * 100) : 0,
    recentTotal: recent.length,
    recentAligned,
    midCareerTotal: midCareer.length,
    midCareerAligned,
  };
}
