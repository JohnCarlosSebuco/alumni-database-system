export type UserRole = "alumni" | "admin" | "super_admin";

export interface UserDoc {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Alumni-only
  profileComplete: number; // 0-100
  isEmployed?: boolean;
  batchYear: number | null;
  department: string | null;
  course: string | null;
  notifPrefs: { jobs: boolean; events: boolean };
  studentId?: string;
  currentPosition?: string; // denormalized from profile for dashboard queries
  // Extended fields from import
  middleName?: string;
  sex?: string;
  birthday?: string;
  contactNumber?: string;
  civilStatus?: string;
  locality?: string;
  currentCompany?: string;
  honors?: string;
  employmentStatus?: string;
  // Course alignment — explicit answer from survey, overrides keyword inference
  courseAligned?: boolean;
  // Whether the alumni is currently working/residing abroad
  isAbroad?: boolean;
  // How long after graduation the alumni landed their first job — survey answer
  timeToFirstJob?: "lt3mo" | "3to6mo" | "7to12mo" | "gt1yr" | "not_yet";
  // Rich-text fields from survey
  companyAddress?: string;          // Company / Organization Address
  industryType?: string;            // Major line of business
  licensesRaw?: string;             // Free-text: licenses/certifications held
  researchRaw?: string;             // Free-text: research/innovation participation
  communityExtensionRaw?: string;   // Free-text: community extension participation
  // Employment at specific year intervals from graduation (parsed from survey free-text)
  jobAt1yr?: string;   // raw survey text for "JOB WITHIN 1 YEAR"
  jobAt2yr?: string;   // raw survey text for "JOB WITHIN 2 YEARS"
  jobAt5yr?: string;   // raw survey text for "JOB WITHIN 5 YEARS"
  jobAt8yr?: string;   // raw survey text for "JOB WITHIN 8 YEARS"
  // Import / claim tracking
  importedByAdmin?: boolean;
  isClaimed?: boolean;
  claimedAt?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  yearStarted: number;
  yearEnded: number | null;
  honors: string;
}

export interface CurrentEmployment {
  isEmployed: boolean;
  employerName: string;
  position: string;
  industry: string;
  employmentType: string;
  startDate: string;
  city: string;
}

export interface EmploymentHistory {
  id: string;
  employerName: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface License {
  id: string;
  name: string;
  issuingBody: string;
  licenseNumber: string;
  dateIssued: string;
  fileURL: string;
}

export interface Award {
  id: string;
  title: string;
  grantedBy: string;
  year: number;
  description: string;
}

export interface Research {
  id: string;
  title: string;
  coAuthors: string;
  publishedIn: string;
  year: number;
  doiOrLink: string;
}

export interface CommunityExtension {
  id: string;
  programName: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface AlumniProfile {
  // Personal Info
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  civilStatus?: string;
  address: string;
  contactNumber: string;
  // Arrays
  education: Education[];
  currentEmployment: CurrentEmployment;
  employmentHistory: EmploymentHistory[];
  licenses: License[];
  awards: Award[];
  research: Research[];
  communityExtension: CommunityExtension[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  courses: string[];
}
