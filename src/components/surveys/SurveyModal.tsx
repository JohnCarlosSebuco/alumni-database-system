"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ExternalLink, Star, CheckCircle } from "lucide-react";
import { setDoc, updateDoc, doc, db } from "@/lib/firebase/firestore";
import { surveyResponseRef } from "@/lib/firebase/firestore";
import { inferProfilePatch } from "@/lib/utils/surveySyncProfile";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import type { Survey, SurveyQuestion } from "@/lib/types/survey.types";

interface SurveyModalProps {
  survey: Survey;
  onClose: () => void;
  onComplete: () => void;
}

export function SurveyModal({ survey, onClose, onComplete }: SurveyModalProps) {
  const { user, userDoc } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [step, done]);

  const questions = survey.questions ?? [];
  const currentQ = questions[step];
  const isLastStep = step === questions.length - 1;
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  const getAnswer = (qId: string) => answers[qId] ?? "";
  const setAnswer = (qId: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    setErrors((prev) => { const next = { ...prev }; delete next[qId]; return next; });
  };

  const toggleMulti = (qId: string, opt: string) => {
    const current = (answers[qId] as string[]) ?? [];
    const next = current.includes(opt)
      ? current.filter((v) => v !== opt)
      : [...current, opt];
    setAnswer(qId, next);
  };

  const validateStep = () => {
    if (!currentQ?.required) return true;
    const val = answers[currentQ.id];
    if (!val || (Array.isArray(val) && val.length === 0) || val === "") {
      setErrors((prev) => ({ ...prev, [currentQ.id]: "This question is required." }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!user || !userDoc) return;
    setSubmitting(true);
    try {
      await setDoc(surveyResponseRef(survey.id, user.uid), {
        uid: user.uid,
        displayName: userDoc.displayName,
        batchYear: userDoc.batchYear ?? null,
        course: userDoc.course ?? null,
        answers,
        submittedAt: new Date().toISOString(),
      });

      // Sync inferred profile fields (e.g. isAbroad, isEmployed) back to the
      // alumni's UserDoc so reports stay up-to-date automatically.
      const patch = inferProfilePatch(survey, answers);
      if (Object.keys(patch).length > 0) {
        try {
          await updateDoc(doc(db, "users", user.uid), patch as Record<string, unknown>);
        } catch {
          // Profile sync is best-effort — don't block the success screen.
        }
      }

      setDone(true);
      setTimeout(() => onComplete(), 2000);
    } catch {
      // fail silently — don't block alumni
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleFormComplete = async () => {
    if (!user || !userDoc) return;
    try {
      await setDoc(surveyResponseRef(survey.id, user.uid), {
        uid: user.uid,
        displayName: userDoc.displayName,
        batchYear: userDoc.batchYear ?? null,
        course: userDoc.course ?? null,
        answers: {},
        submittedAt: new Date().toISOString(),
        source: "google_form",
      });
    } catch {}
    onComplete();
  };

  const handleSkip = () => {
    const skipped: string[] = JSON.parse(
      sessionStorage.getItem("skippedSurveys") ?? "[]"
    );
    if (!skipped.includes(survey.id)) {
      sessionStorage.setItem(
        "skippedSurveys",
        JSON.stringify([...skipped, survey.id])
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-modal flex flex-col overflow-hidden animate-slide-up"
        style={{ maxHeight: "90vh" }}
        role="dialog"
        aria-modal="true"
        aria-label={survey.title}
      >
        {/* Progress bar (custom surveys only) */}
        {survey.type === "custom" && questions.length > 0 && !done && (
          <div className="h-1.5 w-full bg-gray-100 flex-shrink-0">
            <div
              className="h-full bg-navy-800 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{survey.title}</h2>
            {survey.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{survey.description}</p>
            )}
          </div>
          <button
            onClick={handleSkip}
            className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Skip survey"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {done ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your response has been recorded.</p>
              </div>
            </div>
          ) : survey.type === "google_form" ? (
            <div className="flex flex-col items-center text-center gap-6 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-navy-50">
                <ExternalLink size={28} className="text-navy-800" />
              </div>
              <p className="text-sm text-gray-600 max-w-md">
                This survey is hosted on Google Forms. Click the button below to open it in a new tab.
              </p>
              <a
                href={survey.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700 transition-colors"
              >
                <ExternalLink size={16} />
                Take Survey
              </a>
              <button
                type="button"
                onClick={handleGoogleFormComplete}
                className="text-sm text-navy-700 underline underline-offset-2 hover:text-navy-900 transition-colors"
              >
                I&apos;ve already completed this survey
              </button>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              This survey has no questions yet.
            </p>
          ) : (
            <div className="space-y-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Question {step + 1} of {questions.length}
              </p>
              <QuestionInput
                question={currentQ}
                value={getAnswer(currentQ.id)}
                onChange={(val) => setAnswer(currentQ.id, val)}
                onToggle={(opt) => toggleMulti(currentQ.id, opt)}
                error={errors[currentQ.id]}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>

            {survey.type === "custom" && questions.length > 0 && (
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {isLastStep ? (
                  <Button variant="primary" size="sm" loading={submitting} onClick={handleSubmit}>
                    Submit
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Per-question input renderer ──────────────────────────────────────────────

interface QuestionInputProps {
  question: SurveyQuestion;
  value: string | string[];
  onChange: (val: string) => void;
  onToggle: (opt: string) => void;
  error?: string;
}

function QuestionInput({ question, value, onChange, onToggle, error }: QuestionInputProps) {
  const strVal = typeof value === "string" ? value : "";
  const arrVal = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h3>

      {question.type === "short_text" && (
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          error={error}
        />
      )}

      {question.type === "long_text" && (
        <Textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
          rows={4}
          error={error}
        />
      )}

      {question.type === "single_choice" && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                strVal === opt
                  ? "border-navy-800 bg-navy-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border-2 flex-shrink-0",
                  strVal === opt ? "border-navy-800" : "border-gray-300"
                )}
              >
                {strVal === opt && (
                  <span className="h-2 w-2 rounded-full bg-navy-800" />
                )}
              </span>
              <input
                type="radio"
                className="sr-only"
                checked={strVal === opt}
                onChange={() => onChange(opt)}
              />
              <span className="text-sm text-gray-800">{opt}</span>
            </label>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => {
            const checked = arrVal.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                  checked
                    ? "border-navy-800 bg-navy-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border-2 flex-shrink-0",
                    checked ? "border-navy-800 bg-navy-800" : "border-gray-300"
                  )}
                >
                  {checked && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onToggle(opt)}
                />
                <span className="text-sm text-gray-800">{opt}</span>
              </label>
            );
          })}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {question.type === "rating" && (
        <div className="space-y-1">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(String(star))}
                aria-label={`${star} star`}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={cn(
                    "transition-colors",
                    parseInt(strVal) >= star
                      ? "fill-gold-500 text-gold-500"
                      : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {question.type === "yes_no" && (
        <div className="space-y-2">
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors",
                  strVal === opt
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
