/**
 * surveySyncProfile.ts
 *
 * Infers alumni profile field updates from survey question-answer pairs.
 * Used both on survey submit (real-time) and for retroactive batch sync.
 *
 * Strategy: match the question label against keyword groups to decide which
 * UserDoc field the answer belongs to.  Only non-empty inferences are included
 * in the returned patch, so callers can safely spread it into updateDoc.
 */

import type { Survey } from "@/lib/types/survey.types";

// Same list used by courseAlignment.isGlobalContext
const ABROAD_KEYWORDS = [
  "usa", "united states", "new york", "california", "canada", "australia",
  "singapore", "hong kong", "japan", "korea", "south korea", "uae", "dubai",
  "qatar", "saudi", "saudi arabia", "kuwait", "bahrain", "oman", "uk",
  "england", "london", "germany", "france", "italy", "spain", "netherlands",
  "switzerland", "new zealand", "malaysia", "taiwan", "china", "abroad",
  "overseas", "international", "expat",
];

function hasAbroadKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ABROAD_KEYWORDS.some((kw) => lower.includes(kw));
}

function labelContains(label: string, ...terms: string[]): boolean {
  const lower = label.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

/** Returns true/false for yes/no style answers, null if not determinable. */
function parseYesNo(answer: string | string[]): boolean | null {
  const str = (Array.isArray(answer) ? answer[0] ?? "" : answer).toLowerCase().trim();
  if (["yes", "y", "true", "1"].includes(str)) return true;
  if (["no", "n", "false", "0"].includes(str)) return false;
  return null;
}

function toStr(answer: string | string[]): string {
  return (Array.isArray(answer) ? answer.join(", ") : answer).trim();
}

export interface ProfilePatch {
  isAbroad?: boolean;
  isEmployed?: boolean;
  currentPosition?: string;
  currentCompany?: string;
  courseAligned?: boolean;
  locality?: string;
  companyAddress?: string;
  industryType?: string;
  researchRaw?: string;
  communityExtensionRaw?: string;
}

/**
 * Given a survey definition and one alumni's answers, return only the profile
 * fields that can be inferred.  Returns {} when nothing can be inferred.
 */
export function inferProfilePatch(
  survey: Survey,
  answers: Record<string, string | string[]>
): ProfilePatch {
  const patch: ProfilePatch = {};

  for (const q of survey.questions) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null || raw === "") continue;
    const str = toStr(raw);
    if (!str) continue;
    const label = q.label;

    // ── Working Abroad ────────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "abroad", "overseas", "outside the country", "outside philippines",
        "working outside", "work outside", "international",
      )
    ) {
      const yn = parseYesNo(raw);
      if (yn !== null) {
        patch.isAbroad = yn;
      } else if (hasAbroadKeyword(str)) {
        patch.isAbroad = true;
      }
    }

    // ── Employment Status ─────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "employed", "employment status", "are you working",
        "currently working", "current employment", "present employment",
      )
    ) {
      const yn = parseYesNo(raw);
      if (yn !== null) {
        patch.isEmployed = yn;
      } else {
        const lower = str.toLowerCase();
        if (lower.includes("employed") && !lower.includes("unemployed")) patch.isEmployed = true;
        else if (lower.includes("unemployed") || lower.includes("not employed")) patch.isEmployed = false;
      }
    }

    // ── Current Position ──────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "position", "job title", "designation", "current job",
        "occupation", "your role", "current role",
      )
    ) {
      patch.currentPosition = str;
    }

    // ── Current Company ───────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "company", "employer", "organization", "workplace",
        "firm", "institution", "where do you work",
      )
    ) {
      patch.currentCompany = str;
    }

    // ── Course Alignment ──────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "aligned", "related to your course", "related to course",
        "course-related", "relevant to your degree", "course related",
      )
    ) {
      const yn = parseYesNo(raw);
      if (yn !== null) patch.courseAligned = yn;
    }

    // ── Locality / Work Location ──────────────────────────────────────────────
    if (
      labelContains(
        label,
        "locality", "city", "province", "residence",
        "where are you", "where do you live", "current location",
        "work location", "location of work",
      )
    ) {
      patch.locality = str;
      if (hasAbroadKeyword(str)) patch.isAbroad = true;
    }

    // ── Company Address ───────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "company address", "office address", "work address",
        "employer address", "business address",
      )
    ) {
      patch.companyAddress = str;
      if (hasAbroadKeyword(str)) patch.isAbroad = true;
    }

    // ── Industry ──────────────────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "industry", "line of business", "sector",
        "field of work", "nature of work", "type of business",
      )
    ) {
      patch.industryType = str;
    }

    // ── Research / Innovation ─────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "research", "innovation", "publication", "paper",
      )
    ) {
      patch.researchRaw = str;
    }

    // ── Community Extension ───────────────────────────────────────────────────
    if (
      labelContains(
        label,
        "community", "extension", "outreach", "volunteer",
      )
    ) {
      patch.communityExtensionRaw = str;
    }
  }

  return patch;
}
