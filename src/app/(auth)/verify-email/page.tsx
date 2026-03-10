"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw, LogOut, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { auth, sendVerificationEmail, signOut } from "@/lib/firebase/auth";
import { onAuthStateChanged, type User } from "firebase/auth";
import { setDoc, getDoc, userDocRef } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notYetVerified, setNotYetVerified] = useState(false); // shown after failed check
  const [failCount, setFailCount] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  // On mount: if Firebase already has emailVerified (e.g. user clicked the link
  // and the continueUrl brought them back here), auto-redirect immediately.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.emailVerified) {
        handleAlreadyVerified(user);
        return;
      }
      setEmail(user.email);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Clear "not yet verified" hint after a few seconds so it doesn't linger
  useEffect(() => {
    if (!notYetVerified) return;
    const t = setTimeout(() => setNotYetVerified(false), 6000);
    return () => clearTimeout(t);
  }, [notYetVerified]);

  // Write Firestore user doc if it doesn't exist yet.
  // Called only after emailVerified === true to keep unverified accounts
  // out of the alumni directory.
  async function finalizeAccount(user: User) {
    const existing = await getDoc(userDocRef(user.uid));
    if (existing.exists()) return; // already written (e.g. admin-created account)

    const raw = sessionStorage.getItem("pendingAlumniData");
    const pending = raw ? JSON.parse(raw) : {};

    // Only use sessionStorage data if it matches the current user
    const isMatch = pending.uid === user.uid;

    await setDoc(
      userDocRef(user.uid),
      {
        uid: user.uid,
        email: isMatch ? pending.email : (user.email ?? ""),
        role: "alumni",
        displayName: isMatch ? pending.displayName : (user.displayName ?? ""),
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        profileComplete: 0,
        batchYear: isMatch ? pending.batchYear : null,
        department: isMatch ? pending.department : "College of Engineering",
        course: isMatch ? pending.course : null,
        studentId: isMatch ? pending.studentId : "",
        notifPrefs: { jobs: true, events: true },
      },
      { merge: true }
    );

    if (isMatch) sessionStorage.removeItem("pendingAlumniData");
  }

  async function handleAlreadyVerified(user: User) {
    await finalizeAccount(user);
    // Force-refresh to ensure custom claims are included in the token
    const idToken = await user.getIdToken(true);
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    router.replace("/dashboard");
  }

  async function handleContinue() {
    const user = auth.currentUser;
    if (!user) { router.replace("/login"); return; }

    setChecking(true);
    setNotYetVerified(false);
    try {
      await user.reload();
      if (user.emailVerified) {
        setVerified(true);
        setTimeout(async () => {
          await finalizeAccount(user);
          const idToken = await user.getIdToken(true);
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          router.replace("/dashboard");
        }, 800);
      } else {
        setFailCount((c) => c + 1);
        setNotYetVerified(true);
        setChecking(false);
      }
    } catch {
      setChecking(false);
    }
  }

  async function handleResend() {
    const user = auth.currentUser;
    if (!user || resendCooldown > 0) return;
    setResending(true);
    try {
      await sendVerificationEmail(user, `${window.location.origin}/verify-email`);
      setResendSuccess(true);
      setResendCooldown(60);
      setNotYetVerified(false);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      // Firebase will naturally surface too-many-requests
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          verified
            ? "bg-green-50 border-green-200"
            : notYetVerified
            ? "bg-amber-50 border-amber-200"
            : "bg-navy-50 border-navy-100"
        }`}
      >
        {verified ? (
          <CheckCircle size={40} className="text-green-500" />
        ) : notYetVerified ? (
          <AlertCircle size={40} className="text-amber-500" />
        ) : (
          <MailCheck size={40} className="text-navy-700" />
        )}
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900">
        {verified ? "Email verified!" : "Verify your email"}
      </h1>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
        {verified ? (
          "Redirecting you to your dashboard…"
        ) : email ? (
          <>
            We sent a verification link to{" "}
            <span className="font-semibold text-gray-700">{email}</span>.
            {" "}Click the link in your inbox to activate your account.
          </>
        ) : (
          "Check your inbox for a verification link to activate your account."
        )}
      </p>

      {/* Spam hint */}
      {!verified && (
        <p className="mt-2 text-xs text-gray-400 max-w-xs">
          Can&apos;t find it?{" "}
          <span className="font-medium text-gray-500">Check your spam or junk folder</span>
          {" "}— verification emails sometimes end up there.
        </p>
      )}

      {!verified && (
        <div className="mt-6 w-full max-w-xs space-y-3">
          {/* "Not yet verified" feedback banner */}
          {notYetVerified && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {failCount >= 2
                  ? "Still not showing as verified. Try resending the email or check your spam folder, then click the link and come back here."
                  : "Your email hasn't been verified yet. Please click the link in the email first, then try again."}
              </p>
            </div>
          )}

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={checking}
            onClick={handleContinue}
          >
            {checking ? "Checking…" : "I've verified my email"}
          </Button>

          {/* Resend */}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : resendSuccess
              ? "Email sent!"
              : "Resend verification email"}
          </button>

          {resendSuccess && (
            <p className="text-xs text-green-600 font-medium">
              Verification email resent — check your inbox and spam folder.
            </p>
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex w-full items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            <LogOut size={13} />
            Sign out and use a different account
          </button>
        </div>
      )}

      {verified && (
        <div className="mt-6 flex items-center gap-2 text-sm text-green-600 font-medium">
          <Loader2 size={14} className="animate-spin" />
          Redirecting…
        </div>
      )}
    </div>
  );
}
