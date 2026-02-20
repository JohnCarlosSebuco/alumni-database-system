"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils/cn";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <Topbar sidebarCollapsed={collapsed} onMenuClick={() => setCollapsed((c) => !c)} />
        <main
          className={cn(
            "pt-16 min-h-screen transition-all duration-300",
            collapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
