import { createFileRoute } from "@tanstack/react-router"
import { NotBuiltPage } from "@/components/page"

export const Route = createFileRoute("/feed")({
  component: () => <NotBuiltPage pageHref="/feed" />,
})
