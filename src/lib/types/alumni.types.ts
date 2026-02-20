export type UserRole = "alumni" | "admin";

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
  batchYear: number | null;
  department: string | null;
  course: string | null;
  notifPrefs: { jobs: boolean; events: boolean };
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
