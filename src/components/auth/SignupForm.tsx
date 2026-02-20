"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { signUp } from "@/lib/firebase/auth";
import {
  db, setDoc, userDocRef, departmentsRef, getDocs, serverTimestamp,
} from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { signupSchema, type SignupInput } from "@/lib/utils/validators";
import type { Department } from "@/lib/types/alumni.types";

export function SignupForm() {
  const router = useRouter();
  const { error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const selectedDept = watch("department");

  useEffect(() => {
    getDocs(departmentsRef()).then((snap) => {
      setDepartments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Department)));
    });
  }, []);

  useEffect(() => {
    const dept = departments.find((d) => d.name === selectedDept);
    setCourses(dept?.courses ?? []);
    setValue("course", "");
  }, [selectedDept, departments, setValue]);

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    try {
      const { user } = await signUp(
        data.email,
        data.password,
        `${data.firstName} ${data.lastName}`
      );

      // Set alumni custom claim via API route
      const idToken = await user.getIdToken();
      await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, idToken }),
      });

      // Force-refresh token to include the new custom claim
      await user.getIdToken(true);

      // Write Firestore user doc
      await setDoc(userDocRef(user.uid), {
        uid: user.uid,
        email: data.email,
        role: "alumni",
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        profileComplete: 0,
        batchYear: data.batchYear,
        department: data.department,
        course: data.course,
        notifPrefs: { jobs: true, events: true },
      }, { merge: true });

      // Create session cookie with the refreshed token
      const freshToken = await user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: freshToken }),
      });

      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        toastError("An account with this email already exists.");
      } else {
        toastError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="Juan"
          leftIcon={<User size={16} />}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Last name"
          placeholder="dela Cruz"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Min 8 characters"
          rightElement={
            <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter password"
          rightElement={
            <button type="button" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <Select
        label="Batch Year"
        options={yearOptions}
        placeholder="Select year"
        error={errors.batchYear?.message}
        {...register("batchYear", { valueAsNumber: true })}
      />

      <Select
        label="College / Department"
        options={departments.map((d) => ({ value: d.name, label: d.name }))}
        placeholder="Select department"
        error={errors.department?.message}
        {...register("department")}
      />

      <Select
        label="Course / Program"
        options={courses.map((c) => ({ value: c, label: c }))}
        placeholder={selectedDept ? "Select course" : "Select department first"}
        disabled={!selectedDept}
        error={errors.course?.message}
        {...register("course")}
      />

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-navy-800 hover:text-navy-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
