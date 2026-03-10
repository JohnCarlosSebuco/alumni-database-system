import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  studentId: z.string().optional(),
  email:     z.string().email("Enter a valid email address"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  batchYear: z.number().min(1980, "Enter a valid year").max(new Date().getFullYear(), "Enter a valid year"),
  department: z.string().min(1, "Department is required"),
  course:     z.string().min(1, "Course is required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Profile steps
export const step1Schema = z.object({
  firstName:    z.string().min(1, "Required"),
  lastName:     z.string().min(1, "Required"),
  birthDate:    z.string().min(1, "Required"),
  gender:       z.string().min(1, "Required"),
  civilStatus:  z.string().optional(),
  address:      z.string().min(1, "Required"),
  contactNumber: z.string().min(7, "Enter a valid contact number"),
});

export const step2Schema = z.object({
  batchYear:  z.number().min(1980).max(new Date().getFullYear()),
  department: z.string().min(1, "Required"),
  course:     z.string().min(1, "Required"),
});

export const step3Schema = z.object({
  isEmployed:     z.boolean(),
  employerName:   z.string().optional(),
  position:       z.string().optional(),
  industry:       z.string().optional(),
  employmentType: z.string().optional(),
  startDate:      z.string().optional(),
  city:           z.string().optional(),
});

export const jobFormSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  company:     z.string().min(1, "Company is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type:        z.string().min(1, "Job type is required"),
  industry:    z.string().min(1, "Industry is required"),
  location:    z.string().min(1, "Location is required"),
  isRemote:    z.boolean(),
  deadline:    z.string().min(1, "Deadline is required"),
  status:      z.enum(["draft", "active", "closed"]),
});

export const eventFormSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type:        z.string().min(1, "Event type is required"),
  startDate:   z.string().min(1, "Start date is required"),
  endDate:     z.string().min(1, "End date is required"),
  location:    z.string().min(1, "Location is required"),
  isVirtual:   z.boolean(),
  meetingLink: z.string().optional(),
  maxAttendees: z.number().nullable(),
  status:      z.enum(["draft", "published", "completed"]),
});

export const applySchema = z.object({
  coverNote: z.string().min(10, "Cover note must be at least 10 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type JobFormInput = z.infer<typeof jobFormSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;
export type ApplyInput = z.infer<typeof applySchema>;
