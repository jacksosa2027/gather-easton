import { useEffect, useRef } from "react"
import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import useStaffAccess from "../hooks/useStaffAccess"
import PendingEventQueue from "./PendingEventQueue"

type StaffReviewModalProps = {
  onClose: () => void
  returnFocusTo: HTMLElement | null
  onApproved: (event: CommunityEvent) => void
}

export default function StaffReviewModal({
  onClose,
  returnFocusTo,
  onApproved,
}: StaffReviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLInputElement>(null)
  const accessHeadingRef = useRef<HTMLHeadingElement>(null)
  const {
    pin,
    setPin,
    staffPin,
    isChecking,
    error,
    remembered,
    unlock,
    lock,
    pendingEvents,
    isRefreshing,
    queueError,
    refresh,
    reviewing,
    reviewErrors,
    reviewMessage,
    review,
  } = useStaffAccess(onApproved)

  useEffect(() => {
    const previousFocus = returnFocusTo ?? document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.querySelector<HTMLButtonElement>(".modal-close")?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus()
    }
  }, [returnFocusTo])

  useEffect(() => {
    if (isChecking) {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>(".modal-close")
        ?.focus()
    } else {
      if (staffPin) accessHeadingRef.current?.focus()
      else pinRef.current?.focus()
    }
  }, [staffPin, isChecking])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    } else if (event.key === "Tab") {
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const first = controls?.[0]
      const last = controls?.[controls.length - 1]
      const activeControl = Array.from(controls ?? []).includes(
        document.activeElement as HTMLElement,
      )
      if (!activeControl) {
        event.preventDefault()
        if (event.shiftKey) last?.focus()
        else first?.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        id="staff-review-dialog"
        className="staff-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-review-title"
        aria-describedby="staff-review-description"
        ref={dialogRef}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close staff review"
        >
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <header className="staff-review-heading">
          <p className="section-kicker">For calendar staff</p>
          <h2 id="staff-review-title">Staff review</h2>
          <p id="staff-review-description">
            Review community submissions before they appear on the public
            calendar.
          </p>
        </header>
        <section className="staff-review-body" aria-label="Staff access">
          {staffPin ? (
            <>
              <div role="status" aria-live="polite">
                <h3 ref={accessHeadingRef} tabIndex={-1}>
                  Staff access unlocked
                </h3>
                <p>
                  {remembered
                    ? "Access is remembered in this tab. Lock staff review when you're finished."
                    : "Access is unlocked. Your browser could not remember the PIN, so you'll need to enter it again when you reopen staff review."}
                </p>
              </div>
              <button
                className="text-button staff-lock-button"
                type="button"
                onClick={lock}
              >
                Lock staff review
              </button>
              <PendingEventQueue
                events={pendingEvents}
                isRefreshing={isRefreshing}
                error={queueError}
                onRefresh={() => {
                  void refresh()
                }}
                reviewing={reviewing}
                reviewErrors={reviewErrors}
                reviewMessage={reviewMessage}
                onReview={(id, action, reason) => {
                  void review(id, action, reason)
                }}
              />
            </>
          ) : (
            <>
              <h3>Unlock staff review</h3>
              <p id="staff-pin-help">
                Enter the shared staff PIN to continue. Access is remembered for
                this tab.
              </p>
              <form
                className="staff-pin-form"
                aria-busy={isChecking}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (event.currentTarget.reportValidity()) void unlock(pin)
                }}
              >
                <label className="form-field">
                  <span>Staff PIN</span>
                  <input
                    id="staff-pin"
                    name="staffPin"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    disabled={isChecking}
                    aria-describedby={
                      error
                        ? "staff-pin-help staff-pin-error"
                        : "staff-pin-help"
                    }
                    ref={pinRef}
                  />
                </label>
                {error && (
                  <p
                    className="staff-pin-error"
                    id="staff-pin-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <button
                  className="primary-button"
                  type="submit"
                  disabled={isChecking}
                >
                  {isChecking ? "Checking PIN…" : "Unlock staff review"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
