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
import type { EmploymentHistory, Education } from "@/lib/types/alumni.types";

export const dynamic = 'force-dynamic';

const STEPS = [
  "Personal Info",
  "Academic Background",
  "Current Employment",
  "Education & History",
  "Additional Info",
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

  useEffect(() => {
    if (profile) {
      setEducation(profile.education ?? []);
      setEmploymentHistory(profile.employmentHistory ?? []);
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
      form1.reset({ firstName, lastName: rest.join(" "), birthDate: "", gender: "", civilStatus: "", address: "", contactNumber: "" });
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
    }
  }, [userDoc]); // eslint-disable-line

  // Pre-fill form3 from existing profile
  useEffect(() => {
    if (profile?.currentEmployment) {
      form3.reset({
        isEmployed: profile.currentEmployment.isEmployed,
        employerName: profile.currentEmployment.employerName,
        position: profile.currentEmployment.position,
        industry: profile.currentEmployment.industry,
        employmentType: profile.currentEmployment.employmentType,
        startDate: profile.currentEmployment.startDate,
        city: profile.currentEmployment.city,
      });
    }
  }, [profile]); // eslint-disable-line

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
        licenses: profile?.licenses ?? [],
        awards: profile?.awards ?? [],
        research: profile?.research ?? [],
        communityExtension: profile?.communityExtension ?? [],
      }, { merge: true });

      await updateDoc(userDocRef(user.uid), {
        batchYear: d2.batchYear,
        department: d2.department,
        course: d2.course,
        displayName: `${d1.firstName} ${d1.lastName}`,
        profileComplete: 80,
        isEmployed: d3.isEmployed,
        updatedAt: new Date().toISOString(),
      });

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
                        <Input label="End Date" type="date" value={h.endDate} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, endDate: e.target.value } : h2))} />
                      </div>
                      <Textarea label="Key Responsibilities" rows={3} value={h.responsibilities} onChange={(e) => setEmploymentHistory((prev) => prev.map((h2) => h2.id === h.id ? { ...h2, responsibilities: e.target.value } : h2))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Review & Save */}
          {step === 4 && (
            <div className="space-y-4 text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Ready to save?</h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Review your information in the previous steps, then click Save Profile to update your AlumNayan profile.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="ghost"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Previous
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                Next
              </Button>
            ) : (
              <Button variant="secondary" loading={saving} onClick={handleSave}>
                Save Profile
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
