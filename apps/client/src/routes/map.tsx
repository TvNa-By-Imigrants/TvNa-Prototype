import { createFileRoute } from "@tanstack/react-router"
import { MapPage } from "@/components/page"

export const Route = createFileRoute("/map")({
  validateSearch: (search: Record<string, unknown>) => ({
    place: typeof search.place === "string" ? search.place : undefined,
  }),
  component: MapRoute,
})

function MapRoute() {
  const { place } = Route.useSearch()
  return <MapPage placeId={place} />
}
