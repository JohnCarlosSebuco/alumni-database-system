import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Video } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatters";
import type { AlumniEvent } from "@/lib/types/event.types";

interface EventCardProps {
  event: AlumniEvent;
  href?: string;
}

export function EventCard({ event, href }: EventCardProps) {
  const url = href ?? `/events/${event.id}`;
  return (
    <Link href={url} className="block">
      <Card hover className="transition-all duration-150 overflow-hidden">
        {event.bannerURL && (
          <div className="h-36 overflow-hidden bg-gray-100">
            <img src={event.bannerURL} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        {!event.bannerURL && (
          <div className="h-24 bg-gradient-to-r from-navy-800 to-navy-700 flex items-center justify-center">
            <Calendar size={36} className="text-navy-200" />
          </div>
        )}
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
            {event.isVirtual && <Badge variant="navy" className="flex-shrink-0">Virtual</Badge>}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              {event.isVirtual ? <Video size={12} /> : <MapPin size={12} />}
              {event.isVirtual ? "Online" : event.location}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {event.rsvpCount} RSVP{event.rsvpCount !== 1 ? "s" : ""}
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
