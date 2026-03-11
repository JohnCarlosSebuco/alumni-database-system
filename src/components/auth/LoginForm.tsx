"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Eye, EyeOff, Mail } from "lucide-react";
import { signIn, sendVerificationEmail } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { loginSchema, type LoginInput } from "@/lib/utils/validators";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const credential = await signIn(data.email, data.password);

      // Block access if email is not verified
      if (!credential.user.emailVerified) {
        // Resend the verification email in case it expired
        await sendVerificationEmail(credential.user, `${window.location.origin}/verify-email`).catch(() => {});
        router.replace("/verify-email");
        return;
      }

      const idToken = await credential.user.getIdToken();
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const sessionData = await sessionRes.json();
      const role = sessionData.role as string | undefined;
      const isAdminOrAbove = role === "admin" || role === "super_admin";
      const next = searchParams.get("next") ?? (isAdminOrAbove ? "/admin/dashboard" : "/dashboard");
      router.replace(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        toastError("Invalid email or password.");
      } else {
        toastError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        rightElement={
          <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <span />
        <Link href="/forgot-password" className="text-sm text-navy-800 hover:text-navy-600 font-medium">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-600">
        Not yet registered?{" "}
        <Link href="/signup" className="font-semibold text-navy-800 hover:text-navy-600">
          Create an account
        </Link>
      </p>

      <p className="text-center text-sm text-gray-600">
        Have a pre-created account?{" "}
        <Link href="/claim" className="font-semibold text-navy-800 hover:text-navy-600">
          Claim your account →
        </Link>
      </p>
    </form>
  );
}
