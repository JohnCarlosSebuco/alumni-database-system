"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Star,
  BarChart2,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { Survey, SurveyQuestion, SurveyResponse } from "@/lib/types/survey.types";

interface SurveyResponsesProps {
  survey: Survey;
  responses: SurveyResponse[];
}

// -- CSV export --

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

// -- Stat card --

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-800">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// -- Per-question summary card --

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

  /* -- Short / Long text -- */
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

  /* -- Rating -- */
  if (question.type === "rating") {
    const nums = rawAnswers
      .map((a) => parseInt(String(a)))
      .filter((n) => n >= 1 && n <= 5);
    const avg =
      nums.length > 0 ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;

    const chartData = [5, 4, 3, 2, 1].map((star) => ({
      name: `${star} star${star !== 1 ? "s" : ""}`,
      count: nums.filter((n) => n === star).length,
      pct: nums.length
        ? ((nums.filter((n) => n === star).length / nums.length) * 100).toFixed(0)
        : "0",
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

              {/* Distribution bar chart */}
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 4, right: 36, top: 2, bottom: 2 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, nums.length]}
                      tickCount={4}
                      fontSize={11}
                      tick={{ fill: "#9ca3af" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={56}
                      fontSize={11}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, _name: any, entry: any) =>
                        [`${value ?? 0} (${entry?.payload?.pct ?? 0}%)`, "Responses"]
                      }
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.name.startsWith("5") || entry.name.startsWith("4")
                              ? "#1e2952"
                              : entry.name.startsWith("3")
                              ? "#3b4a8a"
                              : "#6b7eb5"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  /* -- Single choice / Multiple choice / Yes-No -- */
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

  const chartData = options.map((opt) => ({
    name: opt.length > 20 ? opt.slice(0, 18) + "..." : opt,
    fullName: opt,
    count: counts[opt] ?? 0,
    pct: (((counts[opt] ?? 0) / totalVotes) * 100).toFixed(0),
  }));

  return (
    <Card>
      <CardBody>
        <Meta />
        {options.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No options configured.</p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(160, options.length * 48)}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, Math.max(...Object.values(counts), 1)]}
                allowDecimals={false}
                fontSize={11}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                fontSize={11}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, _name: any, entry: any) =>
                  [`${value ?? 0} (${entry?.payload?.pct ?? 0}%)`, entry?.payload?.fullName ?? ""]
                }
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i % 2 === 0 ? "#1e2952" : "#3b4a8a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

// -- Individual view --

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
    .join(" - ");

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
              {meta ? ` - ${meta}` : ""}
            </p>
          </div>
        </div>

        <CardBody className="divide-y divide-gray-50">
          {survey.type === "google_form" || survey.questions.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4">
              (Google Form submission - answers not stored in-app)
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

// -- Main export --

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

  // Compute overview stats
  const sortedResponses = [...responses].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  const latestResponse = sortedResponses[sortedResponses.length - 1];

  let avgCompletion = 0;
  if (survey.questions.length > 0) {
    const completionRates = responses.map((r) => {
      const answered = survey.questions.filter((q) => {
        const ans = r.answers?.[q.id];
        if (ans === undefined || ans === null || ans === "") return false;
        if (Array.isArray(ans)) return ans.length > 0;
        return true;
      }).length;
      return (answered / survey.questions.length) * 100;
    });
    avgCompletion = completionRates.reduce((s, n) => s + n, 0) / completionRates.length;
  }

  return (
    <div className="space-y-5">
      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label="Total Responses"
          value={responses.length}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Avg Completion"
          value={`${avgCompletion.toFixed(0)}%`}
          sub={`${survey.questions.length} question${survey.questions.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Latest Response"
          value={formatDate(latestResponse.submittedAt)}
        />
        <StatCard
          icon={<ListChecks size={18} />}
          label="Questions"
          value={survey.questions.length}
          sub={survey.type === "custom" ? "Custom survey" : "Google Form"}
        />
      </div>

      {/* Toolbar: view toggle + response count + export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Pill toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("summary")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                view === "summary"
                  ? "bg-navy-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <BarChart2 size={14} />
              Summary
            </button>
            <button
              type="button"
              onClick={() => setView("individual")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                view === "individual"
                  ? "bg-navy-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Users size={14} />
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
