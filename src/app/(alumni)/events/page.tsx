"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useEvents } from "@/lib/hooks/useEvents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { EventCard } from "@/components/events/EventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  const { events, loading } = useEvents();
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) =>
    search === "" ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Events" }]}
      />

      <Input
        placeholder="Search events..."
        leftIcon={<Search size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title={search ? "No events match your search" : "No upcoming events"}
          description="Check back later for new events."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}
