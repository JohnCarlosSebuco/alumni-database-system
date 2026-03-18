"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { Survey, SurveyQuestion, SurveyResponse } from "@/lib/types/survey.types";

interface SurveyResponsesProps {
  survey: Survey;
  responses: SurveyResponse[];
}

// ── CSV export ───────────────────────────────────────────────────────────────

function exportToCSV(survey: Survey, responses: SurveyResponse[]) {
  const headers = [
    "Name",
    "Batch Year",
    "Course",
    "Submitted At",
    ...survey.questions.map((q, i) => `Q${i + 1}: ${q.label}`),
  ];

  const rows = responses.map((r) => [
    r.displayName,
    r.batchYear ?? "",
    r.course ?? "",
    r.submittedAt,
    ...survey.questions.map((q) => {
      const ans = r.answers?.[q.id];
      if (!ans) return "";
      return Array.isArray(ans) ? ans.join("; ") : String(ans);
    }),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // BOM so Excel reads UTF-8 correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${survey.title.replace(/[^a-z0-9]/gi, "_")}_responses.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Horizontal bar row (CSS only) ────────────────────────────────────────────

function HorizBar({
  label,
  count,
  pct,
}: {
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-3 group">
      <span
        className="w-24 sm:w-40 text-xs sm:text-sm text-gray-700 text-right shrink-0 truncate"
        title={label}
      >
        {label}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-navy-800 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(pct, count > 0 ? 1 : 0)}%` }}
        />
      </div>
      <span className="w-20 sm:w-28 shrink-0 text-xs sm:text-sm text-gray-500">
        {count} &nbsp;
        <span className="text-gray-400">({pct.toFixed(0)}%)</span>
      </span>
    </div>
  );
}

// ── Per-question summary card ─────────────────────────────────────────────────

function QuestionSummaryCard({
  question,
  responses,
  index,
}: {
  question: SurveyQuestion;
  responses: SurveyResponse[];
  index: number;
}) {
  const total = responses.length;
  const rawAnswers = responses
    .map((r) => r.answers?.[question.id])
    .filter((a) => a !== undefined && a !== null && a !== "");
  const answered = rawAnswers.length;

  const Meta = () => (
    <div className="mb-4">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
        Question {index + 1}
      </p>
      <p className="text-base font-semibold text-gray-900 mt-0.5 leading-snug">
        {question.label}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {answered} of {total} responded
      </p>
    </div>
  );

  /* ── Short / Long text ── */
  if (question.type === "short_text" || question.type === "long_text") {
    const textAnswers = rawAnswers.filter(
      (a): a is string => typeof a === "string"
    );
    return (
      <Card>
        <CardBody>
          <Meta />
          {textAnswers.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No answers yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {textAnswers.map((ans, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-2.5 text-sm text-gray-700 leading-relaxed"
                >
                  {ans}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  /* ── Rating ── */
  if (question.type === "rating") {
    const nums = rawAnswers
      .map((a) => parseInt(String(a)))
      .filter((n) => n >= 1 && n <= 5);
    const avg =
      nums.length > 0 ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: nums.filter((n) => n === star).length,
    }));

    return (
      <Card>
        <CardBody>
          <Meta />
          {nums.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No ratings yet.</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Average */}
              <div className="flex flex-col items-center justify-center shrink-0 gap-1 sm:w-28">
                <span className="text-5xl font-bold text-navy-800 leading-none">
                  {avg.toFixed(1)}
                </span>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={cn(
                        avg >= s
                          ? "fill-gold-500 text-gold-500"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {nums.length} rating{nums.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 space-y-2">
                {dist.map(({ star, count }) => (
                  <HorizBar
                    key={star}
                    label={`${star} star${star !== 1 ? "s" : ""}`}
                    count={count}
                    pct={nums.length ? (count / nums.length) * 100 : 0}
                  />
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  /* ── Single choice / Multiple choice / Yes–No ── */
  const options =
    question.type === "yes_no" ? ["Yes", "No"] : (question.options ?? []);
  const counts: Record<string, number> = Object.fromEntries(
    options.map((o) => [o, 0])
  );

  rawAnswers.forEach((ans) => {
    if (Array.isArray(ans)) {
      ans.forEach((a) => {
        if (a in counts) counts[a]++;
      });
    } else {
      const s = String(ans);
      if (s in counts) counts[s]++;
    }
  });

  const totalVotes = Object.values(counts).reduce((s, n) => s + n, 0) || 1;

  return (
    <Card>
      <CardBody>
        <Meta />
        {options.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No options configured.</p>
        ) : (
          <div className="space-y-2.5">
            {options.map((opt) => (
              <HorizBar
                key={opt}
                label={opt}
                count={counts[opt] ?? 0}
                pct={((counts[opt] ?? 0) / totalVotes) * 100}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Individual view ───────────────────────────────────────────────────────────

function IndividualView({
  survey,
  responses,
}: {
  survey: Survey;
  responses: SurveyResponse[];
}) {
  const [idx, setIdx] = useState(0);
  const r = responses[idx];
  if (!r) return null;

  const meta = [
    r.batchYear ? `Batch ${r.batchYear}` : null,
    r.course ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
      {/* Navigation bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="rounded-lg p-1.5 border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 transition-colors"
            title="Previous response"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 tabular-nums min-w-[72px] text-center">
            {idx + 1} / {responses.length}
          </span>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(responses.length - 1, i + 1))}
            disabled={idx === responses.length - 1}
            className="rounded-lg p-1.5 border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-25 transition-colors"
            title="Next response"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{r.displayName}</p>
          {meta && <p className="text-xs text-gray-400">{meta}</p>}
        </div>
      </div>

      {/* Answer card */}
      <Card>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">{r.displayName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Submitted {formatDate(r.submittedAt)}
              {meta ? ` · ${meta}` : ""}
            </p>
          </div>
        </div>

        <CardBody className="divide-y divide-gray-50">
          {survey.type === "google_form" || survey.questions.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4">
              (Google Form submission — answers not stored in-app)
            </p>
          ) : (
            survey.questions.map((q, i) => {
              const ans = r.answers?.[q.id];
              return (
                <div key={q.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Q{i + 1} &nbsp;·&nbsp; {q.label}
                  </p>
                  {q.type === "rating" ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={20}
                            className={cn(
                              parseInt(String(ans)) >= s
                                ? "fill-gold-500 text-gold-500"
                                : "fill-gray-200 text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      {ans && (
                        <span className="text-sm text-gray-500 ml-1">
                          {ans} / 5
                        </span>
                      )}
                    </div>
                  ) : Array.isArray(ans) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ans.map((a, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center rounded-full bg-navy-50 border border-navy-100 px-3 py-0.5 text-sm text-navy-800"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : ans ? (
                    <p className="text-sm text-gray-800 leading-relaxed">{ans}</p>
                  ) : (
                    <p className="text-sm text-gray-300 italic">No answer</p>
                  )}
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SurveyResponses({ survey, responses }: SurveyResponsesProps) {
  const [view, setView] = useState<"summary" | "individual">("summary");

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Users size={24} className="text-gray-400" />
        </div>
        <p className="font-medium text-gray-700">No responses yet</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Responses will appear here once alumni submit the survey.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar: view toggle + response count + export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Pill toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("summary")}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                view === "summary"
                  ? "bg-navy-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setView("individual")}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                view === "individual"
                  ? "bg-navy-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Individual
            </button>
          </div>

          <span className="text-sm text-gray-400">
            {responses.length} response{responses.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={() => exportToCSV(survey, responses)}
        >
          Export to CSV
        </Button>
      </div>

      {/* Content */}
      {view === "summary" && (
        <div className="space-y-4">
          {survey.type === "google_form" || survey.questions.length === 0 ? (
            <Card>
              <CardBody className="py-10 text-center">
                <p className="text-sm text-gray-400 italic">
                  Summary charts are only available for custom surveys.
                </p>
              </CardBody>
            </Card>
          ) : (
            survey.questions.map((q, i) => (
              <QuestionSummaryCard
                key={q.id}
                question={q}
                responses={responses}
                index={i}
              />
            ))
          )}
        </div>
      )}

      {view === "individual" && (
        <IndividualView survey={survey} responses={responses} />
      )}
    </div>
  );
}
