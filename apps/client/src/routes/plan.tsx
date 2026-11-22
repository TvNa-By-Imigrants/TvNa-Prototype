import { createFileRoute } from "@tanstack/react-router"
import { NotBuiltPage } from "@/components/page"

export const Route = createFileRoute("/plan")({
  component: () => <NotBuiltPage pageHref="/plan" />,
})
