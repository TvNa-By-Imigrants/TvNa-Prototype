import { createFileRoute } from "@tanstack/react-router"
import { PlanPage } from "@/components/page"

export const Route = createFileRoute("/plan")({
  component: PlanPage,
})
