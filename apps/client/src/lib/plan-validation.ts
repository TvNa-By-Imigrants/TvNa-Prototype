import type { PlanStopItem } from "./plan-context"

export const DEFAULT_PLAN_TAGS = [
  "visit",
  "eat",
  "cafe",
  "stay",
  "culture",
  "nature",
] as const

export type StopValidationIssue = {
  type: "error" | "warning"
  code: "END_BEFORE_START" | "OUT_OF_SEQUENCE" | "TIME_OVERLAP"
  messageKey: string
  message: string
  prevStopName?: string
}

export type StopValidationResult = {
  placeId: string
  issues: StopValidationIssue[]
  hasError: boolean
  hasWarning: boolean
}

export type StopValidationMap = Record<string, StopValidationResult>

export type ValidationMessages = {
  endBeforeStart: string
  outOfSequence: (prevName: string) => string
  timeOverlap: (prevName: string) => string
}

export const defaultValidationMessages: ValidationMessages = {
  endBeforeStart: "End time must be after start time",
  outOfSequence: (prevName) =>
    `Scheduled out of sequence: occurs before ${prevName}`,
  timeOverlap: (prevName) => `Time overlap: overlaps with ${prevName}`,
}

export function timeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null
  const parts = timeStr.trim().split(":")
  if (parts.length < 2) return null
  const h = parseInt(parts[0] ?? "", 10)
  const m = parseInt(parts[1] ?? "", 10)
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

export function validatePlanStops(
  stops: PlanStopItem[],
  messages: ValidationMessages = defaultValidationMessages,
): StopValidationMap {
  const result: StopValidationMap = {}

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]!
    const issues: StopValidationIssue[] = []
    const startM = timeToMinutes(stop.startTime)
    const endM = timeToMinutes(stop.endTime)

    // 1. Intra-stop check: end time must be strictly after start time
    if (startM !== null && endM !== null && endM <= startM) {
      issues.push({
        type: "error",
        code: "END_BEFORE_START",
        messageKey: "planPage.endBeforeStart",
        message: messages.endBeforeStart,
      })
    }

    // 2. Inter-stop check against preceding stops.
    // O(n^2) over the stop list, which is lightweight for typical single-day itineraries (<30 stops).
    for (let p = 0; p < i; p++) {
      const prevStop = stops[p]!
      const pStart = timeToMinutes(prevStop.startTime)
      const pEnd = timeToMinutes(prevStop.endTime)
      const prevName = prevStop.name || `Stop ${p + 1}`

      // Out of sequence check: if this stop starts earlier than a previous stop,
      // report out-of-sequence and skip overlap check since order is already reversed.
      if (startM !== null && pStart !== null && startM < pStart) {
        issues.push({
          type: "error",
          code: "OUT_OF_SEQUENCE",
          messageKey: "planPage.outOfSequence",
          prevStopName: prevName,
          message: messages.outOfSequence(prevName),
        })
        continue
      }

      // Overlap check
      if (startM !== null && pStart !== null) {
        let isOverlapping = false

        if (pEnd !== null && endM !== null) {
          // Interval overlap: max(start1, start2) < min(end1, end2)
          isOverlapping = Math.max(pStart, startM) < Math.min(pEnd, endM)
        } else if (pEnd !== null) {
          // Current start falls inside previous stop duration
          isOverlapping = startM >= pStart && startM < pEnd
        } else if (endM !== null) {
          // Current stop covers previous start
          isOverlapping = pStart >= startM && pStart < endM
        } else {
          // Neither has end time; overlapping if exactly same start time
          isOverlapping = startM === pStart
        }

        if (isOverlapping) {
          issues.push({
            type: "warning",
            code: "TIME_OVERLAP",
            messageKey: "planPage.timeOverlap",
            prevStopName: prevName,
            message: messages.timeOverlap(prevName),
          })
        }
      }
    }

    result[stop.placeId] = {
      placeId: stop.placeId,
      issues,
      hasError: issues.some((iss) => iss.type === "error"),
      hasWarning: issues.some((iss) => iss.type === "warning"),
    }
  }

  return result
}
