/**
 * Calculate profile completion percentage (0–100) based on filled fields.
 *
 * Works with either a Firestore UserDoc + optional AlumniProfile,
 * or a plain object from the import pipeline.
 */

interface ProfileData {
  // From UserDoc
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  birthday?: string | null;
  sex?: string | null;
  contactNumber?: string | null;
  locality?: string | null;
  batchYear?: number | null;
  course?: string | null;
  department?: string | null;
  isEmployed?: boolean | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  licensesRaw?: string | null;
  researchRaw?: string | null;
  communityExtensionRaw?: string | null;
  // From AlumniProfile (structured data)
  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;
  licenses?: { id: string }[];
  research?: { id: string }[];
  communityExtension?: { id: string }[];
  currentEmployment?: { isEmployed?: boolean; employerName?: string; position?: string };
}

export function calculateProfileComplete(data: ProfileData): number {
  let score = 0;

  // firstName (10) — check profile field or derive from displayName
  const firstName = data.firstName || data.displayName?.split(" ")[0];
  if (firstName) score += 10;

  // lastName (10)
  const lastName = data.lastName || (data.displayName?.split(" ").slice(1).join(" "));
  if (lastName) score += 10;

  // birthDate (5)
  if (data.birthDate || data.birthday) score += 5;

  // gender (5)
  if (data.gender || data.sex) score += 5;

  // contactNumber (5)
  if (data.contactNumber) score += 5;

  // address (5)
  if (data.address || data.locality) score += 5;

  // batchYear (10)
  if (data.batchYear) score += 10;

  // course (5)
  if (data.course) score += 5;

  // department (5)
  if (data.department) score += 5;

  // Employment info (15) — isEmployed is set + employer/position if employed
  const employed = data.currentEmployment?.isEmployed ?? data.isEmployed;
  if (employed !== undefined && employed !== null) {
    if (employed) {
      const hasEmployer = data.currentEmployment?.employerName || data.currentCompany;
      const hasPosition = data.currentEmployment?.position || data.currentPosition;
      if (hasEmployer && hasPosition) score += 15;
      else if (hasEmployer || hasPosition) score += 10;
      else score += 5;
    } else {
      // Not employed but answered the question
      score += 15;
    }
  }

  // Licenses (10)
  const hasLicenses = (data.licenses && data.licenses.length > 0) ||
    (data.licensesRaw && data.licensesRaw.toLowerCase().startsWith("yes"));
  if (hasLicenses) score += 10;

  // Research (10)
  const hasResearch = (data.research && data.research.length > 0) ||
    (data.researchRaw && data.researchRaw.toLowerCase().startsWith("yes"));
  if (hasResearch) score += 10;

  // Community Extension (5)
  const hasCommunity = (data.communityExtension && data.communityExtension.length > 0) ||
    (data.communityExtensionRaw && data.communityExtensionRaw.toLowerCase().startsWith("yes"));
  if (hasCommunity) score += 5;

  return Math.min(score, 100);
}
