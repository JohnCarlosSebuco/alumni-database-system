"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils/cn";

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard requiredRole="alumni">
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <Topbar
          sidebarCollapsed={collapsed}
          onMenuClick={() => setMobileOpen(true)}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <main
          className={cn(
            "pt-16 min-h-screen transition-all duration-300",
            collapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
