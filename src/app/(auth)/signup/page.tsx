import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-gold-600 tracking-[0.22em] uppercase">
          Get started free
        </p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Join AlumNayan
        </h1>
        <p className="text-sm text-gray-500">
          Create your SLSU CEN alumni account in under 2 minutes.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
