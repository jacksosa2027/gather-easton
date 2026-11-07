import { useCallback, useEffect, useRef, useState } from "react"
import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import { EventsApiError, eventsApi } from "../utils/eventsApi"

const PIN_STORAGE_KEY = "gedp:staff-pin"

function pendingSubmissions(events: CommunityEvent[]) {
  return events
    .filter((event) => event.status === "pending")
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""))
}

function forgetSavedPin() {
  try {
    window.sessionStorage.removeItem(PIN_STORAGE_KEY)
  } catch {
    // Staff can still lock the current panel when browser storage is blocked.
  }
}

export default function useStaffAccess() {
  const [pin, setPin] = useState("")
  const [staffPin, setStaffPin] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remembered, setRemembered] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<CommunityEvent[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [queueError, setQueueError] = useState<string | null>(null)
  const verification = useRef<AbortController | null>(null)

  const unlock = useCallback(async (value: string) => {
    if (verification.current) return
    const candidate = value.trim()
    if (!candidate) {
      setError("Enter the staff PIN.")
      return
    }

    const controller = new AbortController()
    verification.current = controller
    setIsChecking(true)
    setError(null)

    try {
      const events = await eventsApi.pending(candidate, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return

      let saved = false
      try {
        window.sessionStorage.setItem(PIN_STORAGE_KEY, candidate)
        saved = true
      } catch {
        // A successful API check still grants access for this open panel.
      }
      setRemembered(saved)
      setStaffPin(candidate)
      setPendingEvents(pendingSubmissions(events))
      setQueueError(null)
      setPin("")
    } catch (failure) {
      if (controller.signal.aborted) return
      setStaffPin(null)
      setPendingEvents([])
      if (
        failure instanceof EventsApiError &&
        (failure.status === 401 || failure.status === 403)
      ) {
        forgetSavedPin()
        setPin("")
        setError("That PIN wasn't accepted. Please try again.")
      } else {
        setError(
          failure instanceof EventsApiError
            ? failure.message
            : "We couldn't check the PIN. Check your connection and try again.",
        )
      }
    } finally {
      if (verification.current === controller) {
        verification.current = null
        setIsChecking(false)
      }
    }
  }, [])

  useEffect(() => {
    let savedPin: string | null = null
    try {
      savedPin = window.sessionStorage.getItem(PIN_STORAGE_KEY)
    } catch {
      // The PIN form remains usable without session storage.
    }
    if (savedPin?.trim()) {
      setPin(savedPin)
      void unlock(savedPin)
    }

    return () => {
      const request = verification.current
      verification.current = null
      request?.abort()
    }
  }, [unlock])

  const lock = useCallback(() => {
    const request = verification.current
    verification.current = null
    request?.abort()
    forgetSavedPin()
    setStaffPin(null)
    setPin("")
    setError(null)
    setRemembered(false)
    setIsChecking(false)
    setPendingEvents([])
    setQueueError(null)
    setIsRefreshing(false)
  }, [])

  const refresh = useCallback(async () => {
    if (!staffPin || verification.current) return
    const controller = new AbortController()
    verification.current = controller
    setIsRefreshing(true)
    setQueueError(null)

    try {
      const events = await eventsApi.pending(staffPin, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setPendingEvents(pendingSubmissions(events))
    } catch (failure) {
      if (controller.signal.aborted) return
      if (
        failure instanceof EventsApiError &&
        (failure.status === 401 || failure.status === 403)
      ) {
        lock()
        setError(
          "Your staff access is no longer valid. Enter the staff PIN again.",
        )
      } else {
        setQueueError(
          failure instanceof EventsApiError
            ? failure.message
            : "We couldn't refresh the queue. Check your connection and try again.",
        )
      }
    } finally {
      if (verification.current === controller) {
        verification.current = null
        setIsRefreshing(false)
      }
    }
  }, [staffPin, lock])

  return {
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
  }
}
