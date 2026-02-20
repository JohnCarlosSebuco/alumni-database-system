import React from "react";
import Link from "next/link";
import { Briefcase, MapPin, Clock, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/formatters";
import type { Job } from "@/lib/types/job.types";

interface JobCardProps {
  job: Job;
  href?: string;
}

const typeColors: Record<string, "info" | "success" | "warning" | "navy" | "default"> = {
  "Full-time":  "success",
  "Part-time":  "info",
  "Contract":   "warning",
  "Internship": "navy",
  "Freelance":  "default",
};

export function JobCard({ job, href }: JobCardProps) {
  const url = href ?? `/jobs/${job.id}`;
  return (
    <Link href={url} className="block">
      <Card hover className="transition-all duration-150">
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                  <Briefcase size={16} className="text-blue-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{job.company}</p>
                </div>
              </div>
            </div>
            <Badge variant={typeColors[job.type] ?? "default"}>{job.type}</Badge>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}{job.isRemote && " (Remote)"}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Deadline: {formatDate(job.deadline)}
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
