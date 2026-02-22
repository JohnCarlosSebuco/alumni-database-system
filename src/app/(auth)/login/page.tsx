import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-gold-600 tracking-[0.22em] uppercase">
          Welcome back
        </p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Sign in to AlumNayan
        </h1>
        <p className="text-sm text-gray-500">
          Enter your credentials to access your alumni account.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
