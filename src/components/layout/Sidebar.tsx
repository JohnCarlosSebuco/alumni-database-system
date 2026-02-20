"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Briefcase, Calendar, Bell,
  Users, BarChart3, Settings, GraduationCap, ChevronLeft,
  ChevronRight, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const alumniNav: NavItem[] = [
  { label: "Dashboard",      href: "/dashboard",      icon: <LayoutDashboard size={18} /> },
  { label: "My Profile",     href: "/profile",        icon: <User size={18} /> },
  { label: "Job Board",      href: "/jobs",            icon: <Briefcase size={18} /> },
  { label: "Events",         href: "/events",          icon: <Calendar size={18} /> },
  { label: "Notifications",  href: "/notifications",   icon: <Bell size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard",      href: "/admin/dashboard",  icon: <LayoutDashboard size={18} /> },
  { label: "Alumni",         href: "/admin/alumni",     icon: <Users size={18} /> },
  { label: "Jobs",           href: "/admin/jobs",       icon: <Briefcase size={18} /> },
  { label: "Events",         href: "/admin/events",     icon: <Calendar size={18} /> },
  { label: "Reports",        href: "/admin/reports",    icon: <BarChart3 size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { userDoc } = useAuth();
  const pathname = usePathname();
  const isAdmin = userDoc?.role === "admin";
  const navItems = isAdmin ? adminNav : alumniNav;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-navy-900 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-navy-800 px-4 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500">
            <GraduationCap size={18} className="text-navy-900" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">AlumNayan</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-navy-800 text-white"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 border-t border-navy-800 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
