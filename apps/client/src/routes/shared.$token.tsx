import { createFileRoute } from "@tanstack/react-router"

import { SharedPlanView } from "@/components/page"
import { readSharedPlan } from "@/lib/share-plan"

export const Route = createFileRoute("/shared/$token")({
  validateSearch: (search: Record<string, unknown>) => ({
    d: typeof search.d === "string" ? search.d : "",
  }),
  component: SharedRoute,
})

function SharedRoute() {
  const { token } = Route.useParams()
  const { d } = Route.useSearch()
  const stops = readSharedPlan(d)

  return <SharedPlanView stops={stops} token={token} />
}
