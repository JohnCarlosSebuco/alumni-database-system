export type NotificationType = "job_posted" | "event_posted" | "application_update" | "system";

export interface Notification {
  id: string;
  recipientId: string; // uid or "all"
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  metadata: {
    jobId?: string;
    eventId?: string;
  };
}

export interface NotifStatus {
  isRead: boolean;
  readAt: string;
}
