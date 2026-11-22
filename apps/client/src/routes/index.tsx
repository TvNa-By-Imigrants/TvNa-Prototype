import { createFileRoute } from "@tanstack/react-router"
import { HomeView } from "@/components/page"

export const Route = createFileRoute("/")({
  component: HomeView,
})
