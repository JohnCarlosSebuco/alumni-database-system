"use client";

import React from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
  onToggle?: () => void;
  title?: string;
}

export function Topbar({ sidebarCollapsed, onMenuClick, onToggle, title }: TopbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 gap-4 transition-all duration-300",
        "left-0",
        sidebarCollapsed ? "md:left-16" : "md:left-64"
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Desktop collapse toggle */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="hidden md:flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Page title (hidden on mobile, shown desktop) */}
      {title && (
        <span className="hidden md:block text-sm font-medium text-gray-500">{title}</span>
      )}

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
