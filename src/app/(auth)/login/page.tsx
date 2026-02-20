import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-600">Sign in to your SLSU AlumNayan account</p>
      </div>
      <LoginForm />
    </div>
  );
}
