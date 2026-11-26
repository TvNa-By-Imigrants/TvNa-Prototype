import type { PlanStopItem } from "@/lib/plan-context"

const MAX_PAYLOAD_LENGTH = 6000

function encodePayload(stops: PlanStopItem[]): string {
  const json = JSON.stringify(stops)
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function decodePayload(payload: string): PlanStopItem[] | null {
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (!Array.isArray(parsed)) return null

    return parsed.map((item: unknown): PlanStopItem => {
      if (typeof item !== "object" || item === null) {
        throw new Error("Invalid stop")
      }
      const stop = item as Record<string, unknown>
      if (
        typeof stop.placeId !== "string" ||
        typeof stop.name !== "string" ||
        typeof stop.area !== "string" ||
        typeof stop.image !== "string"
      ) {
        throw new Error("Invalid stop")
      }

      return {
        placeId: stop.placeId,
        name: stop.name,
        nameKm: typeof stop.nameKm === "string" ? stop.nameKm : null,
        area: stop.area,
        image: stop.image,
        lat: typeof stop.lat === "number" ? stop.lat : null,
        lng: typeof stop.lng === "number" ? stop.lng : null,
        startTime: typeof stop.startTime === "string" ? stop.startTime : undefined,
        endTime: typeof stop.endTime === "string" ? stop.endTime : undefined,
        tags: Array.isArray(stop.tags)
          ? stop.tags.filter((tag): tag is string => typeof tag === "string")
          : [],
      }
    })
  } catch {
    return null
  }
}

function createToken(): string {
  const uuid =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  return uuid.replace(/-/g, "").slice(0, 8)
}

export function createShareUrl(
  stops: PlanStopItem[],
  origin: string = typeof window === "undefined" ? "" : window.location.origin,
): string {
  const payload = encodePayload(stops)
  if (payload.length > MAX_PAYLOAD_LENGTH) {
    throw new Error("SHARE_LINK_TOO_LONG")
  }
  return `${origin}/shared/${createToken()}?d=${encodeURIComponent(payload)}`
}

export function readSharedPlan(
  payload: string | null | undefined,
): PlanStopItem[] | null {
  if (!payload) return null
  const decoded = decodePayload(payload)
  return decoded && decoded.length > 0 ? decoded : null
}
