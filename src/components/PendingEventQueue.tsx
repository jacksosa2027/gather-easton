import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import PendingEventCard from "./PendingEventCard"

type PendingEventQueueProps = {
  events: CommunityEvent[]
  isRefreshing: boolean
  error: string | null
  onRefresh: () => void
}

export default function PendingEventQueue({
  events,
  isRefreshing,
  error,
  onRefresh,
}: PendingEventQueueProps) {
  return (
    <section
      className="pending-queue"
      aria-labelledby="pending-queue-title"
      aria-busy={isRefreshing}
    >
      <div className="pending-queue-heading">
        <h3 id="pending-queue-title">Pending submissions</h3>
        <button
          className="text-button"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing…" : "Refresh queue"}
        </button>
      </div>
      <p className="pending-queue-status" role="status" aria-live="polite">
        {isRefreshing
          ? "Refreshing pending submissions…"
          : error
            ? "The queue could not be updated."
            : `${events.length} ${
                events.length === 1 ? "submission" : "submissions"
              } awaiting review. Oldest first.`}
      </p>
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
              <PendingEventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
