"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, Calendar, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useJobs } from "@/lib/hooks/useJobs";
import { useEvents } from "@/lib/hooks/useEvents";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

function ProfileCompletionRing({ percent }: { percent: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="8" className="stroke-gray-200" />
        <circle
          cx="48" cy="48" r={r} fill="none" strokeWidth="8"
          className="stroke-gold-500 transition-all duration-700"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold text-navy-800">{percent}%</span>
    </div>
  );
}

export default function AlumniDashboardClient() {
  const { userDoc } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { events, loading: eventsLoading } = useEvents();
  const { unreadCount } = useNotifications();

  const recentJobs = jobs.slice(0, 3);
  const recentEvents = events.slice(0, 3);
  const profileComplete = userDoc?.profileComplete ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${userDoc?.displayName?.split(" ")[0] ?? "Alumni"}!`}
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile completion */}
        <Card className="md:col-span-1">
          <CardBody className="flex flex-col items-center text-center gap-4">
            <ProfileCompletionRing percent={profileComplete} />
            <div>
              <p className="font-semibold text-gray-900">Profile Completion</p>
              <p className="text-sm text-gray-500 mt-1">
                {profileComplete < 100
                  ? "Complete your profile to stand out"
                  : "Your profile is complete!"}
              </p>
            </div>
            {profileComplete < 100 && (
              <Link
                href="/profile/edit"
                className="inline-flex items-center gap-1 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 transition-colors"
              >
                <User size={14} />
                Complete Profile
              </Link>
            )}
          </CardBody>
        </Card>

        {/* Quick stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Open Jobs",        value: jobs.length,     icon: <Briefcase size={20} />, href: "/jobs",          color: "bg-blue-50 text-blue-700" },
            { label: "Upcoming Events",  value: events.length,   icon: <Calendar size={20} />,  href: "/events",         color: "bg-purple-50 text-purple-700" },
            { label: "Notifications",    value: unreadCount,     icon: <User size={20} />,       href: "/notifications",  color: "bg-gold-50 text-gold-600" },
            { label: "Batch Year",       value: userDoc?.batchYear ?? "—", icon: <User size={20} />, href: "/profile", color: "bg-green-50 text-green-700" },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <Card hover className="h-full">
                <CardBody className="flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0", s.color)}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent jobs & events */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Latest Job Postings</h2>
            <Link href="/jobs" className="text-sm text-navy-800 hover:text-navy-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <CardBody className="space-y-3 p-4">
            {jobsLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentJobs.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No job postings yet</p>
            ) : (
              recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Briefcase size={16} className="text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 truncate">{job.company} · {job.location}</p>
                    </div>
                    <Badge variant="info" className="flex-shrink-0 text-[10px]">{job.type}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-navy-800 hover:text-navy-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <CardBody className="space-y-3 p-4">
            {eventsLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentEvents.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No upcoming events</p>
            ) : (
              recentEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                      <Calendar size={16} className="text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                    </div>
                    {event.isVirtual && (
                      <Badge variant="navy" className="flex-shrink-0 text-[10px]">Virtual</Badge>
                    )}
                  </div>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
