import { useEffect, useRef, useState } from "react"
import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import type { ReviewAction } from "../hooks/useStaffAccess"

type PendingEventCardProps = {
  event: CommunityEvent
  disabled: boolean
  action: ReviewAction | null
  error?: string
  onApprove: () => void
  onReject: (reason: string) => void
}

export default function PendingEventCard({
  event,
  disabled,
  action,
  error,
  onApprove,
  onReject,
}: PendingEventCardProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState<string | null>(null)
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const hasImage = Boolean(event.image) && failedImage !== event.image
  const submittedAt = event.submittedAt ? new Date(event.submittedAt) : null
  const titleId = `pending-event-title-${event.id}`
  const errorId = `pending-review-error-${event.id}`
  const rejectionFormId = `pending-rejection-${event.id}`
  const message = reasonError ?? error

  useEffect(() => {
    if (rejectOpen) reasonRef.current?.focus()
  }, [rejectOpen])

  return (
    <article
      className="pending-event-card"
      aria-labelledby={titleId}
      aria-busy={action !== null}
    >
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
        {message && (
          <p className="pending-review-error" id={errorId} role="alert">
            {message}
          </p>
        )}
        <div className="pending-review-actions">
          <button
            className="primary-button"
            type="button"
            onClick={onApprove}
            disabled={disabled || rejectOpen}
            aria-label={`Approve ${event.title}`}
          >
            {action === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            className="pending-reject-button"
            type="button"
            disabled={disabled}
            aria-expanded={rejectOpen}
            aria-controls={rejectionFormId}
            onClick={() => {
              setRejectOpen(!rejectOpen)
              setReasonError(null)
              if (rejectOpen) setReason("")
            }}
          >
            {rejectOpen ? "Cancel rejection" : "Reject"}
          </button>
        </div>
        {rejectOpen && (
          <form
            id={rejectionFormId}
            className="pending-rejection-form"
            aria-label={`Reject ${event.title}`}
            aria-busy={action === "reject"}
            onSubmit={(submitEvent) => {
              submitEvent.preventDefault()
              if (disabled) return
              if (!reason.trim()) {
                setReasonError("Enter a rejection reason before continuing.")
                reasonRef.current?.focus()
                return
              }
              if (submitEvent.currentTarget.reportValidity()) {
                setReasonError(null)
                onReject(reason.trim())
              }
            }}
          >
            <label className="form-field">
              <span>Reason for rejection</span>
              <textarea
                name="rejectionReason"
                required
                rows={3}
                value={reason}
                onChange={(changeEvent) => {
                  setReason(changeEvent.target.value)
                  setReasonError(null)
                }}
                disabled={disabled}
                aria-invalid={Boolean(reasonError)}
                aria-describedby={message ? errorId : undefined}
                ref={reasonRef}
                placeholder="Explain what needs to change or why this event cannot be published."
              />
            </label>
            <button
              className="pending-reject-button"
              type="submit"
              disabled={disabled}
            >
              {action === "reject" ? "Rejecting…" : "Confirm rejection"}
            </button>
          </form>
        )}
      </div>
    </article>
  )
}
