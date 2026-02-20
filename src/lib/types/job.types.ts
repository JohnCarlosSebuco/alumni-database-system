export type JobStatus = "draft" | "active" | "closed";
export type ApplicantStatus = "pending" | "reviewed" | "shortlisted" | "rejected";

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  type: string; // full-time, part-time, contract, internship
  industry: string;
  location: string;
  isRemote: boolean;
  deadline: string;
  status: JobStatus;
  applicantCount: number;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicant {
  userId: string;
  displayName: string;
  email: string;
  batchYear: number | null;
  appliedAt: string;
  resumeURL: string;
  coverNote: string;
  status: ApplicantStatus;
}
