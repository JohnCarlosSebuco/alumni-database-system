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
import { computeOutcomeRates } from "@/lib/utils/courseAlignment";
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
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AlumNayan — Alumni Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")} · Total: ${results.length} alumni`, 14, 28);
    doc.text(`Employment Rate: ${employmentStats.employmentRate}%  ·  Unemployment Rate: ${employmentStats.unemploymentRate}%`, 14, 35);
    doc.text(`Recent Graduate Course-Aligned Placement: ${outcomeRates.recentGraduatePlacementRate}% (${outcomeRates.recentAligned}/${outcomeRates.recentTotal})`, 14, 42);
    doc.text(`Mid-Career Course-Aligned Rate (3–5 yrs): ${outcomeRates.midCareerAlignmentRate}% (${outcomeRates.midCareerAligned}/${outcomeRates.midCareerTotal})`, 14, 49);

    let y = 58;
    doc.setFontSize(9);
    results.forEach((a, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const empStatus = a.isEmployed === true ? "Employed" : a.isEmployed === false ? "Unemployed" : "—";
      doc.text(`${i + 1}. ${a.displayName} · ${a.course ?? a.department ?? "—"} · Batch ${a.batchYear ?? "—"} · ${empStatus}`, 14, y);
      y += 7;
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <p className="text-[10px] text-gray-400">Course-aligned · last 2 yrs</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
              <p className="text-2xl font-bold text-teal-700">{outcomeRates.midCareerAlignmentRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Mid-Career Alignment</p>
              <p className="text-[10px] text-gray-400">Course-aligned · 3–5 yrs</p>
            </div>
          </div>

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
                        <td className="px-4 py-3 text-xs text-gray-600">{a.course ?? a.department ?? "—"}</td>
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
