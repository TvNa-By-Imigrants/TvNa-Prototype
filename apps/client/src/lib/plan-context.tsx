import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Place } from "@repo/contracts"

const STORAGE_KEY = "tvna.plan.stops"

export type PlanStopItem = {
  placeId: string
  name: string
  nameKm?: string | null
  area: string
  image: string
  lat?: number | null
  lng?: number | null
  startTime?: string
  endTime?: string
  tags?: string[]
}

type PlanContextValue = {
  stops: PlanStopItem[]
  replaceStops: (stops: PlanStopItem[]) => void
  addStop: (place: Place) => void
  removeStop: (placeId: string) => void
  reorderStops: (activeId: string, overId: string) => void
  updateStop: (
    placeId: string,
    patch: Partial<Pick<PlanStopItem, "startTime" | "endTime" | "tags">>,
  ) => void
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function reorderStopList(
  stops: PlanStopItem[],
  activeId: string,
  overId: string,
): PlanStopItem[] {
  const from = stops.findIndex((stop) => stop.placeId === activeId)
  const to = stops.findIndex((stop) => stop.placeId === overId)
  if (from < 0 || to < 0 || from === to) return stops

  const next = [...stops]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved!)
  return next
}

function readStops(): PlanStopItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is PlanStopItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PlanStopItem).placeId === "string",
    )
  } catch {
    return []
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [stops, setStops] = useState<PlanStopItem[]>(readStops)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stops))
    } catch {
      // Storage may be unavailable (private mode, quota); keep in-memory state.
    }
  }, [stops])

  const addStop = (place: Place) => {
    setStops((current) =>
      current.some((stop) => stop.placeId === place.id)
        ? current
        : [
            ...current,
            {
              placeId: place.id,
              name: place.name,
              nameKm: place.nameKm,
              area: place.area,
              image: place.image,
              lat: place.lat,
              lng: place.lng,
              tags: place.category ? [place.category.toLowerCase()] : [],
            },
          ],
    )
  }

  const replaceStops = (nextStops: PlanStopItem[]) => {
    setStops(nextStops)
  }

  const removeStop = (placeId: string) => {
    setStops((current) => current.filter((stop) => stop.placeId !== placeId))
  }

  const reorderStops = (activeId: string, overId: string) => {
    setStops((current) => reorderStopList(current, activeId, overId))
  }

  const updateStop = (
    placeId: string,
    patch: Partial<Pick<PlanStopItem, "startTime" | "endTime" | "tags">>,
  ) => {
    setStops((current) =>
      current.map((stop) =>
        stop.placeId === placeId ? { ...stop, ...patch } : stop,
      ),
    )
  }

  return (
    <PlanContext.Provider
      value={{ stops, replaceStops, addStop, removeStop, reorderStops, updateStop }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext)
  if (!context) {
    throw new Error("usePlan must be used within a <PlanProvider>")
  }
  return context
}
