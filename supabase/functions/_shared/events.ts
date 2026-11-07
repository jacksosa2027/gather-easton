/** Review state shared by the events API and frontend. */
export type EventStatus = "pending" | "approved" | "rejected";

export type CommunityEvent = {
  id: number;
  title: string;
  category: string;
  year?: number;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  image: string;
  alt: string;
  description: string;
  status: EventStatus;
  sourceUrl?: string;
  /** ISO 8601 timestamp; seed events may omit submission and review metadata. */
  submittedAt?: string;
  /** ISO 8601 timestamp of the staff review. */
  reviewedAt?: string;
  /** Staff explanation when the event is rejected. */
  rejectionReason?: string;
};
