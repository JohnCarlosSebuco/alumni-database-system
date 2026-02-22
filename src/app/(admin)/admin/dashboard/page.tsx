"use client";

import React, { useEffect, useState } from "react";
import { Users, Briefcase, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import {
  db, collection, query, where, getDocs, orderBy, limit,
} from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmploymentChart } from "@/components/dashboard/EmploymentChart";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { UserDoc } from "@/lib/types/alumni.types";

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ alumni: 0, jobs: 0, events: 0, employmentRate: 0, unemploymentRate: 0 });
  const [recentAlumni, setRecentAlumni] = useState<UserDoc[]>([]);
  const [deptData, setDeptData] = useState<{ name: string; value: number }[]>([]);
  const [empData, setEmpData] = useState<{ department: string; employed: number; total: number }[]>([]);

  useEffect(() => {
    async function load() {
      const [alumniSnap, jobsSnap, eventsSnap, recentSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "==", "alumni"))),
        getDocs(collection(db, "jobs")),
        getDocs(collection(db, "events")),
        getDocs(query(collection(db, "users"), where("role", "==", "alumni"), orderBy("createdAt", "desc"), limit(5))),
      ]);

      const alumniDocs = alumniSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc));
      const employedCount = alumniDocs.filter((a) => a.isEmployed === true).length;
      const totalAlumni = alumniDocs.length;
      const employmentRate = totalAlumni > 0 ? Math.round((employedCount / totalAlumni) * 100) : 0;
      const unemploymentRate = totalAlumni > 0 ? 100 - employmentRate : 0;

      // Course breakdown (BSIE, BSECE, BSME)
      const deptMap: Record<string, number> = {};
      alumniDocs.forEach((a) => {
        const label = a.course ?? a.department ?? "Unknown";
        deptMap[label] = (deptMap[label] ?? 0) + 1;
      });
      const deptArr = Object.entries(deptMap).slice(0, 8).map(([name, value]) => ({ name, value }));

      // Employment by course
      const empMap: Record<string, { employed: number; total: number }> = {};
      alumniDocs.forEach((a) => {
        const dept = a.course?.replace("Bachelor of Science in ", "BS ") ?? a.department?.slice(0, 12) ?? "Other";
        if (!empMap[dept]) empMap[dept] = { employed: 0, total: 0 };
        empMap[dept].total++;
        if (a.isEmployed === true) empMap[dept].employed++;
      });
      const empArr = Object.entries(empMap).slice(0, 6).map(([department, v]) => ({ department, ...v }));

      setStats({
        alumni: alumniSnap.size,
        jobs: jobsSnap.size,
        events: eventsSnap.size,
        employmentRate,
        unemploymentRate,
      });
      setRecentAlumni(recentSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
      setDeptData(deptArr);
      setEmpData(empArr);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]} />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Total Alumni" value={stats.alumni} icon={<Users size={24} />} iconBg="bg-navy-100 text-navy-800" />
        <KPICard title="Active Jobs" value={stats.jobs} icon={<Briefcase size={24} />} iconBg="bg-blue-100 text-blue-700" />
        <KPICard title="Events" value={stats.events} icon={<Calendar size={24} />} iconBg="bg-purple-100 text-purple-700" />
        <KPICard title="Employment Rate" value={stats.employmentRate} suffix="%" icon={<TrendingUp size={24} />} iconBg="bg-green-100 text-green-700" />
        <KPICard title="Unemployment Rate" value={stats.unemploymentRate} suffix="%" icon={<TrendingDown size={24} />} iconBg="bg-red-100 text-red-600" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Alumni by Department</h2></CardHeader>
          <CardBody>
            <DepartmentChart data={deptData.length ? deptData : [{ name: "No data", value: 1 }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Employment by Dept</h2></CardHeader>
          <CardBody>
            <EmploymentChart data={empData.length ? empData : [{ department: "No data", employed: 0, total: 0 }]} />
          </CardBody>
        </Card>
      </div>

      {/* Recent Alumni */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Recent Sign-ups</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {recentAlumni.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500 text-center">No alumni yet.</p>
            ) : recentAlumni.map((a) => (
              <div key={a.uid} className="flex items-center gap-4 px-6 py-4">
                <Avatar src={a.photoURL} name={a.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{a.department} · Batch {a.batchYear}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={a.profileComplete > 50 ? "success" : "warning"}>
                    {a.profileComplete}%
                  </Badge>
                  <span className="text-xs text-gray-400">{formatRelativeTime(a.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
