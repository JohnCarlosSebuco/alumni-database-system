"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  surveysRef,
  surveyRef,
  addDoc,
  updateDoc,
} from "@/lib/firebase/firestore";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Star, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  Survey,
  SurveyQuestion,
  SurveyType,
  SurveyStatus,
  QuestionType,
} from "@/lib/types/survey.types";

interface SurveyBuilderProps {
  survey?: Survey;
}

const questionTypeOptions = [
  { value: "short_text",      label: "Short Text" },
  { value: "long_text",       label: "Long Text" },
  { value: "single_choice",   label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating",          label: "Rating (1–5 stars)" },
  { value: "yes_no",          label: "Yes / No" },
];

const statusOptions = [
  { value: "draft",  label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

const typeOptions = [
  { value: "custom",      label: "Custom (in-app)" },
  { value: "google_form", label: "Google Form (external link)" },
];

function makeNewQuestion(): SurveyQuestion {
  return {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "",
    required: false,
    options: [],
  };
}

// ── Question Card ──────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  total: number;
  isActive: boolean;
  onActivate: () => void;
  onChange: (q: SurveyQuestion) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function QuestionCard({
  question,
  index,
  total,
  isActive,
  onActivate,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: QuestionCardProps) {
  const [newOpt, setNewOpt] = useState("");
  const labelRef = useRef<HTMLInputElement>(null);
  const hasOptions =
    question.type === "single_choice" || question.type === "multiple_choice";

  // Focus the label input when this card becomes active
  useEffect(() => {
    if (isActive && labelRef.current && !question.label) {
      labelRef.current.focus();
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const addOpt = () => {
    const trimmed = newOpt.trim();
    if (!trimmed) return;
    onChange({ ...question, options: [...(question.options ?? []), trimmed] });
    setNewOpt("");
  };

  const updateOpt = (i: number, val: string) => {
    const opts = [...(question.options ?? [])];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };

  const removeOpt = (i: number) => {
    onChange({
      ...question,
      options: (question.options ?? []).filter((_, idx) => idx !== i),
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-white transition-all duration-150 cursor-pointer",
        isActive
          ? "border-l-4 border-l-navy-800 shadow-card-hover ring-1 ring-gray-100"
          : "border border-gray-200 hover:border-gray-300 shadow-sm"
      )}
      onClick={onActivate}
    >
      {/* ── Card body ── */}
      <div className="p-5 space-y-4">
        {/* Row 1: question input + type selector */}
        <div className="flex gap-3 items-start">
          <input
            ref={labelRef}
            type="text"
            value={question.label}
            onChange={(e) => onChange({ ...question, label: e.target.value })}
            placeholder={`Question ${index + 1}`}
            className="flex-1 text-base font-medium text-gray-900 bg-transparent border-0 border-b-2 border-gray-200 focus:border-navy-800 outline-none py-1 placeholder-gray-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="w-52 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Select
              options={questionTypeOptions}
              value={question.type}
              onChange={(e) => {
                const t = e.target.value as QuestionType;
                onChange({ ...question, type: t, options: t === "single_choice" || t === "multiple_choice" ? (question.options ?? []) : [] });
              }}
            />
          </div>
        </div>

        {/* Row 2: answer area */}

        {question.type === "short_text" && (
          <div className="border-b border-dashed border-gray-300 pb-1 w-2/3">
            <span className="text-sm text-gray-300 select-none">Short answer text</span>
          </div>
        )}

        {question.type === "long_text" && (
          <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 w-full">
            <span className="text-sm text-gray-300 select-none">Long answer text</span>
          </div>
        )}

        {question.type === "rating" && (
          <div className="flex gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={30} className="text-gray-200 fill-gray-200" />
            ))}
          </div>
        )}

        {question.type === "yes_no" && (
          <div className="flex gap-2 pt-1">
            {["Yes", "No"].map((opt) => (
              <div
                key={opt}
                className="rounded-xl border-2 border-gray-200 px-8 py-2 text-sm font-semibold text-gray-300 select-none"
              >
                {opt}
              </div>
            ))}
          </div>
        )}

        {hasOptions && (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            {(question.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2 group">
                {/* Radio/checkbox indicator */}
                {question.type === "single_choice" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 rounded border-2 border-gray-300 flex-shrink-0" />
                )}
                {/* Editable option */}
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOpt(i, e.target.value)}
                  className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-navy-800 outline-none text-sm text-gray-700 py-0.5 transition-colors"
                  placeholder={`Option ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOpt(i)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Add option row */}
            <div className="flex items-center gap-2 mt-1">
              {question.type === "single_choice" ? (
                <span className="h-4 w-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
              ) : (
                <span className="h-4 w-4 rounded border-2 border-gray-200 flex-shrink-0" />
              )}
              <input
                type="text"
                value={newOpt}
                onChange={(e) => setNewOpt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addOpt(); }
                }}
                placeholder="Add option"
                className="flex-1 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-navy-800 outline-none text-sm text-navy-700 placeholder-gray-400 py-0.5 transition-colors"
              />
              {newOpt && (
                <button
                  type="button"
                  onClick={addOpt}
                  className="text-xs font-semibold text-navy-800 hover:text-navy-600 transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar (active only) ── */}
      {isActive && (
        <div
          className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: move / duplicate / delete */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25 transition-colors"
              title="Move up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-25 transition-colors"
              title="Move down"
            >
              <ChevronDown size={16} />
            </button>
            <span className="h-5 w-px bg-gray-200 mx-1.5" />
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Duplicate question"
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
              title="Delete question"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Right: required toggle */}
          <label
            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none"
          >
            <span>Required</span>
            <button
              type="button"
              onClick={() => onChange({ ...question, required: !question.required })}
              className={cn(
                "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200",
                question.required ? "bg-navy-800" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  question.required ? "translate-x-4" : "translate-x-1"
                )}
              />
            </button>
          </label>
        </div>
      )}
    </div>
  );
}

// ── Survey Builder ─────────────────────────────────────────────────────────

export function SurveyBuilder({ survey }: SurveyBuilderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState(survey?.title ?? "");
  const [description, setDescription] = useState(survey?.description ?? "");
  const [type, setType] = useState<SurveyType>(survey?.type ?? "custom");
  const [status, setStatus] = useState<SurveyStatus>(survey?.status ?? "draft");
  const [googleFormUrl, setGoogleFormUrl] = useState(survey?.googleFormUrl ?? "");
  const [questions, setQuestions] = useState<SurveyQuestion[]>(survey?.questions ?? []);

  const [activeQId, setActiveQId] = useState<string | null>(
    survey?.questions?.[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("details");

  const updateQuestion = (id: string, updated: SurveyQuestion) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? updated : q)));
  };

  const moveQuestion = (index: number, dir: -1 | 1) => {
    const next = [...questions];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
  };

  const duplicateQuestion = (index: number) => {
    const dupe = { ...questions[index], id: crypto.randomUUID() };
    const next = [...questions];
    next.splice(index + 1, 0, dupe);
    setQuestions(next);
    setActiveQId(dupe.id);
  };

  const removeQuestion = (index: number) => {
    const next = questions.filter((_, i) => i !== index);
    setQuestions(next);
    setActiveQId(next[Math.min(index, next.length - 1)]?.id ?? null);
  };

  const addQuestion = () => {
    const q = makeNewQuestion();
    setQuestions((qs) => [...qs, q]);
    setActiveQId(q.id);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    if (type === "google_form" && !googleFormUrl.trim())
      e.googleFormUrl = "Google Form URL is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        status,
        googleFormUrl: type === "google_form" ? googleFormUrl.trim() : "",
        questions: type === "custom" ? questions : [],
        updatedAt: now,
      };
      if (survey?.id) {
        await updateDoc(surveyRef(survey.id), payload);
        success("Survey updated!");
      } else {
        await addDoc(surveysRef(), {
          ...payload,
          createdBy: user?.uid ?? "",
          createdAt: now,
        });
        success("Survey created!");
      }
      router.push("/admin/surveys");
    } catch {
      toastError("Failed to save survey.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "details", label: "Details" },
    ...(type === "custom"
      ? [{ key: "questions", label: `Questions (${questions.length})` }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* ── Details Tab ── */}
      {activeTab === "details" && (
        <div className="space-y-4">
          <Input
            label="Survey Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="e.g. Alumni Employment Survey 2025"
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description shown to alumni before they start."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Survey Type"
              options={typeOptions}
              value={type}
              onChange={(e) => {
                const val = e.target.value as SurveyType;
                setType(val);
              }}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as SurveyStatus)}
            />
          </div>
          {type === "google_form" && (
            <Input
              label="Google Form URL"
              value={googleFormUrl}
              onChange={(e) => setGoogleFormUrl(e.target.value)}
              error={errors.googleFormUrl}
              placeholder="https://docs.google.com/forms/d/e/…/viewform"
            />
          )}
        </div>
      )}

      {/* ── Questions Tab ── */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
              <p className="text-sm text-gray-400">
                No questions yet. Click <strong className="text-gray-600">Add Question</strong> below to get started.
              </p>
            </div>
          )}

          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              isActive={activeQId === q.id}
              onActivate={() => setActiveQId(q.id)}
              onChange={(updated) => updateQuestion(q.id, updated)}
              onMove={(dir) => moveQuestion(i, dir)}
              onDuplicate={() => duplicateQuestion(i)}
              onDelete={() => removeQuestion(i)}
            />
          ))}

          {/* Add question button */}
          <button
            type="button"
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-navy-800 hover:text-navy-800 transition-colors"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      )}

      {/* ── Save / Cancel ── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/surveys")}>
          Cancel
        </Button>
        <Button type="button" variant="primary" loading={saving} onClick={handleSave}>
          {survey?.id ? "Save Changes" : "Create Survey"}
        </Button>
      </div>
    </div>
  );
}
