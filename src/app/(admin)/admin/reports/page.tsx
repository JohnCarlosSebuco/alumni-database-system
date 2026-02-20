"use client";

import React, { useState } from "react";
import { FileDown, Table } from "lucide-react";
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
import type { UserDoc } from "@/lib/types/alumni.types";

export const dynamic = 'force-dynamic';

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

export default function ReportsPage() {
  const { error: toastError } = useToast();
  const [filters, setFilters] = useState({ department: "", batchYear: "", role: "alumni" });
  const [results, setResults] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const constraints: Parameters<typeof where>[] = [
        ["role", "==", "alumni"],
      ];
      if (filters.department) constraints.push(["department", "==", filters.department]);
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

    let y = 40;
    doc.setFontSize(9);
    results.forEach((a, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}. ${a.displayName} · ${a.department ?? "—"} · Batch ${a.batchYear ?? "—"} · ${a.profileComplete}%`, 14, y);
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
            <Input
              label="Department"
              placeholder="e.g. College of Engineering"
              value={filters.department}
              onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
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
                        <td className="px-4 py-3 text-xs text-gray-600">{a.department ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{batchYearLabel(a.batchYear)}</td>
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
      )}
    </div>
  );
}
