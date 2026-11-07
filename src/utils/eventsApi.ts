import type { CommunityEvent } from "../../supabase/functions/_shared/events"
import { projectId, publicAnonKey } from "../../utils/supabase/info"

export type CreateEventInput = Pick<CommunityEvent, "title" | "category" | "date" | "month" | "time" | "location" | "description"> & {
  year: number
  sourceUrl?: string
  image?: string
  alt?: string
}

type RequestOptions = {
  signal?: AbortSignal
}

type ApiRequestOptions = RequestOptions & {
  method?: "GET" | "POST"
  body?: unknown
  staffPin?: string
}

type ApiResults = {
  events: CommunityEvent[]
  event: CommunityEvent
}

export class EventsApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "EventsApiError"
    this.status = status
  }
}

const eventsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1f1ed1f9/events`

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

async function request<K extends keyof ApiResults>(
  resultKey: K,
  path: string,
  options: ApiRequestOptions,
): Promise<ApiResults[K]> {
  const headers = new Headers({ Authorization: `Bearer ${publicAnonKey}` })
  if (options.staffPin !== undefined)
    headers.set("X-Staff-Pin", options.staffPin)
  if (options.body !== undefined)
    headers.set("Content-Type", "application/json")

  const response = await fetch(`${eventsUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error
    throw new EventsApiError(
      response.ok
        ? "Invalid response from events API"
        : `Events API request failed (${response.status})`,
      response.status,
    )
  }

  if (!response.ok) {
    const message =
      isObject(data) &&
      (typeof data.error === "string" ? data.error : data.message)
    throw new EventsApiError(
      typeof message === "string" && message
        ? message
        : `Events API request failed (${response.status})`,
      response.status,
    )
  }

  const result = isObject(data) ? data[resultKey] : undefined
  if (resultKey === "events" ? !Array.isArray(result) : !isObject(result)) {
    throw new EventsApiError(
      "Invalid response from events API",
      response.status,
    )
  }
  return result as ApiResults[K]
}

export const eventsApi = {
  list(options: RequestOptions = {}): Promise<CommunityEvent[]> {
    return request("events", "", options)
  },

  create(
    input: CreateEventInput,
    options: RequestOptions = {},
  ): Promise<CommunityEvent> {
    return request("event", "", { ...options, method: "POST", body: input })
  },

  pending(
    staffPin: string,
    options: RequestOptions = {},
  ): Promise<CommunityEvent[]> {
    return request("events", "/pending", { ...options, staffPin })
  },

  approve(
    id: CommunityEvent["id"],
    staffPin: string,
    options: RequestOptions = {},
  ): Promise<CommunityEvent> {
    return request("event", `/${encodeURIComponent(id)}/approve`, {
      ...options,
      method: "POST",
      staffPin,
    })
  },

  reject(
    id: CommunityEvent["id"],
    staffPin: string,
    rejectionReason: string,
    options: RequestOptions = {},
  ): Promise<CommunityEvent> {
    return request("event", `/${encodeURIComponent(id)}/reject`, {
      ...options,
      method: "POST",
      staffPin,
      body: { rejectionReason },
    })
  },
}
