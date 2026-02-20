"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Mail, CheckCircle } from "lucide-react";
import { resetPassword } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/utils/validators";

export function ForgotPasswordForm() {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      toastError("Failed to send reset email. Check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={28} className="text-green-600" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-600">
          We sent a password reset link to your email. It may take a few minutes to arrive.
        </p>
        <Link href="/login" className="block text-sm font-semibold text-navy-800 hover:text-navy-600">
          Back to Sign In
        </Link>
      </div>
    );
  }

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
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Send Reset Link
      </Button>
      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-navy-800 hover:text-navy-600">
          ← Back to Sign In
        </Link>
      </p>
    </form>
  );
}
