"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Bell,
  GraduationCap,
  ChevronRight,
  CheckCircle,
  MapPin,
  Wifi,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { useJobs } from "@/lib/hooks/useJobs";
import { useEvents } from "@/lib/hooks/useEvents";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import {
  getDocs,
  getDoc,
  query,
  where,
  surveysRef,
  surveyResponseRef,
} from "@/lib/firebase/firestore";
import { SurveyModal } from "@/components/surveys/SurveyModal";
import type { Survey } from "@/lib/types/survey.types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const jobTypeColor: Record<string, string> = {
  "Full-time":  "bg-blue-50   text-blue-700   border-blue-100",
  "Part-time":  "bg-purple-50 text-purple-700 border-purple-100",
  "Contract":   "bg-orange-50 text-orange-700 border-orange-100",
  "Internship": "bg-teal-50   text-teal-700   border-teal-100",
};

export default function AlumniDashboardClient() {
  const { user, userDoc } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { events, loading: eventsLoading } = useEvents();
  const { unreadCount } = useNotifications();
  const [pendingSurvey, setPendingSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (!user) return;
    async function checkSurveys() {
      const snap = await getDocs(
        query(surveysRef(), where("status", "==", "active"))
      );
      const activeSurveys = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Survey)
      );
      const skipped: string[] = JSON.parse(
        sessionStorage.getItem("skippedSurveys") ?? "[]"
      );
      for (const survey of activeSurveys) {
        if (skipped.includes(survey.id)) continue;
        const responseSnap = await getDoc(surveyResponseRef(survey.id, user.uid));
        if (!responseSnap.exists()) {
          setPendingSurvey(survey);
          break;
        }
      }
    }
    checkSurveys();
  }, [user]);

  const recentJobs = jobs.slice(0, 4);
  const recentEvents = events.slice(0, 4);
  const profileComplete = userDoc?.profileComplete ?? 0;

  return (
    <>
      {pendingSurvey && (
        <SurveyModal
          survey={pendingSurvey}
          onClose={() => setPendingSurvey(null)}
          onComplete={() => setPendingSurvey(null)}
        />
      )}

      <div className="space-y-6">
        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 px-6 py-7 sm:px-8 sm:py-8">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 right-32 h-36 w-36 rounded-full bg-gold-500/10 blur-2xl" />

          <div className="relative">
            <p className="text-sm font-medium text-navy-300">{getGreeting()}</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {userDoc?.displayName ?? "Alumni"}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {userDoc?.department && (
                <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200">
                  {userDoc.department}
                </span>
              )}
              {userDoc?.batchYear && (
                <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200">
                  Batch {userDoc.batchYear}
                </span>
              )}
              {userDoc?.currentPosition && (
                <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-navy-200">
                  {userDoc.currentPosition}
                </span>
              )}
            </div>

            {/* Profile completion bar */}
            <div className="mt-5 max-w-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-navy-300">Profile completion</span>
                <span className="text-xs font-bold text-white">{profileComplete}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-700"
                  style={{ width: `${profileComplete}%` }}
                />
              </div>
              {profileComplete < 100 ? (
                <p className="mt-2 text-xs text-navy-300">
                  Complete your profile to get noticed by employers.{" "}
                  <Link
                    href="/profile/edit"
                    className="font-semibold text-gold-400 underline underline-offset-2 hover:text-gold-300 transition-colors"
                  >
                    Finish now →
                  </Link>
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-400">
                  <CheckCircle size={12} />
                  Your profile is complete — you&apos;re visible to employers!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Open Jobs",
              value: jobs.length,
              icon: <Briefcase size={18} />,
              href: "/jobs",
              iconCn: "bg-blue-50 text-blue-600",
            },
            {
              label: "Upcoming Events",
              value: events.length,
              icon: <Calendar size={18} />,
              href: "/events",
              iconCn: "bg-purple-50 text-purple-600",
            },
            {
              label: "Notifications",
              value: unreadCount,
              icon: <Bell size={18} />,
              href: "/notifications",
              iconCn: "bg-amber-50 text-amber-600",
            },
            {
              label: "Batch Year",
              value: userDoc?.batchYear ?? "—",
              icon: <GraduationCap size={18} />,
              href: "/profile",
              iconCn: "bg-green-50 text-green-600",
            },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow-card-hover">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    s.iconCn
                  )}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Jobs & Events ── */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Latest Jobs */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Latest Job Postings</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50 transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {jobsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-navy-800" />
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Briefcase size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">No job postings yet</p>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="group flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                        <Briefcase size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-navy-800 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {job.company}
                          {job.location ? ` · ${job.location}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                            jobTypeColor[job.type] ?? "bg-gray-100 text-gray-600 border-gray-200"
                          )}
                        >
                          {job.type}
                        </span>
                        {job.deadline && (
                          <span className="text-[10px] text-gray-400">
                            {formatDate(job.deadline, "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {events.length} event{events.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-50 transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {eventsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-navy-800" />
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Calendar size={28} className="text-gray-200" />
                  <p className="text-sm text-gray-400">No upcoming events</p>
                </div>
              ) : (
                recentEvents.map((event) => {
                  let dateBox = { month: "", day: "" };
                  try {
                    const d = new Date(event.startDate);
                    dateBox = { month: format(d, "MMM"), day: format(d, "d") };
                  } catch {}

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="group flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                        {/* Date box / Banner */}
                        {event.bannerURL ? (
                          <div className="flex-shrink-0 relative w-14 h-11 rounded-xl overflow-hidden border border-gray-100">
                            <img
                              src={event.bannerURL}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-navy-900/40 flex flex-col items-center justify-center">
                              <span className="text-[8px] font-bold uppercase leading-none text-white/90">
                                {dateBox.month}
                              </span>
                              <span className="text-sm font-bold leading-tight text-white">
                                {dateBox.day}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl border border-navy-100 bg-navy-50">
                            <span className="text-[9px] font-bold uppercase leading-none text-navy-500">
                              {dateBox.month}
                            </span>
                            <span className="text-base font-bold leading-tight text-navy-900">
                              {dateBox.day}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-navy-800 transition-colors line-clamp-1">
                            {event.title}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            {event.isVirtual ? (
                              <><Wifi size={10} /> Online</>
                            ) : (
                              <><MapPin size={10} /> {event.location}</>
                            )}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {event.type && (
                            <span className="rounded-md bg-purple-50 border border-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                              {event.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
