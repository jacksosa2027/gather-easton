import { useState } from "react"
import type { CommunityEvent } from "../../supabase/functions/_shared/events"

export default function PendingEventCard({ event }: { event: CommunityEvent }) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const hasImage = Boolean(event.image) && failedImage !== event.image
  const submittedAt = event.submittedAt ? new Date(event.submittedAt) : null
  const titleId = `pending-event-title-${event.id}`

  return (
    <article className="pending-event-card" aria-labelledby={titleId}>
      <div className="pending-event-image">
        {hasImage ? (
          <img
            src={event.image}
            alt={event.alt || `${event.title} event image`}
            loading="lazy"
            onError={() => setFailedImage(event.image)}
          />
        ) : (
          <p>
            {event.image ? "Image preview unavailable" : "No image provided"}
          </p>
        )}
      </div>
      <div className="pending-event-content">
        <span className="pending-event-category">{event.category}</span>
        <h4 id={titleId}>{event.title}</h4>
        <dl className="pending-event-details">
          <div>
            <dt>Date</dt>
            <dd>
              {event.day}
              {event.year ? `, ${event.year}` : ""}
            </dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{event.time}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{event.location}</dd>
          </div>
          {submittedAt && Number.isFinite(submittedAt.getTime()) && (
            <div>
              <dt>Submitted</dt>
              <dd>
                <time dateTime={event.submittedAt}>
                  {submittedAt.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </dd>
            </div>
          )}
        </dl>
        <p className="pending-event-description">{event.description}</p>
        {event.sourceUrl && (
          <a
            className="pending-event-source"
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source / organizer: {event.sourceUrl}
          </a>
        )}
      </div>
    </article>
  )
}
