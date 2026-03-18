"use client";

import React, { useState, useMemo } from "react";
import { FileDown, Table, Printer } from "lucide-react";
import {
  db, collection, query, where, getDocs,
} from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { formatDate, batchYearLabel } from "@/lib/utils/formatters";
import { computeOutcomeRates, computeCohortBreakdown, computeWaitingTimeBreakdown, computeCollegeGoals, computePOEStats, computeGAStats, computeIntervalOutcomes, computeIntervalOutcomesByDept } from "@/lib/utils/courseAlignment";
import type { WaitingTimeRow, IntervalOutcomeRow, IntervalBucket, IntervalOutcomeByDept } from "@/lib/utils/courseAlignment";
import { WaitingTimeChart } from "@/components/dashboard/WaitingTimeChart";
import type { UserDoc } from "@/lib/types/alumni.types";

export const dynamic = 'force-dynamic';

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

const COE_COURSES = [
  { value: "", label: "All programs" },
  { value: "Bachelor of Science in Industrial Engineering", label: "BS Industrial Engineering" },
  { value: "Bachelor of Science in Electronics Engineering", label: "BS Electronics Engineering" },
  { value: "Bachelor of Science in Mechanical Engineering", label: "BS Mechanical Engineering" },
];

export default function ReportsPage() {
  const { error: toastError } = useToast();
  const [filters, setFilters] = useState({ course: "", batchYear: "" });
  const [results, setResults] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [intervalView, setIntervalView] = useState<"batch" | "dept">("batch");

  const employmentStats = useMemo(() => {
    if (!results.length) return { employed: 0, unemployed: 0, employmentRate: 0, unemploymentRate: 0 };
    const employed = results.filter((a) => a.isEmployed === true).length;
    const unemployed = results.length - employed;
    return {
      employed,
      unemployed,
      employmentRate: Math.round((employed / results.length) * 100),
      unemploymentRate: Math.round((unemployed / results.length) * 100),
    };
  }, [results]);

  const outcomeRates = useMemo(() => computeOutcomeRates(results), [results]);
  const cohortRows = useMemo(() => computeCohortBreakdown(results), [results]);
  const waitingTimeRows = useMemo(() => computeWaitingTimeBreakdown(results), [results]);
  const collegeGoals = useMemo(() => computeCollegeGoals(results), [results]);
  const poeStats = useMemo(() => computePOEStats(results), [results]);
  const gaStats = useMemo(() => computeGAStats(results), [results]);
  const intervalOutcomes = useMemo(() => computeIntervalOutcomes(results), [results]);
  const intervalByDept = useMemo(() => computeIntervalOutcomesByDept(results), [results]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const constraints: Parameters<typeof where>[] = [
        ["role", "==", "alumni"],
      ];
      if (filters.course) constraints.push(["course", "==", filters.course]);
      if (filters.batchYear) constraints.push(["batchYear", "==", Number(filters.batchYear)]);

      const q = query(collection(db, "users"), ...constraints.map(([f, op, v]) => where(f as string, op as never, v)));
      const snap = await getDocs(q);
      setResults(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
      setGenerated(true);
    } catch {
      toastError("Failed to generate report. Check your filters.");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    const Papa = (await import("papaparse")).default;
    const csv = Papa.unparse(
      results.map((a) => ({
        Name: a.displayName,
        Email: a.email,
        Department: a.department ?? "",
        Course: a.course ?? "",
        "Batch Year": a.batchYear ?? "",
        "Employment Status": a.isEmployed === true ? "Employed" : a.isEmployed === false ? "Unemployed" : "Not specified",
        "Profile Complete": `${a.profileComplete}%`,
        "Joined": formatDate(a.createdAt),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alumnayan-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();

    const filterLabel = filters.course
      ? COE_COURSES.find((c) => c.value === filters.course)?.label ?? filters.course
      : "All Programs";
    const batchLabel = filters.batchYear || "All Years";

    // ── Page 1: Outcomes Summary ──────────────────────────────────────
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("AlumNayan \u2014 Alumni Outcomes Report", 14, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("College of Engineering", 14, 27);
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-PH")}  |  Program: ${filterLabel}  |  Batch: ${batchLabel}  |  Total Alumni: ${results.length}`,
      14, 33
    );
    doc.setDrawColor(200); doc.line(14, 36, 196, 36);
    doc.setTextColor(0);

    // Section A — Employment Summary
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("A. Employment Summary", 14, 43);
    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Count", "Rate"]],
      body: [
        ["Employed",   String(employmentStats.employed),   `${employmentStats.employmentRate}%`],
        ["Unemployed", String(employmentStats.unemployed), `${employmentStats.unemploymentRate}%`],
        ["Total",      String(results.length),             "\u2014"],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: "center" }, 2: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // Section B — Course-Aligned Placement Rates
    const afterA = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("B. Course-Aligned Placement Rates", 14, afterA);
    autoTable(doc, {
      startY: afterA + 3,
      head: [["Career Stage", "Alumni in Stage", "Course-Aligned", "Alignment Rate"]],
      body: [
        ["Recent Graduates (0\u20132 yrs)", String(outcomeRates.recentTotal),           String(outcomeRates.recentAligned),           `${outcomeRates.recentGraduatePlacementRate}%`],
        ["Mid-Career (3\u20135 yrs)",       String(outcomeRates.midCareerTotal),        String(outcomeRates.midCareerAligned),        `${outcomeRates.midCareerAlignmentRate}%`],
        ["Established Career (6+ yrs)",     String(outcomeRates.establishedCareerTotal), String(outcomeRates.establishedCareerAligned), `${outcomeRates.establishedCareerAlignmentRate}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // Section C — Cohort Breakdown
    const afterB = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("C. Cohort Outcomes by Batch Year", 14, afterB);
    autoTable(doc, {
      startY: afterB + 3,
      head: [["Batch Year", "5-yr Eval Year", "Years Out", "Total", "Employed", "Employment Rate", "Course-Aligned", "Alignment Rate"]],
      body: cohortRows.map((row) => [
        String(row.batchYear),
        String(row.evalYear),
        `${row.yearsOut} yrs`,
        String(row.total),
        String(row.employed),
        `${row.employmentRate}%`,
        String(row.aligned),
        `${row.alignmentRate}%`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center", fontStyle: "bold" },
        6: { halign: "center" },
        7: { halign: "center", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });

    // Section D — Time to First Job
    const afterC = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("D. Time to First Job After Graduation", 14, afterC);
    const respondents = waitingTimeRows.reduce((s, r) => s + r.count, 0);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text(`Based on ${respondents} alumni who answered this question.`, 14, afterC + 5);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: afterC + 9,
      head: [["Waiting Time", "Frequency", "Percentage"]],
      body: waitingTimeRows.map((r) => [r.label, String(r.count), `${r.percentage}%`]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: "center" },
        2: { halign: "center", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });

    // Section E — College Goals
    const afterD = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("E. College Goals", 14, afterD);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text("PEO-to-College Goal mapping: Goal 1 \u2014 Global Context | Goal 2 \u2014 Research/Innovation/Industry | Goal 3 \u2014 Community/Extension/Sustainability", 14, afterD + 5);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: afterD + 9,
      head: [["Program Educational Objective", "Goal 1\nGlobal Context", "Goal 2\nResearch/Innovation", "Goal 3\nCommunity/Extension"]],
      body: [
        [
          "PEO 1: Professional competence, global and industry excellence.",
          `${collegeGoals.goal1.count} (${collegeGoals.goal1.percentage}%)`,
          `${collegeGoals.goal2.count} (${collegeGoals.goal2.percentage}%)`,
          "\u2014",
        ],
        [
          "PEO 2: Ethics, social responsibility, and community service.",
          `${collegeGoals.goal1.count} (${collegeGoals.goal1.percentage}%)`,
          "\u2014",
          `${collegeGoals.goal3.count} (${collegeGoals.goal3.percentage}%)`,
        ],
        [
          "PEO 3: Innovation, research, extension, and sustainability.",
          "\u2014",
          `${collegeGoals.goal2.count} (${collegeGoals.goal2.percentage}%)`,
          `${collegeGoals.goal3.count} (${collegeGoals.goal3.percentage}%)`,
        ],
      ],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });

    // Section F — POE Summary
    let afterE = (doc as any).lastAutoTable.finalY + 8;
    if (afterE > 240) { doc.addPage(); afterE = 20; }
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("F. Program Educational Objectives (POE)", 14, afterE);
    autoTable(doc, {
      startY: afterE + 3,
      head: [["POE", "Description", "Count", "Percentage"]],
      body: [
        ["POE 1", "Professional & Technical Competence", String(poeStats.poe1.count), `${poeStats.poe1.percentage}%`],
        ["POE 2", "Ethical, Social & Leadership Responsibility", String(poeStats.poe2.count), `${poeStats.poe2.percentage}%`],
        ["POE 3", "Innovation, Research & Sustainability", String(poeStats.poe3.count), `${poeStats.poe3.percentage}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 80 }, 2: { halign: "center" }, 3: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // Section G — GA Summary
    let afterF = (doc as any).lastAutoTable.finalY + 8;
    if (afterF > 240) { doc.addPage(); afterF = 20; }
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("G. Graduate Attributes (GA)", 14, afterF);
    autoTable(doc, {
      startY: afterF + 3,
      head: [["GA", "Description", "Count", "Percentage"]],
      body: [
        ["GA 1", "Professional & Technical Competence", String(gaStats.poe1.count), `${gaStats.poe1.percentage}%`],
        ["GA 2", "Ethical, Social, and Leadership Responsibility", String(gaStats.poe2.count), `${gaStats.poe2.percentage}%`],
        ["GA 3", "Innovation, Research, and Sustainability Orientation", String(gaStats.poe3.count), `${gaStats.poe3.percentage}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 80 }, 2: { halign: "center" }, 3: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // Section H — Employment Outcomes by Year Interval
    let afterG = (doc as any).lastAutoTable.finalY + 8;
    if (afterG > 240) { doc.addPage(); afterG = 20; }
    const fmtBucket = (b: IntervalBucket) =>
      b.responded > 0 ? `${b.rate}% (${b.employed}/${b.responded})` : "\u2014";

    if (intervalView === "batch") {
      const intervalRows = intervalOutcomes.filter(
        (r) => r.at1yr.responded > 0 || r.at2yr.responded > 0 || r.at5yr.responded > 0 || r.at8yr.responded > 0
      );
      if (intervalRows.length > 0) {
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text("H. Employment Outcomes by Year Interval", 14, afterG);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
        doc.text("Employment rate at 1, 2, 5, and 8 years after graduation (based on survey responses).", 14, afterG + 5);
        doc.setTextColor(0);
        autoTable(doc, {
          startY: afterG + 9,
          head: [["Batch Year", "Total", "1 Year", "2 Years", "5 Years", "8 Years"]],
          body: intervalRows.map((row) => [
            String(row.batchYear),
            String(row.total),
            fmtBucket(row.at1yr),
            fmtBucket(row.at2yr),
            fmtBucket(row.at5yr),
            fmtBucket(row.at8yr),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [30, 41, 82] },
          columnStyles: {
            0: { halign: "center" },
            1: { halign: "center" },
            2: { halign: "center" },
            3: { halign: "center" },
            4: { halign: "center" },
            5: { halign: "center" },
          },
          margin: { left: 14, right: 14 },
        });
      }
    } else {
      if (intervalByDept.length > 0) {
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text("H. Employment Outcomes by Year Interval (by Department)", 14, afterG);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
        doc.text("Employment rate at 1, 2, 5, and 8 years after graduation, grouped by department.", 14, afterG + 5);
        doc.setTextColor(0);
        const deptBody: (string | { content: string; colSpan: number; styles: Record<string, unknown> })[][] = [];
        for (const dept of intervalByDept) {
          deptBody.push([{
            content: dept.label,
            colSpan: 6,
            styles: { fontStyle: "bold", fillColor: [224, 231, 255], textColor: [49, 46, 129] },
          }]);
          for (const row of dept.rows) {
            deptBody.push([
              String(row.batchYear),
              String(row.total),
              fmtBucket(row.at1yr),
              fmtBucket(row.at2yr),
              fmtBucket(row.at5yr),
              fmtBucket(row.at8yr),
            ]);
          }
        }
        autoTable(doc, {
          startY: afterG + 9,
          head: [["Batch Year", "Total", "1 Year", "2 Years", "5 Years", "8 Years"]],
          body: deptBody,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [30, 41, 82] },
          columnStyles: {
            0: { halign: "center" },
            1: { halign: "center" },
            2: { halign: "center" },
            3: { halign: "center" },
            4: { halign: "center" },
            5: { halign: "center" },
          },
          margin: { left: 14, right: 14 },
        });
      }
    }

    // Footer note — page 1
    const afterLast = (doc as any).lastAutoTable.finalY;
    if (afterLast < 275) {
      doc.setFontSize(7); doc.setTextColor(120);
      doc.text(
        "Course-aligned placement is determined by job title keyword matching against the graduate\u2019s program of study.",
        14, 285
      );
      doc.setTextColor(0);
    }

    // ── Page 2+: Alumni Registry ──────────────────────────────────────
    doc.addPage();
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Alumni Registry", 14, 20);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text(`Program: ${filterLabel}  |  Batch: ${batchLabel}  |  Total: ${results.length}`, 14, 27);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 31,
      head: [["No.", "Name", "Program", "Batch Year", "Employment Status"]],
      body: results.map((a, i) => [
        String(i + 1),
        a.displayName,
        a.course ?? "\u2014",
        a.batchYear ? String(a.batchYear) : "\u2014",
        a.isEmployed === true ? "Employed" : a.isEmployed === false ? "Unemployed" : "Not specified",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 82] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 35, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`alumnayan-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Export"
        breadcrumbs={[{ label: "Admin" }, { label: "Reports" }]}
      />

      {/* Filters */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Filter Alumni Data</h2></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Program"
              options={COE_COURSES}
              value={filters.course}
              onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}
            />
            <Select
              label="Batch Year"
              options={[{ value: "", label: "All years" }, ...BATCH_YEARS]}
              value={filters.batchYear}
              onChange={(e) => setFilters((f) => ({ ...f, batchYear: e.target.value }))}
            />
          </div>
          <Button variant="primary" onClick={handleGenerate} loading={loading}>
            Generate Report
          </Button>
        </CardBody>
      </Card>

      {/* Preview */}
      {generated && (
        <>
          {/* Employment Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Alumni</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{employmentStats.employed}</p>
              <p className="text-xs text-gray-500 mt-1">Employed</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{employmentStats.employmentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Employment Rate</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{employmentStats.unemploymentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Unemployment Rate</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{outcomeRates.recentGraduatePlacementRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Recent Graduate Placement</p>
              <p className="text-[10px] text-gray-400">Course-aligned · 0–2 yrs</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
              <p className="text-2xl font-bold text-teal-700">{outcomeRates.midCareerAlignmentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Mid-Career Alignment</p>
              <p className="text-[10px] text-gray-400">Course-aligned · 3–5 yrs</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
              <p className="text-2xl font-bold text-indigo-700">{outcomeRates.establishedCareerAlignmentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Established Career</p>
              <p className="text-[10px] text-gray-400">Course-aligned · 6+ yrs</p>
            </div>
          </div>

          {cohortRows.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <h2 className="font-semibold text-gray-900">Cohort Outcomes by Batch Year</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Employment &amp; course-alignment based on current/present employment status
                  </p>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">5-yr Eval Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Years Out</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employed</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employment Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course-Aligned</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alignment Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cohortRows.map((row) => (
                        <tr key={row.batchYear} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{row.evalYear}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{row.yearsOut} yrs</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{row.total}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{row.employed}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-green-700">{row.employmentRate}%</td>
                          <td className="px-4 py-3 text-xs text-gray-600">{row.aligned}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-indigo-700">{row.alignmentRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {intervalOutcomes.some((r) => r.at1yr.responded > 0 || r.at2yr.responded > 0 || r.at5yr.responded > 0 || r.at8yr.responded > 0) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h2 className="font-semibold text-gray-900">Employment Outcomes by Year Interval</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Employment rate at 1, 2, 5, and 8 years after graduation (based on survey responses)
                    </p>
                  </div>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${intervalView === "batch" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                      onClick={() => setIntervalView("batch")}
                    >
                      By Batch Year
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${intervalView === "dept" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                      onClick={() => setIntervalView("dept")}
                    >
                      By Department
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch Year</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">1 Year</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">2 Years</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">5 Years</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">8 Years</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {intervalView === "batch" ? (
                        intervalOutcomes.map((row) => (
                          <tr key={row.batchYear} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                            <td className="px-4 py-3 text-center text-xs text-gray-600">{row.total}</td>
                            {([row.at1yr, row.at2yr, row.at5yr, row.at8yr] as IntervalBucket[]).map((b, i) => (
                              <td key={i} className="px-4 py-3 text-center text-xs">
                                {b.responded > 0 ? (
                                  <span className="font-semibold text-green-700">
                                    {b.rate}% <span className="font-normal text-gray-400">({b.employed}/{b.responded})</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-300">&mdash;</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        intervalByDept.map((dept) => (
                          <React.Fragment key={dept.course}>
                            <tr className="bg-indigo-50">
                              <td colSpan={6} className="px-4 py-2.5 text-xs font-bold text-indigo-900">
                                {dept.label}
                              </td>
                            </tr>
                            {dept.rows.map((row) => (
                              <tr key={`${dept.course}-${row.batchYear}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 pl-8 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                                <td className="px-4 py-3 text-center text-xs text-gray-600">{row.total}</td>
                                {([row.at1yr, row.at2yr, row.at5yr, row.at8yr] as IntervalBucket[]).map((b, i) => (
                                  <td key={i} className="px-4 py-3 text-center text-xs">
                                    {b.responded > 0 ? (
                                      <span className="font-semibold text-green-700">
                                        {b.rate}% <span className="font-normal text-gray-400">({b.employed}/{b.responded})</span>
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">&mdash;</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

        {waitingTimeRows.some((r) => r.count > 0) && (
          <Card>
            <CardHeader>
              <div>
                <h2 className="font-semibold text-gray-900">Time to First Job After Graduation</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Distribution of how long alumni took to land their first job
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <WaitingTimeChart data={waitingTimeRows} />
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-gray-900">College Goals</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                PEO-to-College Goal mapping — count and percentage of graduates qualifying per goal
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program Educational Objective</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      <span className="block">Goal 1</span>
                      <span className="block font-normal normal-case text-gray-400">Global Context</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      <span className="block">Goal 2</span>
                      <span className="block font-normal normal-case text-gray-400">Research / Innovation / Industry</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      <span className="block">Goal 3</span>
                      <span className="block font-normal normal-case text-gray-400">Community / Extension / Sustainability</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">
                      <span className="font-semibold">PEO 1</span> — Graduates shall demonstrate professional competence by applying advanced knowledge and skills in their respective fields, contributing to academic and industry excellence through innovation, research, and continuous learning in both local and global contexts.
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal1.count} ({collegeGoals.goal1.percentage}%)
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal2.count} ({collegeGoals.goal2.percentage}%)
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-300">—</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">
                      <span className="font-semibold">PEO 2</span> — Graduates shall exhibit moral integrity, ethical values, and social responsibility by addressing community needs, promoting inclusivity, and upholding professional and societal ethics in their personal and professional undertakings.
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal1.count} ({collegeGoals.goal1.percentage}%)
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-300">—</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal3.count} ({collegeGoals.goal3.percentage}%)
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-xs">
                      <span className="font-semibold">PEO 3</span> — Graduates shall engage in innovative research, technological advancement, and extension services that promote environmental sustainability, resource regeneration, and community empowerment in support of national and global development.
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-300">—</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal2.count} ({collegeGoals.goal2.percentage}%)
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">
                      {collegeGoals.goal3.count} ({collegeGoals.goal3.percentage}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-gray-900">Program Educational Objectives (POE)</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Classification of graduates by POE — total count and percentage
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">POE</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">POE 1</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Professional &amp; Technical Competence</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe1.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe1.percentage}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">POE 2</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Ethical, Social &amp; Leadership Responsibility</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe2.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe2.percentage}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">POE 3</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Innovation, Research &amp; Sustainability</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe3.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{poeStats.poe3.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-gray-900">Graduate Attributes (GA)</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Classification of graduates by GA — total count and percentage
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">GA 1</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Professional &amp; Technical Competence</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe1.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe1.percentage}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">GA 2</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Ethical, Social, and Leadership Responsibility</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe2.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe2.percentage}%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">GA 3</td>
                    <td className="px-4 py-3 text-xs text-gray-700">Innovation, Research, and Sustainability Orientation</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe3.count}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-indigo-700">{gaStats.poe3.percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">Preview</h2>
                <Badge variant="navy">{results.length} alumni</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Table size={14} />}
                  onClick={exportCSV}
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FileDown size={14} />}
                  onClick={exportPDF}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer size={14} />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {results.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">No alumni match the selected filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Program</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Profile</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((a, i) => (
                      <tr key={a.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar src={a.photoURL} name={a.displayName} size="xs" />
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{a.displayName}</p>
                              <p className="text-[10px] text-gray-500">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{a.course ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{batchYearLabel(a.batchYear)}</td>
                        <td className="px-4 py-3">
                          {a.isEmployed === true ? (
                            <Badge variant="success" className="text-[10px]">Employed</Badge>
                          ) : a.isEmployed === false ? (
                            <Badge variant="error" className="text-[10px]">Unemployed</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">Not set</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={a.profileComplete >= 80 ? "success" : a.profileComplete >= 40 ? "warning" : "error"} className="text-[10px]">
                            {a.profileComplete}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
        </>
      )}
    </div>
  );
}
