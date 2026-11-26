import { describe, expect, it } from "vitest"
import type { PlanStopItem } from "@/lib/plan-context"
import {
  timeToMinutes,
  validatePlanStops,
} from "@/lib/plan-validation"

const baseStop1: PlanStopItem = {
  placeId: "stop-1",
  name: "First Place",
  area: "BKK1",
  image: "https://example.com/1.webp",
}

const baseStop2: PlanStopItem = {
  placeId: "stop-2",
  name: "Second Place",
  area: "Doun Penh",
  image: "https://example.com/2.webp",
}

const baseStop3: PlanStopItem = {
  placeId: "stop-3",
  name: "Third Place",
  area: "Toul Kork",
  image: "https://example.com/3.webp",
}

describe("plan-validation", () => {
  describe("timeToMinutes", () => {
    it("converts HH:mm strings to minutes from midnight", () => {
      expect(timeToMinutes("00:00")).toBe(0)
      expect(timeToMinutes("09:30")).toBe(570)
      expect(timeToMinutes("14:15")).toBe(855)
      expect(timeToMinutes("23:59")).toBe(1439)
    })

    it("returns null for invalid or missing time strings", () => {
      expect(timeToMinutes(undefined)).toBeNull()
      expect(timeToMinutes(null)).toBeNull()
      expect(timeToMinutes("")).toBeNull()
      expect(timeToMinutes("invalid")).toBeNull()
      expect(timeToMinutes("25:00")).toBeNull()
      expect(timeToMinutes("12:65")).toBeNull()
    })
  })

  describe("validatePlanStops", () => {
    it("produces no issues when stops have no times or valid sequential times", () => {
      const stops: PlanStopItem[] = [
        { ...baseStop1, startTime: "09:00", endTime: "10:30" },
        { ...baseStop2, startTime: "11:00", endTime: "12:30" },
        { ...baseStop3, startTime: "13:00", endTime: "14:00" },
      ]

      const validation = validatePlanStops(stops)
      expect(validation["stop-1"]?.issues).toHaveLength(0)
      expect(validation["stop-2"]?.issues).toHaveLength(0)
      expect(validation["stop-3"]?.issues).toHaveLength(0)
      expect(validation["stop-1"]?.hasError).toBe(false)
    })

    it("detects end time occurring before or equal to start time (intra-stop)", () => {
      const stops: PlanStopItem[] = [
        { ...baseStop1, startTime: "10:00", endTime: "09:30" },
        { ...baseStop2, startTime: "11:00", endTime: "11:00" },
      ]

      const validation = validatePlanStops(stops)
      expect(validation["stop-1"]?.hasError).toBe(true)
      expect(validation["stop-1"]?.issues[0]?.code).toBe("END_BEFORE_START")
      expect(validation["stop-2"]?.hasError).toBe(true)
      expect(validation["stop-2"]?.issues[0]?.code).toBe("END_BEFORE_START")
    })

    it("detects stops scheduled out of sequential chronological order", () => {
      const stops: PlanStopItem[] = [
        { ...baseStop1, startTime: "14:00", endTime: "15:00" },
        { ...baseStop2, startTime: "09:00", endTime: "10:00" },
      ]

      const validation = validatePlanStops(stops)
      expect(validation["stop-1"]?.hasError).toBe(false)
      expect(validation["stop-2"]?.hasError).toBe(true)
      expect(validation["stop-2"]?.issues.some((i) => i.code === "OUT_OF_SEQUENCE")).toBe(true)
      expect(validation["stop-2"]?.issues[0]?.prevStopName).toBe("First Place")
    })

    it("detects overlapping times between stops", () => {
      const stops: PlanStopItem[] = [
        { ...baseStop1, startTime: "10:00", endTime: "11:30" },
        { ...baseStop2, startTime: "11:00", endTime: "12:30" },
      ]

      const validation = validatePlanStops(stops)
      expect(validation["stop-1"]?.hasError).toBe(false)
      expect(validation["stop-2"]?.hasWarning).toBe(true)
      expect(validation["stop-2"]?.issues.some((i) => i.code === "TIME_OVERLAP")).toBe(true)
      expect(validation["stop-2"]?.issues[0]?.prevStopName).toBe("First Place")
    })

    it("detects overlap when subsequent stop starts at same time as previous stop", () => {
      const stops: PlanStopItem[] = [
        { ...baseStop1, startTime: "10:00" },
        { ...baseStop2, startTime: "10:00" },
      ]

      const validation = validatePlanStops(stops)
      expect(validation["stop-2"]?.issues.some((i) => i.code === "TIME_OVERLAP")).toBe(true)
    })
  })
})
