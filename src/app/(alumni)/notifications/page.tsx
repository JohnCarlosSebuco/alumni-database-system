"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { NotificationType } from "@/lib/types/notification.types";

export const dynamic = 'force-dynamic';

const typeColors: Record<NotificationType, string> = {
  job_posted:          "bg-blue-100 text-blue-700",
  event_posted:        "bg-purple-100 text-purple-700",
  application_update:  "bg-gold-100 text-gold-600",
  system:              "bg-gray-100 text-gray-600",
};

const typeLabels: Record<NotificationType, string> = {
  job_posted:         "New Job",
  event_posted:       "New Event",
  application_update: "Application Update",
  system:             "System",
};

export default function NotificationsPage() {
  const { notifications, loading } = useNotifications(50);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
      />

      <Card>
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell size={48} />}
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
              className="py-16"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors",
                    !n.isRead && "bg-navy-50/50"
                  )}
                >
                  <div className={cn(
                    "mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    typeColors[n.type]
                  )}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={cn(
                          "inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1",
                          typeColors[n.type]
                        )}>
                          {typeLabels[n.type]}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                        {n.link && (
                          <Link href={n.link} className="text-xs text-navy-800 hover:underline mt-1 inline-block">
                            View details →
                          </Link>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-navy-800" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
