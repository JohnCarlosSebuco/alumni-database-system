"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeKey?: string;
  onChange?: (key: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.key);
  const active = activeKey ?? internal;

  const handleChange = (key: string) => {
    setInternal(key);
    onChange?.(key);
  };

  return (
    <div className={cn("flex overflow-x-auto border-b border-gray-200 gap-0 scrollbar-thin", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleChange(tab.key)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            active === tab.key
              ? "border-navy-800 text-navy-800"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.length > 8 ? tab.label.slice(0, 7) + '…' : tab.label}</span>
        </button>
      ))}
    </div>
  );
}
