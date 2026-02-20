import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Join AlumNayan</h1>
        <p className="mt-1 text-sm text-gray-600">Create your SLSU alumni account to get started</p>
      </div>
      <SignupForm />
    </div>
  );
}
