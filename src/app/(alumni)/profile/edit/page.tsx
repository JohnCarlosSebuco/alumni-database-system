"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { nanoid } from "nanoid";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  db, setDoc, updateDoc, profileDocRef, userDocRef,
} from "@/lib/firebase/firestore";
import { uploadProfilePhoto } from "@/lib/cloudinary/upload";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { PageLoader } from "@/components/ui/Spinner";
import { step1Schema, step2Schema, step3Schema, type Step1Input, type Step2Input, type Step3Input } from "@/lib/utils/validators";
import { ChevronRight, ChevronLeft, Camera, Plus, Trash2 } from "lucide-react";
import type { EmploymentHistory, Education, License, Award, Research, CommunityExtension, Training } from "@/lib/types/alumni.types";
import { calculateProfileComplete } from "@/lib/utils/profileComplete";
import { SurveyDataBanner } from "@/components/profile/SurveyDataBanner";

export const dynamic = 'force-dynamic';

const STEPS = [
  "Personal Info",
  "Academic Background",
  "Current Employment",
  "Education, Training & History",
  "Licenses & Certs",
  "Awards & Recognition",
  "Research & Projects",
  "Community Extension",
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
            i < current ? "bg-green-500 text-white" :
            i === current ? "bg-navy-800 text-white" :
            "bg-gray-200 text-gray-500"
          }`}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-1 rounded-full transition-colors ${i < current ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, userDoc } = useAuth();
  const { profile, loading } = useProfile();
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<EmploymentHistory[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [communityExtension, setCommunityExtension] = useState<CommunityExtension[]>([]);
  const [training, setTraining] = useState<Training[]>([]);
  const [timeToFirstJob, setTimeToFirstJob] = useState<string>("");
  const [courseAligned, setCourseAligned] = useState<boolean | undefined>(undefined);
  const [isAbroad, setIsAbroad] = useState<boolean | undefined>(undefined);

  // Read initial step from URL ?step= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("step");
    if (p !== null) {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n >= 0 && n < STEPS.length) setStep(n);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (profile) {
      setEducation(profile.education ?? []);
      setEmploymentHistory(profile.employmentHistory ?? []);
      setLicenses(profile.licenses ?? []);
      setAwards(profile.awards ?? []);
      setResearch(profile.research ?? []);
      setCommunityExtension(profile.communityExtension ?? []);
      setTraining(profile.training ?? []);
    }
  }, [profile]);

  const form1 = useForm<Step1Input>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Input>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Input>({ resolver: zodResolver(step3Schema), defaultValues: { isEmployed: false } });

  // Pre-fill form1 from existing profile, or from signup name if no profile yet
  useEffect(() => {
    if (profile) {
      form1.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,
        gender: profile.gender,
        civilStatus: profile.civilStatus ?? "",
        address: profile.address,
        contactNumber: profile.contactNumber,
      });
    } else if (!loading && userDoc) {
      const [firstName = "", ...rest] = (userDoc.displayName ?? "").split(" ");
      form1.reset({
        firstName,
        lastName:      rest.join(" "),
        birthDate:     userDoc.birthday      ?? "",
        gender:        userDoc.sex           ?? "",
        civilStatus:   userDoc.civilStatus   ?? "",
        contactNumber: userDoc.contactNumber ?? "",
        address:       userDoc.locality      ?? "",
      });
    }
  }, [profile, userDoc, loading]); // eslint-disable-line

  // Pre-fill form2 from signup data (batch year, department, course)
  useEffect(() => {
    if (userDoc) {
      form2.reset({
        batchYear: userDoc.batchYear ?? undefined,
        department: userDoc.department ?? "",
        course: userDoc.course ?? "",
      });
      setTimeToFirstJob(userDoc.timeToFirstJob ?? "");
      if (userDoc.courseAligned !== undefined) setCourseAligned(userDoc.courseAligned);
      if (userDoc.isAbroad !== undefined) setIsAbroad(userDoc.isAbroad);
    }
  }, [userDoc]); // eslint-disable-line

  // Pre-fill form3 from existing profile, or from userDoc for imported alumni with no profile
  useEffect(() => {
    if (profile?.currentEmployment) {
      form3.reset({
        isEmployed:     profile.currentEmployment.isEmployed,
        employerName:   profile.currentEmployment.employerName,
        position:       profile.currentEmployment.position,
        industry:       profile.currentEmployment.industry,
        employmentType: profile.currentEmployment.employmentType,
        startDate:      profile.currentEmployment.startDate,
        city:           profile.currentEmployment.city,
      });
    } else if (!loading && !profile && userDoc) {
      form3.reset({
        isEmployed:     userDoc.isEmployed      ?? false,
        employerName:   userDoc.currentCompany  ?? "",
        position:       userDoc.currentPosition ?? "",
        industry:       "",
        employmentType: "",
        startDate:      "",
        city:           "",
      });
    }
  }, [profile, loading, userDoc]); // eslint-disable-line

  if (loading || !user || !userDoc) return <PageLoader />;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const d1 = form1.getValues();
      const d2 = form2.getValues();
      const d3 = form3.getValues();

      let photoURL = userDoc.photoURL;
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
        await updateDoc(userDocRef(user.uid), { photoURL, updatedAt: new Date().toISOString() });
      }

      await setDoc(profileDocRef(user.uid), {
        ...d1,
        currentEmployment: d3,
        education,
        employmentHistory,
        licenses,
        awards,
        research,
        communityExtension,
        training,
      }, { merge: true });

      // Compute jobAt1yr/2yr/5yr/8yr from employment history alignment answers
      const jobAtUpdates: Record<string, string | null> = {};
      if (d2.batchYear) {
        for (const [field, offset] of [["jobAt1yr", 1], ["jobAt2yr", 2], ["jobAt5yr", 5], ["jobAt8yr", 8]] as [string, number][]) {
          const cutoff = d2.batchYear + offset;
          const jobsInWindow = employmentHistory.filter((h) => {
            if (!h.startDate) return false;
            const startYear = new Date(h.startDate).getFullYear();
            if (startYear > cutoff) return false;
            if (h.endDate) {
              const endYear = new Date(h.endDate).getFullYear();
              if (endYear < cutoff) return false;
            }
            return true;
          });
          if (jobsInWindow.length > 0) {
            jobAtUpdates[field] = jobsInWindow.some((j) => j.isCourseAligned === true) ? "Yes" : "No";
          } else {
            jobAtUpdates[field] = null; // Explicitly clear if no jobs in this interval
          }
        }
      }

      const userUpdates: Record<string, unknown> = {
        batchYear: d2.batchYear,
        department: d2.department,
        course: d2.course,
        displayName: `${d1.firstName} ${d1.lastName}`,
        profileComplete: calculateProfileComplete({
          firstName: d1.firstName, lastName: d1.lastName,
          birthDate: d1.birthDate, gender: d1.gender,
          contactNumber: d1.contactNumber, address: d1.address,
          batchYear: d2.batchYear, course: d2.course, department: d2.department,
          isEmployed: d3.isEmployed,
          currentEmployment: d3,
          licenses, research, communityExtension,
          licensesRaw: userDoc.licensesRaw,
          researchRaw: userDoc.researchRaw,
          communityExtensionRaw: userDoc.communityExtensionRaw,
        }),
        isEmployed: d3.isEmployed,
        currentPosition: d3.isEmployed ? (d3.position ?? "") : "",
        updatedAt: new Date().toISOString(),
        ...jobAtUpdates,
      };
      if (timeToFirstJob) userUpdates.timeToFirstJob = timeToFirstJob;
      if (courseAligned !== undefined) userUpdates.courseAligned = courseAligned;
      if (isAbroad !== undefined) userUpdates.isAbroad = isAbroad;
      await updateDoc(userDocRef(user.uid), userUpdates);

      success("Profile saved successfully!");
      router.push("/profile");
    } catch {
      toastError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => setEducation((prev) => [...prev, {
    id: nanoid(), institution: "", degree: "", fieldOfStudy: "", yearStarted: new Date().getFullYear(), yearEnded: null, honors: "",
  }]);

  const removeEducation = (id: string) => setEducation((prev) => prev.filter((e) => e.id !== id));

  const addHistory = () => setEmploymentHistory((prev) => [...prev, {
    id: nanoid(), employerName: "", position: "", startDate: "", endDate: "", responsibilities: "",
  }]);

  const removeHistory = (id: string) => setEmploymentHistory((prev) => prev.filter((h) => h.id !== id));

  const addLicense = () => setLicenses((prev) => [...prev, {
    id: nanoid(), name: "", issuingBody: "", licenseNumber: "", dateIssued: "", fileURL: "",
  }]);
  const removeLicense = (id: string) => setLicenses((prev) => prev.filter((l) => l.id !== id));

  const addAward = () => setAwards((prev) => [...prev, {
    id: nanoid(), title: "", grantedBy: "", year: new Date().getFullYear(), description: "",
  }]);
  const removeAward = (id: string) => setAwards((prev) => prev.filter((a) => a.id !== id));

  const addResearch = () => setResearch((prev) => [...prev, {
    id: nanoid(), title: "", coAuthors: "", publishedIn: "", year: new Date().getFullYear(), doiOrLink: "",
  }]);
  const removeResearch = (id: string) => setResearch((prev) => prev.filter((r) => r.id !== id));

  const addCommunity = () => setCommunityExtension((prev) => [...prev, {
    id: nanoid(), programName: "", organization: "", role: "", startDate: "", endDate: "",
  }]);
  const removeCommunity = (id: string) => setCommunityExtension((prev) => prev.filter((c) => c.id !== id));

  const addTraining = () => setTraining((prev) => [...prev, {
    id: nanoid(), title: "", provider: "", dateCompleted: "", certificateURL: "", description: "",
  }]);
  const removeTraining = (id: string) => setTraining((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Profile"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "/profile" },
          { label: "Edit" },
        ]}
      />

      <Card>
        <CardBody>
          <StepIndicator current={step} total={STEPS.length} />
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{STEPS[step]}</h2>

          {/* Step 0 — Personal Info */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Photo upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar src={photoPreview ?? userDoc.photoURL} name={userDoc.displayName} size="lg" />
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-700 transition-colors">
                    <Camera size={12} />
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 5 MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" error={form1.formState.errors.firstName?.message} {...form1.register("firstName")} />
                <Input label="Last Name" error={form1.formState.errors.lastName?.message} {...form1.register("lastName")} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" type="date" error={form1.formState.errors.birthDate?.message} {...form1.register("birthDate")} />
                <Select label="Gender" options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" },
                ]} value={form1.watch("gender") ?? ""} error={form1.formState.errors.gender?.message} {...form1.register("gender")} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Civil Status" options={[
                  { value: "", label: "Select civil status" },
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                  { value: "Widowed", label: "Widowed" },
                  { value: "Separated", label: "Separated" },
                ]} value={form1.watch("civilStatus") ?? ""} error={form1.formState.errors.civilStatus?.message} {...form1.register("civilStatus")} />
                <Input label="Contact Number" placeholder="+63 9xx xxx xxxx" error={form1.formState.errors.contactNumber?.message} {...form1.register("contactNumber")} />
              </div>
              <Textarea label="Complete Address" rows={2} error={form1.formState.errors.address?.message} {...form1.register("address")} />
              {userDoc.studentId && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Student / Alumni ID No.</label>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 h-[38px]">
                    {userDoc.studentId}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Academic Background */}
          {step === 1 && (
            <div className="space-y-4">
              <Select label="Batch Year" options={
                Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return { value: String(y), label: String(y) };
                })
              } value={String(form2.watch("batchYear") ?? "")} error={form2.formState.errors.batchYear?.message} {...form2.register("batchYear", { valueAsNumber: true })} />
              <Input label="College / Department" error={form2.formState.errors.department?.message} {...form2.register("department")} />
              <Input label="Course / Program" error={form2.formState.errors.course?.message} {...form2.register("course")} />
            </div>
          )}

          {/* Step 2 — Current Employment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isEmployed" className="h-4 w-4 rounded border-gray-300 text-navy-800" {...form3.register("isEmployed")} />
                <label htmlFor="isEmployed" className="text-sm font-medium text-gray-700">Currently Employed</label>
              </div>
              {form3.watch("isEmployed") && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Employer Name" {...form3.register("employerName")} />
                  <Input label="Position / Title" {...form3.register("position")} />
                  <Input label="Industry" {...form3.register("industry")} />
                  <Select label="Employment Type" options={[
                    { value: "Full-time", label: "Full-time" },
                    { value: "Part-time", label: "Part-time" },
                    { value: "Contract", label: "Contract" },
                    { value: "Freelance", label: "Freelance" },
                    { value: "Self-employed", label: "Self-employed" },
                  ]} value={form3.watch("employmentType") ?? ""} {...form3.register("employmentType")} />
                  <Input label="Start Date" type="date" {...form3.register("startDate")} />
                  <Input label="City" {...form3.register("city")} />
                </div>
              )}
              <Select
                label="Time to First Job After Graduation"
                options={[
                  { value: "",        label: "Select..." },
                  { value: "lt3mo",   label: "Less than 3 months" },
                  { value: "3to6mo",  label: "3–6 months" },
                  { value: "7to12mo", label: "7–12 months" },
                  { value: "gt1yr",   label: "More than a year" },
                  { value: "not_yet", label: "Still unemployed" },
                ]}
                value={timeToFirstJob}
                onChange={(e) => setTimeToFirstJob(e.target.value)}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Is your first/current job related to your course?</label>
                <div className="flex flex-wrap gap-4">
                  {([["yes", true, "Yes"], ["no", false, "No"], ["na", undefined, "Not sure / N/A"]] as [string, boolean | undefined, string][]).map(([val, bool, lbl]) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="courseAligned"
                        className="h-4 w-4 text-navy-800"
                        checked={courseAligned === bool}
                        onChange={() => setCourseAligned(bool)}
                      />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAbroad"
                  className="h-4 w-4 rounded border-gray-300 text-navy-800"
                  checked={isAbroad ?? false}
                  onChange={(e) => setIsAbroad(e.target.checked || undefined)}
                />
                <label htmlFor="isAbroad" className="text-sm font-medium text-gray-700">Currently working abroad</label>
              </div>
            </div>
          )}

          {/* Step 3 — Education & History */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Education</h3>
                  <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addEducation}>Add</Button>
                </div>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={edu.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Education #{idx + 1}</span>
                        <button onClick={() => removeEducation(edu.id)} className="text-error hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input label="Institution" value={edu.institution} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, institution: e.target.value } : e2))} />
                        <Input label="Degree" value={edu.degree} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, degree: e.target.value } : e2))} />
                        <Input label="Field of Study" value={edu.fieldOfStudy} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, fieldOfStudy: e.target.value } : e2))} />
                        <Input label="Honors / Awards" value={edu.honors} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, honors: e.target.value } : e2))} />
                        <Input label="Year Started" type="number" value={edu.yearStarted} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, yearStarted: Number(e.target.value) } : e2))} />
                        <Input label="Year Ended" type="number" placeholder="Leave blank if ongoing" value={edu.yearEnded ?? ""} onChange={(e) => setEducation((prev) => prev.map((e2) => e2.id === edu.id ? { ...e2, yearEnded: e.target.value ? Number(e.target.value) : null } : e2))} />
                      </div>
                    </div>
                  ))}
                  {education.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No education records. Click Add to create one.</p>
                  )}
                </div>
              </div>

              <div>
                {userDoc.trainingRaw && <SurveyDataBanner label="Professional Training & Seminars" rawText={userDoc.trainingRaw} />}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Training & Seminars</h3>
                  <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addTraining}>Add</Button>
                </div>
                <div className="space-y-4">
                  {training.map((t, idx) => (
                    <div key={t.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Training #{idx + 1}</span>
                        <button onClick={() => removeTraining(t.id)} className="text-error hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input label="Title" value={t.title} onChange={(e) => setTraining((prev) => prev.map((x) => x.id === t.id ? { ...x, title: e.target.value } : x))} className="sm:col-span-2" />
                        <Input label="Provider" value={t.provider} onChange={(e) => setTraining((prev) => prev.map((x) => x.id === t.id ? { ...x, provider: e.target.value } : x))} />
                        <Input label="Date Completed" type="date" value={t.dateCompleted} onChange={(e) => setTraining((prev) => prev.map((x) => x.id === t.id ? { ...x, dateCompleted: e.target.value } : x))} />
                      </div>
                      <Textarea label="Description" rows={2} value={t.description} onChange={(e) => setTraining((prev) => prev.map((x) => x.id === t.id ? { ...x, description: e.target.value } : x))} />
                    </div>
                  ))}
                  {training.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No training entries yet. Click Add to create one.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Employment History</h3>
                  <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addHistory}>Add</Button>
                </div>
                <div className="space-y-4">
                  {employmentHistory.map((h, idx) => (
                    <div key={h.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Job #{idx + 1}</span>
                        <button onClick={() => removeHistory(h.id)} className="text-error hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input label="Employer" value={h.employerName} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, employerName: e.target.value } : h2))} />
                        <Input label="Position" value={h.position} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, position: e.target.value } : h2))} />
                        <Input label="Start Date" type="date" value={h.startDate} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, startDate: e.target.value } : h2))} />
                        <Input label="End Date" type="date" placeholder="Leave blank if current" value={h.endDate} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, endDate: e.target.value } : h2))} />
                      </div>
                      <Textarea label="Key Responsibilities" rows={3} value={h.responsibilities} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, responsibilities: e.target.value } : h2))} />
                      <div className="space-y-1 pt-1 border-t border-gray-100">
                        <label className="text-sm font-medium text-gray-700">Is this job related to your course?</label>
                        <div className="flex flex-wrap gap-4">
                          {([["yes", true, "Yes"], ["no", false, "No"], ["na", undefined, "Not sure"]] as [string, boolean | undefined, string][]).map(([val, bool, lbl]) => (
                            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name={`aligned-${h.id}`}
                                className="h-4 w-4 text-navy-800"
                                checked={h.isCourseAligned === bool}
                                onChange={() => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, isCourseAligned: bool } : h2))}
                              />
                              {lbl}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`abroad-${h.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-navy-800"
                          checked={h.isAbroad ?? false}
                          onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, isAbroad: e.target.checked || undefined } : h2))}
                        />
                        <label htmlFor={`abroad-${h.id}`} className="text-sm text-gray-700">This job was/is abroad</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Licenses & Certifications */}
          {step === 4 && (
            <div className="space-y-6">
              {userDoc.licensesRaw && <SurveyDataBanner label="Licenses & Certifications" rawText={userDoc.licensesRaw} />}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Licenses & Certifications</h3>
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addLicense}>Add</Button>
              </div>
              <div className="space-y-4">
                {licenses.map((l, idx) => (
                  <div key={l.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">License #{idx + 1}</span>
                      <button onClick={() => removeLicense(l.id)} className="text-error hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input label="License / Certification Name" value={l.name} onChange={(e) => setLicenses((prev) => prev.map((x) => x.id === l.id ? { ...x, name: e.target.value } : x))} />
                      <Input label="Issuing Body" value={l.issuingBody} onChange={(e) => setLicenses((prev) => prev.map((x) => x.id === l.id ? { ...x, issuingBody: e.target.value } : x))} />
                      <Input label="License Number" value={l.licenseNumber} onChange={(e) => setLicenses((prev) => prev.map((x) => x.id === l.id ? { ...x, licenseNumber: e.target.value } : x))} />
                      <Input label="Date Issued" type="date" value={l.dateIssued} onChange={(e) => setLicenses((prev) => prev.map((x) => x.id === l.id ? { ...x, dateIssued: e.target.value } : x))} />
                    </div>
                  </div>
                ))}
                {licenses.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No licenses yet. Click Add to create one.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5 — Awards & Recognition */}
          {step === 5 && (
            <div className="space-y-6">
              {userDoc.awardsRaw && <SurveyDataBanner label="Awards & Recognition" rawText={userDoc.awardsRaw} />}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Awards & Recognition</h3>
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addAward}>Add</Button>
              </div>
              <div className="space-y-4">
                {awards.map((a, idx) => (
                  <div key={a.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Award #{idx + 1}</span>
                      <button onClick={() => removeAward(a.id)} className="text-error hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input label="Award Title" value={a.title} onChange={(e) => setAwards((prev) => prev.map((x) => x.id === a.id ? { ...x, title: e.target.value } : x))} />
                      <Input label="Granted By" value={a.grantedBy} onChange={(e) => setAwards((prev) => prev.map((x) => x.id === a.id ? { ...x, grantedBy: e.target.value } : x))} />
                      <Input label="Year" type="number" value={a.year} onChange={(e) => setAwards((prev) => prev.map((x) => x.id === a.id ? { ...x, year: Number(e.target.value) } : x))} />
                    </div>
                    <Textarea label="Description" rows={2} value={a.description} onChange={(e) => setAwards((prev) => prev.map((x) => x.id === a.id ? { ...x, description: e.target.value } : x))} />
                  </div>
                ))}
                {awards.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No awards yet. Click Add to create one.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6 — Research & Projects */}
          {step === 6 && (
            <div className="space-y-6">
              {userDoc.researchRaw && <SurveyDataBanner label="Research & Innovation" rawText={userDoc.researchRaw} />}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Research & Projects</h3>
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addResearch}>Add</Button>
              </div>
              <div className="space-y-4">
                {research.map((r, idx) => (
                  <div key={r.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Research #{idx + 1}</span>
                      <button onClick={() => removeResearch(r.id)} className="text-error hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input label="Title" value={r.title} onChange={(e) => setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, title: e.target.value } : x))} className="sm:col-span-2" />
                      <Input label="Co-Authors" value={r.coAuthors} onChange={(e) => setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, coAuthors: e.target.value } : x))} />
                      <Input label="Published In" value={r.publishedIn} onChange={(e) => setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, publishedIn: e.target.value } : x))} />
                      <Input label="Year" type="number" value={r.year} onChange={(e) => setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, year: Number(e.target.value) } : x))} />
                      <Input label="DOI / Link" value={r.doiOrLink} onChange={(e) => setResearch((prev) => prev.map((x) => x.id === r.id ? { ...x, doiOrLink: e.target.value } : x))} />
                    </div>
                  </div>
                ))}
                {research.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No research entries yet. Click Add to create one.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 7 — Community Extension */}
          {step === 7 && (
            <div className="space-y-6">
              {userDoc.communityExtensionRaw && <SurveyDataBanner label="Community Extension" rawText={userDoc.communityExtensionRaw} />}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Community Extension</h3>
                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={addCommunity}>Add</Button>
              </div>
              <div className="space-y-4">
                {communityExtension.map((c, idx) => (
                  <div key={c.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Activity #{idx + 1}</span>
                      <button onClick={() => removeCommunity(c.id)} className="text-error hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input label="Program Name" value={c.programName} onChange={(e) => setCommunityExtension((prev) => prev.map((x) => x.id === c.id ? { ...x, programName: e.target.value } : x))} />
                      <Input label="Organization" value={c.organization} onChange={(e) => setCommunityExtension((prev) => prev.map((x) => x.id === c.id ? { ...x, organization: e.target.value } : x))} />
                      <Input label="Your Role" value={c.role} onChange={(e) => setCommunityExtension((prev) => prev.map((x) => x.id === c.id ? { ...x, role: e.target.value } : x))} />
                      <div />
                      <Input label="Start Date" type="date" value={c.startDate} onChange={(e) => setCommunityExtension((prev) => prev.map((x) => x.id === c.id ? { ...x, startDate: e.target.value } : x))} />
                      <Input label="End Date" type="date" value={c.endDate} onChange={(e) => setCommunityExtension((prev) => prev.map((x) => x.id === c.id ? { ...x, endDate: e.target.value } : x))} />
                    </div>
                  </div>
                ))}
                {communityExtension.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No community extension activities yet. Click Add to create one.</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Previous
              </Button>
              <a href="/profile" className="text-sm text-navy-700 hover:text-navy-900 underline">
                Back to Profile
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" loading={saving} onClick={handleSave}>
                Save
              </Button>
              {step < STEPS.length - 1 && (
                <Button
                  variant="primary"
                  rightIcon={<ChevronRight size={16} />}
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
