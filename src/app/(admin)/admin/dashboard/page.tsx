"use client";

import React, { useEffect, useState } from "react";
import {
  Users, Briefcase, Calendar, TrendingUp, TrendingDown,
  Target, ArrowUpRight,
} from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { format } from "date-fns";
import {
  db, collection, query, where, getDocs, orderBy, limit,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmploymentChart } from "@/components/dashboard/EmploymentChart";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoader } from "@/components/ui/Spinner";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { UserDoc } from "@/lib/types/alumni.types";
import { computeOutcomeRates, computeCohortBreakdown, computeWaitingTimeBreakdown, computeIntervalOutcomes, computeIntervalOutcomesByDept } from "@/lib/utils/courseAlignment";
import type { OutcomeRates, CohortRow, WaitingTimeRow, IntervalOutcomeRow, IntervalBucket, IntervalOutcomeByDept } from "@/lib/utils/courseAlignment";
import { WaitingTimeChart } from "@/components/dashboard/WaitingTimeChart";

export const dynamic = "force-dynamic";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  description?: string;
  tooltip?: string;
}

function MetricCard({ title, value, suffix = "", icon, iconBg, borderColor, description, tooltip }: MetricCardProps) {
  const display = useCountUp(value);
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border-l-[3px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm", borderColor)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {tooltip && <InfoTooltip text={tooltip} position="bottom" className="hidden sm:inline-flex" />}
        </div>
        <div className={cn("hidden sm:flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0", iconBg)}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          {display.toLocaleString()}{suffix}
        </p>
        {description && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "bg-navy-800" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { userDoc } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    alumni: 0, jobs: 0, events: 0,
    employmentRate: 0, unemploymentRate: 0,
    employedCount: 0,
  });
  const [outcomeRates, setOutcomeRates] = useState<OutcomeRates | null>(null);
  const [cohortRows, setCohortRows] = useState<CohortRow[]>([]);
  const [waitingTimeRows, setWaitingTimeRows] = useState<WaitingTimeRow[]>([]);
  const [recentAlumni, setRecentAlumni] = useState<UserDoc[]>([]);
  const [deptData, setDeptData] = useState<{ name: string; value: number }[]>([]);
  const [empData, setEmpData] = useState<{ department: string; employed: number; total: number }[]>([]);
  const [intervalOutcomes, setIntervalOutcomes] = useState<IntervalOutcomeRow[]>([]);
  const [intervalByDept, setIntervalByDept] = useState<IntervalOutcomeByDept[]>([]);
  const [intervalView, setIntervalView] = useState<"batch" | "dept">("batch");

  useEffect(() => {
    async function load() {
      try {
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

        const deptMap: Record<string, number> = {};
        alumniDocs.forEach((a) => {
          const label = a.course ?? "Unknown";
          deptMap[label] = (deptMap[label] ?? 0) + 1;
        });

        const empMap: Record<string, { employed: number; total: number }> = {};
        alumniDocs.forEach((a) => {
          const dept = a.course?.replace("Bachelor of Science in ", "BS ") ?? "Other";
          if (!empMap[dept]) empMap[dept] = { employed: 0, total: 0 };
          empMap[dept].total++;
          if (a.isEmployed === true) empMap[dept].employed++;
        });

        setOutcomeRates(computeOutcomeRates(alumniDocs));
        setCohortRows(computeCohortBreakdown(alumniDocs));
        setWaitingTimeRows(computeWaitingTimeBreakdown(alumniDocs));
        setIntervalOutcomes(computeIntervalOutcomes(alumniDocs));
        setIntervalByDept(computeIntervalOutcomesByDept(alumniDocs));
        setStats({
          alumni: totalAlumni,
          jobs: jobsSnap.size,
          events: eventsSnap.size,
          employmentRate,
          unemploymentRate: totalAlumni > 0 ? 100 - employmentRate : 0,
          employedCount,
        });
        setRecentAlumni(recentSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
        setDeptData(Object.entries(deptMap).slice(0, 8).map(([name, value]) => ({ name, value })));
        setEmpData(Object.entries(empMap).slice(0, 6).map(([department, v]) => ({ department, ...v })));
      } catch (err) {
        console.error("Admin dashboard failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  const firstName = userDoc?.displayName?.split(" ")[0] ?? "Admin";
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400">{getGreeting()}</p>
          <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-gray-900">{firstName}!</h1>
          <p className="mt-1 text-sm text-gray-400">{today}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 text-right">
          <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
            System online
          </span>
          <span className="text-xs text-gray-400">{stats.alumni} registered alumni</span>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Alumni"
          value={stats.alumni}
          icon={<Users size={18} />}
          iconBg="bg-navy-100 text-navy-700"
          borderColor="border-l-navy-700"
          description="registered members"
          tooltip="Total count of all registered alumni in the system."
        />
        <MetricCard
          title="Active Jobs"
          value={stats.jobs}
          icon={<Briefcase size={18} />}
          iconBg="bg-blue-100 text-blue-700"
          borderColor="border-l-blue-500"
          description="open positions"
          tooltip="Total count of all job postings in the system."
        />
        <MetricCard
          title="Events"
          value={stats.events}
          icon={<Calendar size={18} />}
          iconBg="bg-purple-100 text-purple-700"
          borderColor="border-l-purple-500"
          description="total created"
          tooltip="Total count of all events created in the system."
        />
        <MetricCard
          title="Employment Rate"
          value={stats.employmentRate}
          suffix="%"
          icon={<TrendingUp size={18} />}
          iconBg="bg-green-100 text-green-700"
          borderColor="border-l-green-500"
          description={`${stats.employedCount} employed`}
          tooltip="Percentage of alumni who are employed. Formula: (Employed alumni / Total alumni) x 100."
        />
        <MetricCard
          title="Unemployment Rate"
          value={stats.unemploymentRate}
          suffix="%"
          icon={<TrendingDown size={18} />}
          iconBg="bg-red-100 text-red-600"
          borderColor="border-l-red-400"
          description={`${stats.alumni - stats.employedCount} unemployed`}
          tooltip="Percentage of alumni who are not employed. Formula: 100 - Employment Rate."
        />
      </div>

      {/* ── Employment visual + course alignment ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Employment breakdown */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Employment Overview
                </p>
                <InfoTooltip text="Breakdown of employed vs. unemployed alumni. Employment Rate = (alumni marked employed / Total alumni) x 100." position="bottom" />
              </div>
              <p className="mt-0.5 text-base font-semibold text-gray-900">
                {stats.alumni} Alumni Total
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Employed</span>
                <span className="font-bold text-green-700">{stats.employmentRate}%</span>
              </div>
              <ProgressBar value={stats.employmentRate} color="bg-green-500" />
              <p className="mt-1 text-xs text-gray-400">{stats.employedCount} alumni</p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Unemployed</span>
                <span className="font-bold text-red-600">{stats.unemploymentRate}%</span>
              </div>
              <ProgressBar value={stats.unemploymentRate} color="bg-red-400" />
              <p className="mt-1 text-xs text-gray-400">
                {stats.alumni - stats.employedCount} alumni
              </p>
            </div>
          </div>
        </div>

        {/* Course alignment outcomes */}
        {outcomeRates && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Course-Aligned Employment
                </p>
                <InfoTooltip text="Percentage of alumni working in jobs aligned with their academic program, grouped by career stage." position="bottom" />
              </div>
                <p className="mt-0.5 text-base font-semibold text-gray-900">
                  Outcome Rates
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Target size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {/* Recent graduates */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-700">Recent Graduate Placement</p>
                      <InfoTooltip text="Alumni 0-2 years out who are employed in a course-aligned position. Alignment is determined by survey response or job title keyword matching. Formula: (Aligned / Total in cohort) x 100." position="bottom" />
                    </div>
                    <p className="text-xs text-gray-400">0–2 years out</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {outcomeRates.recentGraduatePlacementRate}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {outcomeRates.recentAligned} / {outcomeRates.recentTotal}
                    </p>
                  </div>
                </div>
                <ProgressBar value={outcomeRates.recentGraduatePlacementRate} color="bg-amber-500" />
              </div>

              {/* Mid-career */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-700">Mid-Career Alignment</p>
                      <InfoTooltip text="Alumni 3-5 years out who are employed in a course-aligned position. Formula: (Aligned / Total in cohort) x 100." position="bottom" />
                    </div>
                    <p className="text-xs text-gray-400">3–5 years out</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {outcomeRates.midCareerAlignmentRate}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {outcomeRates.midCareerAligned} / {outcomeRates.midCareerTotal}
                    </p>
                  </div>
                </div>
                <ProgressBar value={outcomeRates.midCareerAlignmentRate} color="bg-teal-500" />
              </div>

              {/* Established career */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-700">Established Career</p>
                      <InfoTooltip text="Alumni 6+ years out who are employed in a course-aligned position. Formula: (Aligned / Total in cohort) x 100." position="bottom" />
                    </div>
                    <p className="text-xs text-gray-400">6+ years out</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {outcomeRates.establishedCareerAlignmentRate}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {outcomeRates.establishedCareerAligned} / {outcomeRates.establishedCareerTotal}
                    </p>
                  </div>
                </div>
                <ProgressBar value={outcomeRates.establishedCareerAlignmentRate} color="bg-indigo-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-gray-900">Alumni by Course</h2>
                  <InfoTooltip text="Distribution of alumni across academic programs. Each slice shows the count per program. Top 8 programs shown." position="bottom" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Distribution across programs</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <DepartmentChart
              data={deptData.length ? deptData : [{ name: "No data", value: 1 }]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-semibold text-gray-900">Employment by Course</h2>
                <InfoTooltip text="Employed count vs. total count per program shown side-by-side. Top 6 programs shown." position="bottom" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Employed vs total per program</p>
            </div>
          </CardHeader>
          <CardBody>
            <EmploymentChart
              data={
                empData.length
                  ? empData
                  : [{ department: "No data", employed: 0, total: 0 }]
              }
            />
          </CardBody>
        </Card>
      </div>

      {/* ── Waiting Time ── */}
      {waitingTimeRows.some((r) => r.count > 0) && (
        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-semibold text-gray-900">Time to First Job After Graduation</h2>
                <InfoTooltip text="How long alumni took to get their first job after graduation. Buckets: <3 months, 3-6 months, 7-12 months, >1 year, Still unemployed. Based only on alumni who answered this question." position="bottom" />
              </div>
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

      {/* ── Cohort Outcomes ── */}
      {cohortRows.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-semibold text-gray-900">Cohort Outcomes by Batch Year</h2>
                <InfoTooltip text="Groups alumni by batch year. Employment Rate = (employed / total) x 100. Alignment Rate = (employed AND course-aligned / total) x 100. 5-yr Eval Year = batch year + 5." position="bottom" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Employment &amp; course-alignment rate per graduation cohort · 5-year evaluation cycle
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">5-yr Eval</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Years Out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Employed</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Emp. Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Aligned</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Align. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cohortRows.map((row) => (
                    <tr key={row.batchYear} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{row.evalYear}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{row.yearsOut} yrs</td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">{row.total}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">{row.employed}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-green-700">{row.employmentRate}%</td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">{row.aligned}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-indigo-700">{row.alignmentRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Interval Outcomes ── */}
      {intervalOutcomes.some((r) => r.at1yr.responded > 0 || r.at2yr.responded > 0 || r.at5yr.responded > 0 || r.at8yr.responded > 0) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
              <div>
                <div className="flex items-center gap-1">
                  <h2 className="font-semibold text-gray-900">Employment Outcomes by Year Interval</h2>
                  <InfoTooltip text="Employment rate at 1, 2, 5, and 8 years after graduation based on survey fields. Rate = (employed at interval / responded at interval) x 100." position="bottom" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Employment rate at 1, 2, 5, and 8 years after graduation (based on survey responses)
                </p>
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden self-start flex-shrink-0">
                <button
                  type="button"
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors", intervalView === "batch" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                  onClick={() => setIntervalView("batch")}
                >
                  By Batch Year
                </button>
                <button
                  type="button"
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200", intervalView === "dept" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
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
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Total</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">1 Yr</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">2 Yr</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">5 Yr</th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">8 Yr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {intervalView === "batch" ? (
                    intervalOutcomes.map((row) => (
                      <tr key={row.batchYear} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                        <td className="px-3 sm:px-4 py-3 text-center text-xs text-gray-600 hidden sm:table-cell">{row.total}</td>
                        {([row.at1yr, row.at2yr, row.at5yr, row.at8yr] as IntervalBucket[]).map((b, i) => (
                          <td key={i} className="px-3 sm:px-4 py-3 text-center text-xs">
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
                            <td className="px-3 sm:px-4 py-3 pl-6 sm:pl-8 font-semibold text-gray-900 text-xs">{row.batchYear}</td>
                            <td className="px-3 sm:px-4 py-3 text-center text-xs text-gray-600 hidden sm:table-cell">{row.total}</td>
                            {([row.at1yr, row.at2yr, row.at5yr, row.at8yr] as IntervalBucket[]).map((b, i) => (
                              <td key={i} className="px-3 sm:px-4 py-3 text-center text-xs">
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

      {/* ── Recent sign-ups ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Sign-ups</h2>
              <p className="text-xs text-gray-400 mt-0.5">Newest alumni registrations</p>
            </div>
            <a
              href="/admin/alumni"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50 transition-colors"
            >
              View all <ArrowUpRight size={13} />
            </a>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {recentAlumni.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Users size={32} className="text-gray-200" />
              <p className="text-sm text-gray-400">No alumni registered yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentAlumni.map((a) => (
                <div key={a.uid} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4">
                  <Avatar src={a.photoURL} name={a.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.displayName}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {a.course ?? a.department ?? "—"}
                      {a.batchYear ? ` · Batch ${a.batchYear}` : ""}
                    </p>
                    {/* Profile completion bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            (a.profileComplete ?? 0) >= 80
                              ? "bg-green-500"
                              : (a.profileComplete ?? 0) >= 40
                              ? "bg-amber-400"
                              : "bg-red-400"
                          )}
                          style={{ width: `${a.profileComplete ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                        {a.profileComplete ?? 0}%
                      </span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
