export type SurveyType = "custom" | "google_form";
export type SurveyStatus = "draft" | "active" | "closed";
export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "rating"
  | "yes_no";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  type: SurveyType;
  status: SurveyStatus;
  googleFormUrl?: string;
  questions: SurveyQuestion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  uid: string;
  displayName: string;
  batchYear: number | null;
  course: string | null;
  answers: Record<string, string | string[]>;
  submittedAt: string;
  source?: "google_form";
}
