"use client";

import React, { useMemo, useState } from "react";
import { Search, Calendar, SlidersHorizontal } from "lucide-react";
import { useEvents } from "@/lib/hooks/useEvents";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/events/EventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

type ModeFilter = "All" | "Virtual" | "In-person";
const EVENT_TYPES = ["Seminar", "Webinar", "Workshop", "Reunion", "Forum"] as const;

export default function EventsPage() {
  const { events, loading } = useEvents();
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesMode =
        modeFilter === "All" ||
        (modeFilter === "Virtual" && e.isVirtual) ||
        (modeFilter === "In-person" && !e.isVirtual);
      const matchesType = typeFilter === "All" || e.type === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q);
      return matchesMode && matchesType && matchesSearch;
    });
  }, [events, search, modeFilter, typeFilter]);

  const modeCounts = useMemo(() => ({
    All: events.length,
    Virtual: events.filter((e) => e.isVirtual).length,
    "In-person": events.filter((e) => !e.isVirtual).length,
  }), [events]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = { All: events.length };
    for (const t of EVENT_TYPES) {
      map[t] = events.filter((e) => e.type === t).length;
    }
    return map;
  }, [events]);

  const modeTabs: ModeFilter[] = ["All", "Virtual", "In-person"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Events" }]}
      />

      {/* Search + filter bar */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Search row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search events by title, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              Clear
            </button>
          )}
          <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400 border-l border-gray-100 pl-3">
            <SlidersHorizontal size={13} />
            <span>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Mode tabs: All / Virtual / In-person */}
        <div className="flex items-center overflow-x-auto px-1 border-b border-gray-50">
          {modeTabs.map((t) => (
            <button
              key={t}
              onClick={() => setModeFilter(t)}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                modeFilter === t
                  ? "border-navy-800 text-navy-800"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
              )}
            >
              {t}
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none min-w-[18px] py-0.5",
                  modeFilter === t
                    ? "bg-navy-800 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {modeCounts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto">
          <span className="text-xs text-gray-400 flex-shrink-0">Type:</span>
          {["All", ...EVENT_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                typeFilter === t
                  ? "bg-navy-800 text-white border-navy-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {t}
              {t !== "All" && typeCounts[t] > 0 && (
                <span className="ml-1 opacity-70">{typeCounts[t]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title={
            search || modeFilter !== "All" || typeFilter !== "All"
              ? "No events match your filters"
              : "No upcoming events"
          }
          description={
            search || modeFilter !== "All" || typeFilter !== "All"
              ? "Try adjusting your search or filters."
              : "Check back later for new events."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
