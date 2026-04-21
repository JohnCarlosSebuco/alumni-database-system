"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAlumni } from "@/lib/hooks/useAlumni";
import {
  isPOE1,
  isPOE2,
  isPOE3,
  isGlobalContext,
  isLeadershipManagement,
  isCommunityExtension,
  isResearchInnovation,
  isResearchIndustry,
  isCourseAligned,
} from "@/lib/utils/courseAlignment";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import type { UserDoc } from "@/lib/types/alumni.types";
import { cn } from "@/lib/utils/cn";

export default function VerifyMetricsPage() {
  const { alumni, loading } = useAlumni();
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = React.useState("poe1");

  const stats = useMemo(() => {
    if (!alumni.length) return null;

    const total = alumni.length;
    const poe1 = alumni.filter(isPOE1);
    const poe2 = alumni.filter(isPOE2);
    const poe3 = alumni.filter(isPOE3);

    const recent = alumni.filter(
      (a) => a.batchYear != null && a.batchYear >= currentYear - 2
    );
    const midCareer = alumni.filter(
      (a) =>
        a.batchYear != null &&
        a.batchYear >= currentYear - 5 &&
        a.batchYear <= currentYear - 3
    );
    const established = alumni.filter(
      (a) => a.batchYear != null && a.batchYear <= currentYear - 6
    );

    const isAlignedForOutcome = (a: UserDoc) => {
      if (!a.isEmployed) return false;
      if (typeof a.courseAligned === "boolean") return a.courseAligned;
      return isCourseAligned(a.currentPosition ?? "", a.course ?? "");
    };

    return {
      total,
      poe1: {
        data: poe1,
        count: poe1.length,
        pct: Math.round((poe1.length / total) * 100),
      },
      poe2: {
        data: poe2,
        count: poe2.length,
        pct: Math.round((poe2.length / total) * 100),
      },
      poe3: {
        data: poe3,
        count: poe3.length,
        pct: Math.round((poe3.length / total) * 100),
      },
      recent: {
        data: recent,
        aligned: recent.filter(isAlignedForOutcome),
        total: recent.length,
      },
      midCareer: {
        data: midCareer,
        aligned: midCareer.filter(isAlignedForOutcome),
        total: midCareer.length,
      },
      established: {
        data: established,
        aligned: established.filter(isAlignedForOutcome),
        total: established.length,
      },
      isAlignedForOutcome,
    };
  }, [alumni, currentYear]);

  const getPOE1Reason = (a: UserDoc): string => {
    const reasons = [];
    if (a.courseAligned === true) reasons.push("courseAligned = true");
    else if (isCourseAligned(a.currentPosition ?? "", a.course ?? ""))
      reasons.push(`keyword match: "${a.currentPosition}"`);
    if (a.isAbroad === true) reasons.push("isAbroad = true");
    else if (isGlobalContext(a)) reasons.push("abroad keyword in address");
    return reasons.join(" + ") || "matched POE1";
  };

  const getPOE2Reason = (a: UserDoc): string => {
    const reasons = [];
    if (isLeadershipManagement(a)) reasons.push("leadership role");
    if (isCommunityExtension(a)) {
      if (a.communityExtensionRaw?.toLowerCase().startsWith("yes"))
        reasons.push('communityExtensionRaw = "yes"');
      else reasons.push("community keyword in position");
    }
    return reasons.join(" + ") || "matched POE2";
  };

  const getPOE3Reason = (a: UserDoc): string => {
    const reasons = [];
    if (isResearchInnovation(a)) {
      if (a.researchRaw?.toLowerCase().startsWith("yes"))
        reasons.push('researchRaw = "yes"');
      else reasons.push("research keyword in position");
    }
    if (isResearchIndustry(a)) reasons.push(`industry: "${a.industryType}"`);
    return reasons.join(" + ") || "matched POE3";
  };

  const exportPDF = async () => {
    if (!stats) return;
    const { jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    let startY = 14;

    doc.setFontSize(16);
    doc.text("Metrics Verification Report", 14, startY);
    startY += 8;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, startY);
    startY += 6;
    doc.text(`Total Alumni: ${stats.total}`, 14, startY);
    startY += 10;

    // POE1 Table
    doc.setFontSize(12);
    doc.text(`POE1 / GA1: Professional & Technical Competence`, 14, startY);
    startY += 6;
    autoTable(doc, {
      startY,
      head: [["Name", "Course", "Batch Year", "Position", "Match Reason"]],
      body: stats.poe1.data.map((a) => [
        a.displayName ?? a.email,
        a.course ?? "-",
        a.batchYear ?? "-",
        a.currentPosition ?? "-",
        getPOE1Reason(a),
      ]),
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;

    // POE2 Table
    doc.setFontSize(12);
    doc.text(
      `POE2 / GA2: Ethical, Social & Leadership Responsibility`,
      14,
      startY
    );
    startY += 6;
    autoTable(doc, {
      startY,
      head: [["Name", "Course", "Batch Year", "Position", "Match Reason"]],
      body: stats.poe2.data.map((a) => [
        a.displayName ?? a.email,
        a.course ?? "-",
        a.batchYear ?? "-",
        a.currentPosition ?? "-",
        getPOE2Reason(a),
      ]),
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;

    // POE3 Table
    doc.setFontSize(12);
    doc.text(
      `POE3 / GA3: Innovation, Research & Sustainability`,
      14,
      startY
    );
    startY += 6;
    autoTable(doc, {
      startY,
      head: [["Name", "Course", "Batch Year", "Position", "Match Reason"]],
      body: stats.poe3.data.map((a) => [
        a.displayName ?? a.email,
        a.course ?? "-",
        a.batchYear ?? "-",
        a.currentPosition ?? "-",
        getPOE3Reason(a),
      ]),
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });

    doc.addPage();
    startY = 14;

    // Outcome Rates
    doc.setFontSize(14);
    doc.text("Course-Aligned Employment Outcome Rates", 14, startY);
    startY += 10;

    const outcomeLabel = (label: string, aligned: number, total: number) => {
      const pct = total > 0 ? Math.round((aligned / total) * 100) : 0;
      return `${label}: ${aligned}/${total} = ${pct}%`;
    };

    doc.setFontSize(11);
    doc.text(outcomeLabel("Recent Graduate (0–2 yrs)", stats.recent.aligned.length, stats.recent.total), 14, startY);
    startY += 8;
    autoTable(doc, {
      startY,
      head: [["Status", "Name", "Batch Year", "Position", "Course"]],
      body: [
        ...stats.recent.aligned.map((a) => [
          "✓ Aligned",
          a.displayName ?? a.email,
          a.batchYear ?? "-",
          a.currentPosition ?? "-",
          a.course ?? "-",
        ]),
        ...stats.recent.data
          .filter((a) => !stats.isAlignedForOutcome(a))
          .map((a) => [
            "✗ Not Aligned",
            a.displayName ?? a.email,
            a.batchYear ?? "-",
            a.currentPosition ?? "-",
            a.course ?? "-",
          ]),
      ],
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(outcomeLabel("Mid-Career (3–5 yrs)", stats.midCareer.aligned.length, stats.midCareer.total), 14, startY);
    startY += 8;
    autoTable(doc, {
      startY,
      head: [["Status", "Name", "Batch Year", "Position", "Course"]],
      body: [
        ...stats.midCareer.aligned.map((a) => [
          "✓ Aligned",
          a.displayName ?? a.email,
          a.batchYear ?? "-",
          a.currentPosition ?? "-",
          a.course ?? "-",
        ]),
        ...stats.midCareer.data
          .filter((a) => !stats.isAlignedForOutcome(a))
          .map((a) => [
            "✗ Not Aligned",
            a.displayName ?? a.email,
            a.batchYear ?? "-",
            a.currentPosition ?? "-",
            a.course ?? "-",
          ]),
      ],
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(outcomeLabel("Established Career (6+ yrs)", stats.established.aligned.length, stats.established.total), 14, startY);
    startY += 8;
    autoTable(doc, {
      startY,
      head: [["Status", "Name", "Batch Year", "Position", "Course"]],
      body: [
        ...stats.established.aligned.map((a) => [
          "✓ Aligned",
          a.displayName ?? a.email,
          a.batchYear ?? "-",
          a.currentPosition ?? "-",
          a.course ?? "-",
        ]),
        ...stats.established.data
          .filter((a) => !stats.isAlignedForOutcome(a))
          .map((a) => [
            "✗ Not Aligned",
            a.displayName ?? a.email,
            a.batchYear ?? "-",
            a.currentPosition ?? "-",
            a.course ?? "-",
          ]),
      ],
      margin: 14,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: [255, 255, 255] },
    });

    doc.save(`metrics-verification-${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No alumni data found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link href="/admin/reports">
        <Button variant="outline" className="mb-6">
          <ChevronLeft size={16} className="mr-1" />
          Back to Reports
        </Button>
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Metrics Verification & Audit
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Denominator = all alumni (including unemployed). Percentages are
            computed independently per category — they do not sum to 100%. Each
            row shows the specific reason why an alumni was counted.
          </p>
          <p className="text-xs text-gray-500 mt-3 italic">
            Click on each tab below to see which Excel columns feed each metric,
            how they are processed, and the complete list of alumni counted in
            each category.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="primary" onClick={exportPDF}>
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "poe1", label: "POE1 / GA1" },
          { key: "poe2", label: "POE2 / GA2" },
          { key: "poe3", label: "POE3 / GA3" },
          { key: "outcomes", label: "Outcome Rates" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "poe1" && (
          <POETab1 stats={stats} getReason={getPOE1Reason} />
        )}
        {activeTab === "poe2" && (
          <POETab2 stats={stats} getReason={getPOE2Reason} />
        )}
        {activeTab === "poe3" && (
          <POETab3 stats={stats} getReason={getPOE3Reason} />
        )}
        {activeTab === "outcomes" && (
          <OutcomeRatesTab stats={stats} currentYear={currentYear} />
        )}
      </div>
    </div>
  );
}

function POETab1({
  stats,
  getReason,
}: {
  stats: any;
  getReason: (a: UserDoc) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Column Details */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Excel Columns Used</h3>
        </CardHeader>
        <CardBody className="text-sm text-blue-800 space-y-2">
          <div>
            <span className="font-semibold">Column 16:</span> "Are you presently employed?" → GATE (must be "yes")
          </div>
          <div>
            <span className="font-semibold">Column 23:</span> "Is your first job related to course?" → If "yes", alumni is counted (highest priority)
          </div>
          <div>
            <span className="font-semibold">Column 18:</span> "Present Position / Designation" → Keyword-matched against IE/ECE/ME keywords if column 23 is blank
          </div>
          <div>
            <span className="font-semibold">Column 12:</span> "Degree and Program / Course Taken" → Determines which keyword list (IE, ECE, or ME)
          </div>
          <div>
            <span className="font-semibold">Column 21:</span> "Company / Organization Address" → Scanned for country names (USA, Canada, Singapore, UAE, etc.)
          </div>
          <div>
            <span className="font-semibold">Column 7:</span> "Locality of Residence" → Scanned for country names if column 21 is blank
          </div>
        </CardBody>
      </Card>

      {/* Processing Logic */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Processing Logic</h3>
        </CardHeader>
        <CardBody className="text-sm text-amber-800 space-y-2">
          <div className="font-semibold">For each Excel row:</div>
          <div className="ml-4 space-y-1">
            <div><span className="font-semibold">1.</span> Check column 16 — if NOT "yes", skip row</div>
            <div><span className="font-semibold">2.</span> Check column 23 — if "yes", <span className="text-green-700 font-semibold">COUNT ✓</span></div>
            <div><span className="font-semibold">3.</span> If column 23 is blank, check column 18 for IE/ECE/ME keywords based on column 12</div>
            <div className="ml-4 text-xs">
              • <span className="font-semibold">IE:</span> logistics, supply chain, production, quality, manufacturing, etc.
              <br/>
              • <span className="font-semibold">ECE:</span> telecom, electronics, semiconductor, embedded, automation, etc.
              <br/>
              • <span className="font-semibold">ME:</span> mechanical, maintenance, HVAC, fabrication, welding, etc.
            </div>
            <div><span className="font-semibold">4.</span> Check columns 21 + 7 for country names — if found, <span className="text-green-700 font-semibold">COUNT ✓</span></div>
          </div>
        </CardBody>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Professional & Technical Competence
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                An alumni counts if employed AND (job title matches course
                keywords OR courseAligned=true) OR (isAbroad=true OR
                locality/companyAddress contains a foreign country).
              </p>
            </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-navy-800">
              {stats.poe1.count}
            </div>
            <div className="text-sm text-gray-600">
              {stats.poe1.pct}% of {stats.total} alumni
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Batch Year
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Employment Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Current Position
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Category Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.poe1.data.map((a: UserDoc) => (
                <tr key={a.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {a.displayName || a.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{a.course || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.batchYear || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.isEmployed === true && <Badge variant="success" className="text-xs">Employed</Badge>}
                    {a.isEmployed === false && <Badge variant="error" className="text-xs">Not Employed</Badge>}
                    {a.isEmployed === undefined && <Badge variant="warning" className="text-xs">Not Set</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.currentPosition || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {a.courseAligned === true && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">
                          ✓ Column 23: "job related to course" = Yes
                        </span>
                      )}
                      {a.courseAligned !== true && isCourseAligned(a.currentPosition ?? "", a.course ?? "") && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-300">
                          ✓ Column 18: Position keyword match
                        </span>
                      )}
                      {isGlobalContext(a) && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-300">
                          ✓ Column 21/7: Abroad address/location
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
    </div>
  );
}

function POETab2({
  stats,
  getReason,
}: {
  stats: any;
  getReason: (a: UserDoc) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Column Details */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-green-900 mb-2">Excel Columns Used</h3>
        </CardHeader>
        <CardBody className="text-sm text-green-800 space-y-2">
          <div>
            <span className="font-semibold">Column 16:</span> "Are you presently employed?" → GATE (must be "yes")
          </div>
          <div>
            <span className="font-semibold">Column 18:</span> "Present Position / Designation" → Keyword-matched for leadership roles (manager, director, supervisor, lead, etc.) OR community keywords
          </div>
          <div>
            <span className="font-semibold">Column 30:</span> "Have you participated in community extension, outreach, or volunteer programs?" → If starts with "yes", alumni is counted
          </div>
        </CardBody>
      </Card>

      {/* Processing Logic */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Processing Logic</h3>
        </CardHeader>
        <CardBody className="text-sm text-amber-800 space-y-2">
          <div className="font-semibold">For each Excel row:</div>
          <div className="ml-4 space-y-1">
            <div><span className="font-semibold">1.</span> Check column 16 — if NOT "yes", skip row</div>
            <div><span className="font-semibold">2.</span> Check column 18 for leadership keywords: manager, director, supervisor, chief, president, ceo, cto, lead, etc. → If found, <span className="text-green-700 font-semibold">COUNT ✓</span></div>
            <div><span className="font-semibold">3.</span> Check column 30 — if starts with "yes", <span className="text-green-700 font-semibold">COUNT ✓</span></div>
            <div><span className="font-semibold">4.</span> If column 30 is blank, check column 18 for community keywords: community, extension, volunteer, outreach, ngo, doh, dole, barangay, welfare, public service, etc. → If found, <span className="text-green-700 font-semibold">COUNT ✓</span></div>
          </div>
        </CardBody>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Ethical, Social & Leadership Responsibility
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                An alumni counts if employed AND (position contains leadership
                title) OR (communityExtensionRaw starts with "yes" OR position
                contains community/outreach keywords).
              </p>
            </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-navy-800">
              {stats.poe2.count}
            </div>
            <div className="text-sm text-gray-600">
              {stats.poe2.pct}% of {stats.total} alumni
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Batch Year
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Employment Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Current Position
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Category Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.poe2.data.map((a: UserDoc) => (
                <tr key={a.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {a.displayName || a.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{a.course || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.batchYear || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.isEmployed === true && <Badge variant="success" className="text-xs">Employed</Badge>}
                    {a.isEmployed === false && <Badge variant="error" className="text-xs">Not Employed</Badge>}
                    {a.isEmployed === undefined && <Badge variant="warning" className="text-xs">Not Set</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.currentPosition || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {isLeadershipManagement(a) && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">
                          ✓ Column 18: Leadership role detected
                        </span>
                      )}
                      {a.communityExtensionRaw?.toLowerCase().startsWith("yes") && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-300">
                          ✓ Column 30: "community extension" = Yes
                        </span>
                      )}
                      {!isLeadershipManagement(a) && !a.communityExtensionRaw?.toLowerCase().startsWith("yes") && isCommunityExtension(a) && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-300">
                          ✓ Column 18: Community keyword match
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
    </div>
  );
}

function POETab3({
  stats,
  getReason,
}: {
  stats: any;
  getReason: (a: UserDoc) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Column Details */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">Excel Columns Used</h3>
        </CardHeader>
        <CardBody className="text-sm text-purple-800 space-y-2">
          <div>
            <span className="font-semibold">Column 16:</span> "Are you presently employed?" → GATE (must be "yes")
          </div>
          <div>
            <span className="font-semibold">Column 28:</span> "Have you participated in research, innovations, or major projects?" → If starts with "yes", alumni is counted
          </div>
          <div>
            <span className="font-semibold">Column 18:</span> "Present Position / Designation" → Keyword-matched for research/innovation roles if column 28 is blank
          </div>
          <div>
            <span className="font-semibold">Column 23:</span> "Major line of business of the company" → Keyword-matched for tech/research industry (software, biotech, semiconductor, ai, etc.)
          </div>
        </CardBody>
      </Card>

      {/* Processing Logic */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Processing Logic</h3>
        </CardHeader>
        <CardBody className="text-sm text-amber-800 space-y-2">
          <div className="font-semibold">For each Excel row:</div>
          <div className="ml-4 space-y-1">
            <div><span className="font-semibold">1.</span> Check column 16 — if NOT "yes", skip row</div>
            <div><span className="font-semibold">2.</span> Check column 28 — if starts with "yes", <span className="text-green-700 font-semibold">COUNT ✓</span></div>
            <div><span className="font-semibold">3.</span> If column 28 is blank, check column 18 for research keywords: research, r&d, scientist, professor, data scientist, innovation, laboratory, etc. → If found, <span className="text-green-700 font-semibold">COUNT ✓</span></div>
            <div><span className="font-semibold">4.</span> Check column 23 for tech/research industry keywords: technology, software, engineering, biotech, ai, machine learning, semiconductor, etc. → If found, <span className="text-green-700 font-semibold">COUNT ✓</span></div>
          </div>
        </CardBody>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Innovation, Research & Sustainability
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                An alumni counts if employed AND (researchRaw starts with "yes" OR
                position contains research keywords) OR (industryType contains
                research/tech keywords).
              </p>
            </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-navy-800">
              {stats.poe3.count}
            </div>
            <div className="text-sm text-gray-600">
              {stats.poe3.pct}% of {stats.total} alumni
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Batch Year
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Employment Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Current Position
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Industry Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Category Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.poe3.data.map((a: UserDoc) => (
                <tr key={a.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {a.displayName || a.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{a.course || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.batchYear || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.isEmployed === true && <Badge variant="success" className="text-xs">Employed</Badge>}
                    {a.isEmployed === false && <Badge variant="error" className="text-xs">Not Employed</Badge>}
                    {a.isEmployed === undefined && <Badge variant="warning" className="text-xs">Not Set</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.currentPosition || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {a.industryType || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {a.researchRaw?.toLowerCase().startsWith("yes") && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">
                          ✓ Column 28: "research/innovation" = Yes
                        </span>
                      )}
                      {!a.researchRaw?.toLowerCase().startsWith("yes") && isResearchInnovation(a) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-300">
                          ✓ Column 18: Research keyword match
                        </span>
                      )}
                      {isResearchIndustry(a) && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-300">
                          ✓ Column 23: Tech/research industry
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
    </div>
  );
}

function OutcomeRatesTab({ stats, currentYear }: { stats: any; currentYear: number }) {
  const CohortTable = ({
    label,
    batchYearLabel,
    aligned,
    notAligned,
  }: {
    label: string;
    batchYearLabel: string;
    aligned: UserDoc[];
    notAligned: UserDoc[];
  }) => {
    const total = aligned.length + notAligned.length;
    const pct = total > 0 ? Math.round((aligned.length / total) * 100) : 0;

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-600 mt-1">
                batchYear {batchYearLabel}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-navy-800">
                {aligned.length} / {total}
              </div>
              <div className="text-sm text-gray-600">{pct}% aligned</div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3">
                ✓ Aligned ({aligned.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 border-b border-green-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-green-800">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-green-800">
                        Position
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-green-800">
                        Why Aligned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {aligned.map((a) => (
                      <tr key={a.uid} className="hover:bg-green-50">
                        <td className="px-3 py-2 text-gray-900 text-xs font-medium">
                          {a.displayName || a.email}
                        </td>
                        <td className="px-3 py-2 text-gray-600 text-xs">
                          {a.currentPosition || "-"}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {a.courseAligned === true ? (
                            <span className="text-green-700 font-semibold">Column 23: Yes</span>
                          ) : (
                            <span className="text-green-700 font-semibold">Column 18: Keyword match</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-red-700 mb-3">
                ✗ Not Aligned ({notAligned.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-red-800">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-red-800">
                        Position
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-red-800">
                        Employment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {notAligned.map((a) => (
                      <tr key={a.uid} className="hover:bg-red-50">
                        <td className="px-3 py-2 text-gray-900 text-xs font-medium">
                          {a.displayName || a.email}
                        </td>
                        <td className="px-3 py-2 text-gray-600 text-xs">
                          {a.currentPosition || "-"}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {!a.isEmployed ? (
                            <span className="text-red-700 font-semibold">Column 16: Not employed</span>
                          ) : (
                            <span className="text-red-700 font-semibold">No keyword match</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Column Details */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">Excel Columns Used</h3>
        </CardHeader>
        <CardBody className="text-sm text-indigo-800 space-y-2">
          <div>
            <span className="font-semibold">Column 14:</span> "Batch" (graduation year) → Splits alumni into 3 cohorts: 0-2 yrs out (≥2024), 3-5 yrs (2021-2023), 6+ yrs (≤2020)
          </div>
          <div>
            <span className="font-semibold">Column 16:</span> "Are you presently employed?" → GATE (must be "yes" to be "aligned")
          </div>
          <div>
            <span className="font-semibold">Column 23:</span> "Is your first job related to course?" → If "yes", alumni is aligned (highest priority)
          </div>
          <div>
            <span className="font-semibold">Column 18:</span> "Present Position / Designation" → Keyword-matched against IE/ECE/ME keywords if column 23 is blank
          </div>
          <div>
            <span className="font-semibold">Column 12:</span> "Degree and Program / Course Taken" → Determines which keyword list (IE, ECE, or ME)
          </div>
        </CardBody>
      </Card>

      {/* Processing Logic */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Processing Logic</h3>
        </CardHeader>
        <CardBody className="text-sm text-amber-800 space-y-2">
          <div className="font-semibold">Current Year: {currentYear}</div>
          <div className="mt-2 font-semibold">Step 1: Cohort Assignment (by Column 14 — Batch/Graduation Year)</div>
          <div className="ml-4 space-y-1 text-sm">
            <div>• <span className="font-semibold">Recent Graduate (0–2 yrs):</span> Batch ≥ {currentYear - 2}</div>
            <div>• <span className="font-semibold">Mid-Career (3–5 yrs):</span> Batch {currentYear - 5} to {currentYear - 3}</div>
            <div>• <span className="font-semibold">Established (6+ yrs):</span> Batch ≤ {currentYear - 6}</div>
          </div>
          <div className="mt-2 font-semibold">Step 2: Alignment Check (for employed alumni only)</div>
          <div className="ml-4 space-y-1 text-sm">
            <div><span className="font-semibold">a.</span> Check column 16 — if NOT "yes", alumni is "not aligned"</div>
            <div><span className="font-semibold">b.</span> Check column 23 — if "yes", alumni is <span className="text-green-700 font-semibold">ALIGNED ✓</span></div>
            <div><span className="font-semibold">c.</span> If column 23 is blank, check column 18 for IE/ECE/ME keywords (based on column 12) → If match, <span className="text-green-700 font-semibold">ALIGNED ✓</span></div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> "Aligned" = employed AND (courseAligned=true OR
          job title keyword matches). Alumni with no batchYear are excluded from
          all cohorts.
        </p>
      </div>

      <CohortTable
        label="Recent Graduate Placement"
        batchYearLabel={`≥ ${currentYear - 2} (0–2 years out)`}
        aligned={stats.recent.aligned}
        notAligned={stats.recent.data.filter((a: UserDoc) => !stats.isAlignedForOutcome(a))}
      />

      <CohortTable
        label="Mid-Career Alignment"
        batchYearLabel={`${currentYear - 5} to ${currentYear - 3} (3–5 years out)`}
        aligned={stats.midCareer.aligned}
        notAligned={stats.midCareer.data.filter((a: UserDoc) => !stats.isAlignedForOutcome(a))}
      />

      <CohortTable
        label="Established Career"
        batchYearLabel={`≤ ${currentYear - 6} (6+ years out)`}
        aligned={stats.established.aligned}
        notAligned={stats.established.data.filter((a: UserDoc) => !stats.isAlignedForOutcome(a))}
      />
    </div>
  );
}
