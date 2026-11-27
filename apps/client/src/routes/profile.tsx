import { createFileRoute } from "@tanstack/react-router"

import { NotBuiltPage, ProfilePage } from "@/components/page"
import { useProfileContext } from "@/lib/profile-context"

export const Route = createFileRoute("/profile")({
  validateSearch: (search: Record<string, unknown>): { handle?: string } => ({
    handle: typeof search.handle === "string" ? search.handle : undefined,
  }),
  component: ProfileRoute,
})

function ProfileRoute() {
  const { handle } = Route.useSearch()
  const { getProfile } = useProfileContext()

  // No handle yet means there is no profile to show in this prototype.
  if (!handle || !getProfile(handle)) {
    return <NotBuiltPage pageHref="/profile" />
  }

  return <ProfilePage handle={handle} />
}
