export type EventStatus = "draft" | "published" | "completed";

export interface AlumniEvent {
  id: string;
  title: string;
  description: string;
  type: string; // seminar, reunion, webinar, workshop, etc.
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  meetingLink: string;
  maxAttendees: number | null;
  status: EventStatus;
  bannerURL: string;
  rsvpCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  userId: string;
  displayName: string;
  email: string;
  batchYear: number | null;
  rsvpAt: string;
  attended: boolean;
}
