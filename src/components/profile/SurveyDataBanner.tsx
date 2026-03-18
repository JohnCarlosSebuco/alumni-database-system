import React from "react";
import { Info } from "lucide-react";

interface SurveyDataBannerProps {
  label: string;
  rawText: string;
}

/**
 * Blue info banner that shows the original survey response text.
 * Only render when rawText starts with "Yes" (i.e., alumni answered positively).
 */
export function SurveyDataBanner({ label, rawText }: SurveyDataBannerProps) {
  if (!rawText || !rawText.toLowerCase().startsWith("yes")) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-900">Survey Response &mdash; {label}</p>
          <p className="text-sm text-blue-800 mt-1 whitespace-pre-wrap break-words">{rawText}</p>
        </div>
      </div>
    </div>
  );
}
