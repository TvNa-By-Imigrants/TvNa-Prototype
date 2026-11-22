import { createFileRoute } from "@tanstack/react-router"
import { PlacePage } from "@/components/page"

export const Route = createFileRoute("/place")({
  component: PlacePage,
})
