import { useEffect, useRef } from "react"

type StaffReviewModalProps = {
  onClose: () => void
  returnFocusTo: HTMLElement | null
}

export default function StaffReviewModal({
  onClose,
  returnFocusTo,
}: StaffReviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

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
      if (event.shiftKey && document.activeElement === first) {
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
          <h3>Staff access required</h3>
          <p>
            Pending submissions are available only to authorized calendar staff.
          </p>
        </section>
      </div>
    </div>
  )
}
