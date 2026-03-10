import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Wifi, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { AlumniEvent } from "@/lib/types/event.types";

interface EventCardProps {
  event: AlumniEvent;
  href?: string;
}

const typeStyle: Record<string, string> = {
  Seminar:  "bg-purple-600",
  Webinar:  "bg-blue-600",
  Workshop: "bg-orange-500",
  Reunion:  "bg-pink-600",
  Forum:    "bg-teal-600",
};

const typeTextStyle: Record<string, string> = {
  Seminar:  "bg-purple-50 text-purple-700 border-purple-100",
  Webinar:  "bg-blue-50   text-blue-700   border-blue-100",
  Workshop: "bg-orange-50 text-orange-700 border-orange-100",
  Reunion:  "bg-pink-50   text-pink-700   border-pink-100",
  Forum:    "bg-teal-50   text-teal-700   border-teal-100",
};

const gradients: Record<string, string> = {
  Seminar:  "from-purple-800 to-purple-600",
  Webinar:  "from-blue-800   to-blue-600",
  Workshop: "from-orange-700 to-amber-500",
  Reunion:  "from-pink-700   to-rose-500",
  Forum:    "from-teal-700   to-teal-500",
};

export function EventCard({ event, href }: EventCardProps) {
  const url = href ?? `/events/${event.id}`;

  let month = "";
  let day = "";
  try {
    const d = new Date(event.startDate);
    month = format(d, "MMM");
    day = format(d, "d");
  } catch {}

  const gradient = gradients[event.type] ?? "from-navy-800 to-navy-600";
  const typePill = typeTextStyle[event.type];

  return (
    <Link href={url} className="block group">
      <div className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150 overflow-hidden h-full">
        {/* Banner / Gradient header */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          {event.bannerURL ? (
            <img
              src={event.bannerURL}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br flex items-center justify-center",
                gradient
              )}
            >
              <Calendar size={40} className="text-white/20" />
            </div>
          )}

          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Date box — bottom-left */}
          <div className="absolute bottom-3 left-3 flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/95 shadow-sm">
            <span className="text-[9px] font-bold uppercase leading-none text-gray-500">
              {month}
            </span>
            <span className="text-base font-bold leading-tight text-gray-900">
              {day}
            </span>
          </div>

          {/* Type badge — top-right */}
          {event.type && (
            <div className="absolute top-3 right-3">
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">
                {event.type}
              </span>
            </div>
          )}

          {/* Virtual badge — top-left */}
          {event.isVirtual && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Wifi size={10} /> Online
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-navy-800 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
            {event.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 pt-3 border-t border-gray-50">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(event.startDate)}
            </span>
            {!event.isVirtual && event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Users size={11} />
              {event.rsvpCount ?? 0} RSVP{(event.rsvpCount ?? 0) !== 1 ? "s" : ""}
              {event.maxAttendees !== null && (
                <span className="text-gray-300">/ {event.maxAttendees}</span>
              )}
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-end px-4 py-2.5 bg-gray-50/60 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-700 group-hover:text-navy-900 transition-colors">
            View event <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
