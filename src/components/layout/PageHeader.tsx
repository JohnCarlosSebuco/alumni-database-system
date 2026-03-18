import React from "react";
import { cn } from "@/lib/utils/cn";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-navy-800 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-700 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}
