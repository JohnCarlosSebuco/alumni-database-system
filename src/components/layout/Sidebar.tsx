"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Briefcase, Calendar, Bell,
  Users, BarChart3, ChevronLeft,
  ChevronRight, ShieldCheck, ClipboardList,
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
  { label: "Surveys",        href: "/admin/surveys",    icon: <ClipboardList size={18} /> },
  { label: "Reports",        href: "/admin/reports",    icon: <BarChart3 size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const superAdminNav: NavItem[] = [
  { label: "Super Panel", href: "/admin/super", icon: <ShieldCheck size={18} /> },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { userDoc } = useAuth();
  const pathname = usePathname();
  const isAdmin = userDoc?.role === "admin" || userDoc?.role === "super_admin";
  const isSuperAdmin = userDoc?.role === "super_admin";
  const navItems = isAdmin ? adminNav : alumniNav;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-navy-900 flex flex-col transition-all duration-300 ease-in-out",
          // Mobile: always w-64, slide in/out
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
          // Desktop: always visible, respect collapsed width
          "md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-navy-800 px-4 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Image
              src="/engineering-logo-nobg.png"
              alt="COE Logo"
              width={40}
              height={40}
              className="flex-shrink-0 rounded"
            />
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
                onClick={onMobileClose}
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

          {isSuperAdmin && (
            <>
              {!collapsed && (
                <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-navy-400">
                  Super Admin
                </p>
              )}
              {superAdminNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-gold-500/20 text-gold-400"
                        : "text-gold-400/70 hover:bg-gold-500/20 hover:text-gold-400"
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Collapse toggle — hidden on mobile */}
        <div className="hidden md:block flex-shrink-0 border-t border-navy-800 p-2">
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
    </>
  );
}
