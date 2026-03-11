"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import { claimSignIn } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface AccountInfo {
  displayName: string | null;
  course: string | null;
  batchYear: number | null;
}

export default function ClaimPage() {
  const router = useRouter();
  const { error: toastError } = useToast();

  const [step, setStep] = useState<"lookup" | "setPassword">("lookup");
  const [surname, setSurname] = useState("");
  const [email, setEmail]     = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1 — look up account by surname + student ID
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surname: surname.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error ?? "No account found. Check your surname and ID.");
        return;
      }
      setAccountInfo(data);
      setStep("setPassword");
    } catch {
      toastError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — set password and sign in
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toastError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/claim/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surname: surname.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error ?? "Failed to set password. Please try again.");
        return;
      }
      const { customToken } = data;
      const userCred = await claimSignIn(customToken);
      const idToken = await userCred.user.getIdToken();
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) {
        toastError("Account claimed but session could not be created. Please sign in.");
        router.replace("/login");
        return;
      }
      router.replace("/dashboard");
    } catch {
      toastError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Claim Your Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          {step === "lookup"
            ? "Enter your surname and the email address used when you registered."
            : "We found your account. Set a password to complete the claim."}
        </p>
      </div>

      {step === "lookup" ? (
        <form onSubmit={handleLookup} className="space-y-5">
          <Input
            label="Surname"
            placeholder="e.g. Santos"
            leftIcon={<User size={16} />}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Find My Account
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already set up your account?{" "}
            <Link href="/login" className="font-semibold text-navy-800 hover:text-navy-600">
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <>
          {accountInfo && (
            <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 space-y-1">
              <p className="font-semibold text-navy-900">{accountInfo.displayName}</p>
              {accountInfo.course && (
                <p className="text-sm text-gray-600">{accountInfo.course}</p>
              )}
              {accountInfo.batchYear && (
                <p className="text-sm text-gray-500">Batch {accountInfo.batchYear}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSetPassword} className="space-y-5">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              rightElement={
                <button type="button" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Set Password &amp; Sign In
            </Button>
            <button
              type="button"
              onClick={() => { setStep("lookup"); setAccountInfo(null); }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </form>
        </>
      )}
    </div>
  );
}
