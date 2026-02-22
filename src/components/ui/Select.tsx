"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      className,
      id,
      value,
      defaultValue,
      onChange,
      onBlur,
      disabled,
      name,
      ...rest
    },
    forwardedRef
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string>(() => {
      const init = value ?? defaultValue;
      return typeof init === "string" ? init : String(init ?? "");
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenRef = useRef<HTMLSelectElement>(null);

    // Sync controlled value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(typeof value === "string" ? value : String(value ?? ""));
      }
    }, [value]);

    // Close panel on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close panel on Escape
    useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [open]);

    // Merge the forwarded ref with our internal ref
    const mergeRef = useCallback(
      (el: HTMLSelectElement | null) => {
        (hiddenRef as React.MutableRefObject<HTMLSelectElement | null>).current = el;
        if (typeof forwardedRef === "function") forwardedRef(el);
        else if (forwardedRef)
          (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = el;
      },
      [forwardedRef]
    );

    const selectedOption = options.find((o) => o.value === internalValue);

    const handleSelect = (optValue: string) => {
      setInternalValue(optValue);
      setOpen(false);

      if (onChange && hiddenRef.current) {
        // Update the DOM value directly so event.target.value is correct
        hiddenRef.current.value = optValue;

        onChange({
          target: hiddenRef.current,
          currentTarget: hiddenRef.current,
          nativeEvent: new Event("change"),
          bubbles: true,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: false,
          preventDefault: () => {},
          isDefaultPrevented: () => false,
          stopPropagation: () => {},
          isPropagationStopped: () => false,
          persist: () => {},
          timeStamp: Date.now(),
          type: "change",
        } as React.ChangeEvent<HTMLSelectElement>);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (containerRef.current?.contains(e.relatedTarget as Node)) return;
      setOpen(false);
      if (onBlur && hiddenRef.current) {
        onBlur({
          target: hiddenRef.current,
          currentTarget: hiddenRef.current,
          nativeEvent: new Event("blur"),
          bubbles: false,
          cancelable: false,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: false,
          preventDefault: () => {},
          isDefaultPrevented: () => false,
          stopPropagation: () => {},
          isPropagationStopped: () => false,
          persist: () => {},
          timeStamp: Date.now(),
          type: "blur",
        } as React.FocusEvent<HTMLSelectElement>);
      }
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        {/* Hidden native select — keeps ref for React Hook Form registration */}
        <select
          ref={mergeRef}
          name={name}
          value={internalValue}
          onChange={() => {}}
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger + panel */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            onBlur={handleBlur}
            className={cn(
              "w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-left transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-navy-800",
              "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
              open && !error ? "border-navy-800 ring-2 ring-navy-800" : "border-gray-300",
              error && "border-error focus:ring-error",
              className
            )}
          >
            <span className={cn("truncate", selectedOption ? "text-gray-900" : "text-gray-400")}>
              {selectedOption?.label ?? placeholder ?? "Select…"}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "flex-shrink-0 ml-2 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>

          {open && (
            <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-100 bg-white shadow-modal overflow-hidden animate-slide-up">
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                {options.map((opt) => {
                  const isSelected = opt.value === internalValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onMouseDown={(e) => {
                        // Prevent the trigger's onBlur from firing before we handle the click
                        e.preventDefault();
                        handleSelect(opt.value);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors",
                        isSelected
                          ? "bg-navy-800 text-white font-medium"
                          : "text-gray-700 hover:bg-navy-50 hover:text-navy-800"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check size={13} className="flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
        {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
