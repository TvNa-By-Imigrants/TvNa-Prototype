import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { SharedPlanView } from "@/components/page"
import type { PlanStopItem } from "@/lib/plan-context"
import { fetchSharedPlan } from "@/lib/plans-api"

export const Route = createFileRoute("/shared/$token")({
  validateSearch: (search: Record<string, unknown>) => ({
    d: typeof search.d === "string" ? search.d : "",
  }),
  component: SharedRoute,
})

function SharedRoute() {
  const { token } = Route.useParams()
  return <SharedPlanRoute token={token} />
}

export function SharedPlanRoute({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ["shared-plan", token],
    queryFn: () => fetchSharedPlan(token),
  })

  const stops: PlanStopItem[] | null = query.data
    ? query.data.items.map((item) => ({
        placeId: item.placeId,
        name: item.placeName,
        nameKm: item.nameKm,
        area: item.area,
        image: item.image,
        lat: item.lat,
        lng: item.lng,
        startTime: item.startTime ?? undefined,
        endTime: item.endTime ?? undefined,
        tags: item.tags,
      }))
    : null

  return (
    <SharedPlanView
      stops={stops}
      token={token}
      isLoading={query.isPending}
    />
  )
}
