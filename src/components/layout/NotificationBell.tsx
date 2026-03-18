"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export function NotificationBell() {
  const { notifications, unreadCount } = useNotifications(5);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-modal border border-gray-100 z-50 animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-error font-medium">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0",
                    !n.isRead && "bg-navy-50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                      n.isRead ? "bg-gray-200" : "bg-navy-800"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-navy-800 hover:text-navy-600 transition-colors py-1"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
