import { useEffect, useRef } from "react"
import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import type { ReviewAction, ReviewProgress } from "../hooks/useStaffAccess"
import PendingEventCard from "./PendingEventCard"

type PendingEventQueueProps = {
  events: CommunityEvent[]
  isRefreshing: boolean
  error: string | null
  onRefresh: () => void
  reviewing: ReviewProgress | null
  reviewErrors: Record<number, string>
  reviewMessage: string | null
  onReview: (id: number, action: ReviewAction, reason?: string) => void
}

export default function PendingEventQueue({
  events,
  isRefreshing,
  error,
  onRefresh,
  reviewing,
  reviewErrors,
  reviewMessage,
  onReview,
}: PendingEventQueueProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isBusy = isRefreshing || reviewing !== null

  useEffect(() => {
    if (reviewMessage) headingRef.current?.focus()
  }, [reviewMessage, events.length])

  return (
    <section
      className="pending-queue"
      aria-labelledby="pending-queue-title"
      aria-busy={isBusy}
    >
      <div className="pending-queue-heading">
        <h3 id="pending-queue-title" tabIndex={-1} ref={headingRef}>
          Pending submissions
        </h3>
        <button
          className="text-button"
          type="button"
          onClick={onRefresh}
          disabled={isBusy}
        >
          {isRefreshing ? "Refreshing…" : "Refresh queue"}
        </button>
      </div>
      <p className="pending-queue-status" role="status" aria-live="polite">
        {isRefreshing
          ? "Refreshing pending submissions…"
          : reviewing
            ? "Saving review…"
            : error
              ? "The queue could not be updated."
              : `${events.length} ${
                  events.length === 1 ? "submission" : "submissions"
                } awaiting review. Oldest first.`}
      </p>
      {reviewMessage && (
        <p className="pending-review-notice" role="status" aria-live="polite">
          {reviewMessage}
        </p>
      )}
      {error && (
        <p className="pending-queue-error" role="alert">
          {error}{" "}
          {events.length > 0
            ? "Previously loaded submissions are shown below. "
            : ""}
          Use Refresh queue to try again.
        </p>
      )}
      {!isRefreshing && !error && events.length === 0 && (
        <div className="pending-queue-empty">
          <h4>All caught up.</h4>
          <p>No event submissions are awaiting review.</p>
        </div>
      )}
      {events.length > 0 && (
        <ul className="pending-queue-list">
          {events.map((event) => (
            <li key={event.id}>
              <PendingEventCard
                event={event}
                disabled={isBusy}
                action={reviewing?.id === event.id ? reviewing.action : null}
                error={reviewErrors[event.id]}
                onApprove={() => onReview(event.id, "approve")}
                onReject={(reason) => onReview(event.id, "reject", reason)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
