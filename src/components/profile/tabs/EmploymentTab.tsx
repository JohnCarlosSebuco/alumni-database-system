import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { AlumniProfile } from "@/lib/types/alumni.types";
import { formatDate } from "@/lib/utils/formatters";

interface Props { profile: AlumniProfile }

export function EmploymentTab({ profile }: Props) {
  const emp = profile.currentEmployment;
  if (!emp) return <p className="text-sm text-gray-500">No employment data.</p>;

  return (
    <div className="rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant={emp.isEmployed ? "success" : "warning"}>
          {emp.isEmployed ? "Currently Employed" : "Not Currently Employed"}
        </Badge>
      </div>
      {emp.isEmployed && (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            ["Employer",    emp.employerName],
            ["Position",    emp.position],
            ["Industry",    emp.industry],
            ["Type",        emp.employmentType],
            ["Start Date",  emp.startDate ? formatDate(emp.startDate) : "—"],
            ["City",        emp.city],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{value || "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
