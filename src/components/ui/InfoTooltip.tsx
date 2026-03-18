"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface InfoTooltipProps {
  text: string;
  position?: TooltipPosition;
  maxWidth?: string;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent border-[5px]",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent border-[5px]",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent border-[5px]",
  right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent border-[5px]",
};

export function InfoTooltip({
  text,
  position = "top",
  maxWidth,
  className,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  // Clamp tooltip within viewport after it becomes visible
  const clampToViewport = useCallback(() => {
    const tip = tipRef.current;
    if (!tip) return;
    // Reset any previous correction
    tip.style.transform = "";

    const rect = tip.getBoundingClientRect();
    const pad = 8; // px from viewport edge
    let dx = 0;

    if (rect.left < pad) {
      dx = pad - rect.left;
    } else if (rect.right > window.innerWidth - pad) {
      dx = window.innerWidth - pad - rect.right;
    }

    if (dx !== 0) {
      // Read the existing CSS translate and add our correction
      const current = new DOMMatrixReadOnly(getComputedStyle(tip).transform);
      tip.style.transform = `translate(${current.m41 + dx}px, ${current.m42}px)`;
    }
  }, []);

  // Close on click outside (mobile tap-to-dismiss)
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Clamp when opened via tap
  useEffect(() => {
    if (open) clampToViewport();
  }, [open, clampToViewport]);

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label="More info"
      className={cn("relative inline-flex items-center group print:hidden", className)}
      onClick={() => setOpen((v) => !v)}
      onMouseEnter={clampToViewport}
    >
      <Info size={14} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" />

      {/* Tooltip – visible on group hover (desktop) OR open state (mobile tap) */}
      <span
        ref={tipRef}
        className={cn(
          "absolute z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed pointer-events-none animate-fade-in whitespace-normal text-left font-normal w-max",
          positionClasses[position],
          open ? "block" : "hidden group-hover:block",
        )}
        style={{
          maxWidth: maxWidth ?? "min(320px, calc(100vw - 2rem))",
        }}
        role="tooltip"
      >
        {text}
        {/* Arrow */}
        <span className={cn("absolute w-0 h-0", arrowClasses[position])} />
      </span>
    </button>
  );
}
